collab = do
  history: do
    backward: []
    forward: []
    redo: ->
      while true
        ret = @forward.splice(0, 1).0
        if !ret => return
        backward.push ret
        # set source = false so our handler will deal with it
        collab.doc.submitOp ret.op, {force-apply: false}
        if !ret.option.nobreak => break

    undo: ->
      group = null
      while true
        ret = @backward.pop it
        if !ret => return
        @forward.splice 0, 0, ret
        # set source = false so our handler will deal with it
        collab.doc.submitOp sharedb.types.map.json0.invert(ret.op), {source: {force-apply: true}}
        if ret.option and ret.option.group and !group => group = ret.option.group
        if group and (!ret.option or ret.option.group != group) => break
        if !(group or (ret.option and ret.option.nobreak)) => break

    # nobreak: it's an invisible action, so keep on undo/redo the next op.
    log: (op, option = {}) ->
      if option.ignore => return
      @backward.push {op, option}
      if @forward.length => @forward.splice 0

  action:
    submitOp: (op, option = {}) ->
      collab.history.log op, option
      collab.doc.submitOp op
    info: (block) ->
      [node, doc] = [block, collab.doc]
      if !doc or !doc.data => return []
      while node and node.parentNode and !node.getAttribute(\base-block) => node = node.parentNode
      if !node or !node.getAttribute or !node.parentNode or !node.getAttribute \base-block => return []
      idx = Array.from(node.parentNode.childNodes).indexOf(node)
      type = node.getAttribute \base-block
      eid = node.getAttribute \eid
      return [node, doc, idx, type, eid]
    check-path: (value, path, initValue = {}, option = {ignore: true}) ->
      if value => return
      @submitOp [{p: path, oi: initValue}], option
    set-public: (is-public) ->
      @check-path collab.doc.data.attr, ["attr"]
      attr = collab.doc.data.attr
      if !attr or attr.is-public == is-public => return
      @submitOp [{p: ["attr"], od: attr, oi: {} <<< attr <<< {is-public}}], {ignore: true}
    set-thumbnail: (thumbnail = null) ->
      if !thumbnail => return
      doc = collab.doc
      @check-path doc.data.attr, ["attr"]
      if !doc.data.attr.thumbnail =>
        @submitOp [{p: ["attr"], od: doc.data.attr, oi: {} <<< doc.data.attr <<< {thumbnail}}], {ignore: true}
      else
        @submitOp([
          {p: ["attr", "thumbnail", 0], sd: doc.data.attr.thumbnail}
          {p: ["attr", "thumbnail", 0], si: thumbnail}
        ], {ignore: true})

    set-title: (manual-title) ->
      if @set-title.handler =>
        clearTimeout @set-title.handler
        @set-title.handler = null
      @set-title.handler = setTimeout (~>
        doc = collab.doc
        title = manual-title
        if !title =>
          list = Array.from(document.querySelector('#editor .inner').querySelectorAll('h1,h2,h3'))
          list.sort (a,b) -> if a.nodeName == b.nodeName => 0 else if a.nodeName > b.nodeName => 1 else -1
          if list.0 => title = list.0.innerText
        if !title => title = "untitled"
        @check-path doc.data.attr, ["attr"]
        if doc.data.attr and doc.data.attr.title == title => return
        if title.length > 60 => title = title.substring(0, 57) + "..."
        if doc.data.attr and doc.data.attr.title =>
          @submitOp([
            {p: ["attr", "title", 0], sd: doc.data.attr.title}
            {p: ["attr", "title", 0], si: title}
          ], {ignore: true})
        else
          @submitOp [{p: ["attr"], oi: {} <<< (doc.data.attr or {}) <<< {title}}], {ignore: true}
      ), 1000

    move-block: (src, des) ->
      @submitOp [{p: ["child", src], lm: des}]
    delete-block: (block) ->
      [node, doc, idx, type] = @info block
      if !node => return
      @submitOp [{p: ["child", idx], ld: doc.data.child[idx]}]
    insert-block: (block) ->
      [node, doc, idx, type, eid] = @info block
      if !node => return
      @submitOp [{ p: ["child", idx], li: {content: @block-content(node), type: type, eid: eid} }]
      @set-title!
      @edit-style block
    # always innerHTML the root will lose event handler inside it. need more sophisticated approach
    block-content: (node) ->
      inner = Array.from(node.childNodes).filter(-> /inner/.exec(it.getAttribute(\class))).0
      if inner.querySelector("[auto-content]") =>
        inner = inner.cloneNode true
        Array.from(inner.querySelectorAll("[auto-content]")).map (me) ->
          Array.from(me.childNodes).map (child) -> me.removeChild(child)
      return puredom.sanitize((inner or {}).innerHTML)
    str-diff: (path = [], oldstr = '', newstr = '', option = {}) ->
      [doc, diffs, offset] = [collab.doc, fast-diff(oldstr, newstr), 0]
      ops = []
      for diff in diffs
        if diff.0 == 0 => offset += diff.1.length
        else if diff.0 == 1 =>
          ops.push {p: path ++ [offset], si: diff.1}
          offset += diff.1.length
        else
          ops.push {p: path ++ [offset], sd: diff.1}
      @submitOp(ops, option) if ops.length
    edit-style: (block, is-root = false) ->
      doc = collab.doc
      style = block.getAttribute("style")
      if is-root =>
        style = style.replace /width:\d+px;?/, ''
        [obj, path] = [doc.data, []]
        # TODO legacy. remove errant-typed style. remove it in the future when no doc use style as {}
        if obj.style and typeof(obj.style) == typeof({}) => @submitOp [{p: path ++ ["style"], od: obj.style}]
        if !obj.style => return @submitOp [{p: path, od: obj, oi: {} <<< obj <<< {style}}]
      else
        [node, doc, idx, type] = @info block
        if !node or !doc.data.child[idx] => return
        [obj, path] = [doc.data.child[idx], ["child", idx]]
        if !obj.style => return @submitOp [{p: path, ld: obj, li: {} <<< obj <<< {style}}]
      @str-diff (path ++ <[style]>), obj.style , style

    edit-block: (block, option = {}) ->
      [node, doc, idx, type] = @info block
      if !node => return
      content = do
        last: (doc.data.child[idx] or {}).content or ''
        now: @block-content(node)
      diffs = fast-diff content.last, content.now
      if !doc.data.child[idx] =>
        @submitOp [{p: ["child", idx], li: {content: "", type: type, style: ""}}], option
      offset = 0
      @str-diff [\child, idx, \content], content.last, content.now, option
      @set-title!

    cursor: (user, cursor) ->
      if !user or !(user.key or user.guestkey) or !collab.doc or !collab.doc.data => return
      key = user.key or user.guestkey
      collab.connection.send cursor: { action: \update, data: {cursor} }

    css:
      prepare: ->
        if !collab.doc.data.css => collab.action.submitOp [{p: ["css"], oi: {links: [], inline: "", theme: {}}}]
        return collab.doc.data.css
      edit-inline: (value) ->
        css = @prepare!
        collab.action.str-diff ["css", "inline"], (css.inline or ''), value
      add-link: (link) ->
        css = @prepare!
        collab.action.submitOp [{p: ["css", "links", css.links.length], li: link}]
      remove-link: (link) ->
        css = @prepare!
        idx = css.links.indexOf(link)
        if !~idx => return
        collab.action.submitOp [{p: ["css", "links", idx], ld: link}]
      edit-theme: (obj) ->
        css = @prepare!
        collab.action.submitOp [{p: ["css", "theme"], od: css.theme, oi: obj}]

  init: (root, editor) ->
    [@root, @editor] = [root, editor]
    @root.innerHTML = ''
    path = window.location.pathname
    @socket = new WebSocket "#{if editor.server.scheme == \http => \ws else \wss}://#{editor.server.domain}/ws"
    offline = -> editor.online.toggle false
    if @socket.readyState >= 2 => return offline!
    @socket.addEventListener \close, (evt) -> if evt.code != 3001 => return offline!
    @socket.addEventListener \error, (evt) ~> if @socket.readyState == 1 => return offline!
    @connection = new sharedb.Connection @socket
    # handle cursor information
    @connection.on \receive, ->
      if it.data and !it.data.cursor => return
      [cursor, it.data] = [it.data.cursor, null]
      editor.collaborator.handle cursor
    @pageid = if /^\/page\//.exec(path) => path.replace(/^\/page\//,'').replace(/\/$/, '') else null
    @doc = doc = @connection.get \doc, @pageid
    doc.on \load, ~>
      if doc.data =>
        # TODO should purge data.child ( check if v is well-formed )
        for v,idx in doc.data.child =>
          if v => editor.block.prepare v.content, {
            name: v.type, idx: idx, redo: false, style: v.style or '', source: false, eid: v.eid
          }
        editor.block.init!
        editor.page.prepare doc.data
        editor.css.prepare doc.data.css or {}
      editor.loading.toggle false
      editor.collaborator.init!
    (e) <~ doc.fetch
    if e => return editor.online.toggle false, {code: 403}
    # workaround: wait for a second so doc is updated.
    <~ setTimeout _, 500
    doc.subscribe (ops, source) ~> @handle ops, source
    doc.on \op, (ops, source) ~> @handle ops, source
    if !doc.type => ret = doc.create {attr: {}, style: '', child: [], collaborator: {}}
  handle: (ops, source) ->
    if !ops or (source and !source.force-apply) => return
    for op in ops =>
      if op.si or op.sd =>
        if op.p.2 == \style =>
          node = @root.childNodes[op.p.1]
          @editor.block.style.update node, (@doc.data.child[op.p.1].style or '')
        else if op.p.0 == \style => @root.style = @doc.data.style or ''
        else if op.p.0 == \css and op.p.1 == \inline => @editor.css.inline.update @doc.data.css.inline
        else if op.p.0 == \attr => # noop
        else if op.p.0 == \child and op.p.2 == \content and op.p.length == 4 => # should be content editing
          node = @root.childNodes[op.p.1]
          @editor.block.prepare-async(node, {
            name: node.getAttribute(\base-block), idx: op.p.1, redo: true
            content: @doc.data.child[op.p.1].content, source: false
          })
      # there are ops like {li: ..., ld: ...} so we have to handle them in one ifelse
      else if op.li or op.ld =>
        if op.ld =>
          if op.p.0 == \child =>
            node = @root.childNodes[op.p.1]
            node.parentNode.removeChild(node)
            @editor.block.indexing!
            node.deleted = true
            @editor.handles.hide node
          else if op.p.0 == \css and op.p.1 == \links => @editor.css.links.remove op.ld
        if op.li =>
          if op.p.0 == \child =>
            @editor.block.prepare op.li.content, {
              name: op.li.type, idx: op.p.1, redo: false, style: op.li.style, source: false, eid: op.li.eid
            }
            @editor.block.indexing!
          else if op.p.0 == \css and op.p.1 == \links => @editor.css.links.add op.li

      else if op.lm? =>
        [src, des] = [op.p.1, op.lm]
        if src != des =>
          node = @root.childNodes[src]
          desnode = @root.childNodes[des + (if src < des => 1 else 0)]
          @root.removeChild node
          if !desnode => @root.appendChild node
          else @root.insertBefore node, desnode
          @editor.block.indexing!
      else if op.oi =>
        if op.p.0 == \attr => collab.editor.page.share.set-public @doc.data.attr.is-public
        else if op.p.0 == \css => collab.editor.css.theme.update op.oi
      else if op.od =>

angular.module \webedit
  ..service \collaborate, <[$rootScope]> ++ ($rootScope) -> return collab
  ..controller \collabInfo, <[$scope $http]> ++ ($scope, $http) ->
    panel = document.querySelector \#collab-info
    panel.style.left = "#{1024 + Math.round((window.innerWidth - 1024)/2)}px"
    panel.style.right = "auto"

