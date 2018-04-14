collab = do
  action:
    info: (block) ->
      [node, doc] = [block, collab.doc]
      if !doc or !doc.data => return []
      while node and node.parentNode and !node.getAttribute(\base-block) => node = node.parentNode
      if !node or !node.getAttribute or !node.getAttribute \base-block => return []
      idx = Array.from(node.parentNode.childNodes).indexOf(node)
      type = node.getAttribute \base-block
      return [node, doc, idx, type]
    set-title: (manual-title) ->
      if @set-title.handler =>
        clearTimeout @set-title.handler
        @set-title.handler = null
      @set-title.handler = setTimeout (->
        doc = collab.doc
        title = manual-title
        if !title =>
          list = Array.from(document.querySelector('#editor .inner').querySelectorAll('h1,h2,h3'))
          list.sort (a,b) -> if a.nodeName == b.nodeName => 0 else if a.nodeName > b.nodeName => 1 else -1
          if list.0 => title = list.0.innerText
        if !title => title = "untitled"
        if doc.data.attr.title == title => return
        if title.length > 60 => title = title.substring(0, 57) + "..."
        if doc.data.attr.title =>
          doc.submitOp [{p: ["attr", "title", 0], sd: doc.data.attr.title}]
          doc.submitOp [{p: ["attr", "title", 0], si: title}]
        else
          doc.submitOp [{p: ["attr"], oi: {} <<< doc.data.attr <<< {title}}]
      ), 1000

    move-block: (src, des) ->
      collab.doc.submitOp [{p: ["child", src], lm: des}]
    delete-block: (block) ->
      [node, doc, idx, type] = @info block
      if !node => return
      doc.submitOp [{p: ["child", idx], ld: doc.data.child[idx]}]
    insert-block: (block) ->
      [node, doc, idx, type] = @info block
      if !node => return
      doc.submitOp [{
        p: ["child", idx], li: {content: @block-content(node), type: type}
      }]
      @set-title!
    # always innerHTML the root will lose event handler inside it. need more sophisticated approach
    block-content: (node) ->
      inner = Array.from(node.childNodes).filter(-> /inner/.exec(it.getAttribute(\class))).0
      if inner.querySelector("[auto-content]") =>
        inner = inner.cloneNode true
        Array.from(inner.querySelectorAll("[auto-content]")).map (me) ->
          Array.from(me.childNodes).map (child) -> me.removeChild(child)
      return DOMPurify.sanitize((inner or {}).innerHTML)
    str-diff: (path = [], oldstr = '', newstr = '') ->
      [doc, diffs, offset] = [collab.doc, fast-diff(oldstr, newstr), 0]
      for diff in diffs
        if diff.0 == 0 => offset += diff.1.length
        else if diff.0 == 1 =>
          doc.submitOp [{p: path ++ [offset], si: diff.1}]
          offset += diff.1.length
        else
          doc.submitOp [{p: path ++ [offset], sd: diff.1}]
    edit-style: (block, is-root = false) ->
      doc = collab.doc
      style = block.getAttribute("style")
      if is-root =>
        style = style.replace /width:\d+px;?/, ''
        [obj, path] = [doc.data, []]
        if !obj.style => return doc.submitOp [{p: path, od: obj, oi: {} <<< obj <<< {style}}]
      else
        [node, doc, idx, type] = @info block
        if !node or !doc.data.child[idx] => return
        [obj, path] = [doc.data.child[idx], ["child", idx]]
        if !obj.style => return doc.submitOp [{p: path, ld: obj, li: {} <<< obj <<< {style}}]
      @str-diff (path ++ <[style]>), obj.style, style

    edit-block: (block) ->
      [node, doc, idx, type] = @info block
      if !node => return
      content = do
        last: (doc.data.child[idx] or {}).content or ''
        now: @block-content(node)
      diffs = fast-diff content.last, content.now
      if !doc.data.child[idx] => doc.submitOp [{p: ["child", idx], li: {content: "", type: type, style: ""}}]
      offset = 0
      @str-diff [\child, idx, \content], content.last, content.now
      @set-title!

    cursor: (user, cursor) ->
      if !user or !collab.doc or !collab.doc.data => return
      console.log "cursor: ", collab.doc.data, user.key
      collab.doc.submitOp [{
        p: ["collaborator", user.key, "cursor"], od: collab.doc.data.collaborator[user.key].cursor, oi: cursor
      }]
    join: (user) ->
      if !collab.doc or !collab.doc.data => return
      if !user => user = {displayname: "guest", key: Math.random!toString(16).substring(2), guest: true}
      collab.editor.collaborator.add user, user.key
      if !collab.doc.{}collaborator[user.key] =>
        collab.doc.submitOp [{
          p: ["collaborator", user.key], oi: (user{key,displayname,guest} <<< jointime: new Date!getTime!)
        }]
    exit: (user) ->
      if !collab.doc or !collab.doc.data => return
      if collab.doc.data.{}collaborator[user.key] =>
        collab.editor.collaborator.remove user, user.key
        collab.doc.submitOp [{
          p: ["collaborator", user.key], od: collab.doc.data.collaborator[user.key]
        }]
  init: (root, editor, user) ->
    [@root, @editor] = [root, editor]
    @root.innerHTML = ''
    path = window.location.pathname
    @socket = new WebSocket "#{if editor.server.scheme == \http => \ws else \wss}://#{editor.server.domain}/ws"
    offline = -> editor.online.toggle false
    if @socket.readyState >= 2 => return offline!
    @socket.addEventListener \close, (evt) -> if evt.code != 3001 => return offline!
    @socket.addEventListener \error, (evt) ~> if @socket.readyState == 1 => return offline!
    @connection = new sharedb.Connection @socket
    @pageid = if /^\/page\//.exec(path) => path.replace(/^\/page\//,'').replace(/\/$/, '') else null
    @doc = doc = @connection.get \doc, @pageid
    doc.on \load, ->
      if doc.data =>
        # TODO should purge data.child ( check if v is well-formed )
        for v,idx in doc.data.child =>
          if v => editor.block.prepare v.content, v.type, idx, false, v.style or ''
        editor.block.init!
        for k,v of doc.data.collaborator => editor.collaborator.add v, k
        editor.page.prepare doc.data
      editor.loading.toggle false
    (e) <~ doc.fetch
    if !doc.type => ret = doc.create {attr: {}, style: {}, child: [], collaborator: {}}
    doc.subscribe (ops, source) ~> @handle ops, source
    doc.on \op, (ops, source) ~> @handle ops, source
    collab.action.join user

  handle: (ops, source) ->
    if !ops or source => return
    for op in ops =>
      if op.si or op.sd =>
        if op.p.2 == \style =>
          node = @root.childNodes[op.p.1]
          node.style = @doc.data.child[op.p.1].style or ''
        else if op.p.0 == \style => @root.style = @doc.data.style or ''
        else if op.p.0 == \attr => # noop
        else if op.p.0 == \child and op.p.2 == \content and op.p.length == 4 => # should be content editing
          node = @root.childNodes[op.p.1]
          inner = Array.from(node.childNodes).filter(-> /inner/.exec(it.getAttribute(\class))).0
          inner.innerHTML = DOMPurify.sanitize(@doc.data.child[op.p.1].content)
          @editor.block.prepare node, node.getAttribute(\base-block), op.p.1, true
      else if op.li => @editor.block.prepare op.li.content, op.li.type, op.p.1, op.li.style
      else if op.ld =>
        node = @root.childNodes[op.p.1]
        node.parentNode.removeChild(node)
      else if op.lm? =>
        [src, des] = [op.p.1, op.lm]
        if src != des =>
          node = @root.childNodes[src]
          desnode = @root.childNodes[des + (if src < des => 1 else 0)]
          @root.removeChild node
          if !desnode => @root.appendChild node
          else @root.insertBefore node, desnode
      else if op.oi =>
        if op.p.0 == \collaborator =>
          if op.p.2 == \cursor => @editor.collaborator.update @doc.data.collaborator[op.p.1], op.p.1
          # @editor.collaborator.cursor @doc.data.collaborator[op.p.1], op.oi
          else @editor.collaborator.add op.oi, op.p.1
      else if op.od =>
        if op.p.0 == \collaborator => @editor.collaborator.remove op.od, op.p.1


angular.module \webedit
  ..service \collaborate, <[$rootScope]> ++ ($rootScope) -> return collab
  ..controller \collabInfo, <[$scope $http]> ++ ($scope, $http) ->
    panel = document.querySelector \#collab-info
    panel.style.left = "#{1024 + Math.round((window.innerWidth - 1024)/2)}px"
    panel.style.right = "auto"

