
#todo reorder
collab = do
  action:
    _info: (block) ->
      [node, doc] = [block, collab.doc]
      if !doc.data => return []
      while node and node.parentNode and !node.getAttribute(\base-block) => node = node.parentNode
      if !node or !node.getAttribute or !node.getAttribute \base-block => return []
      idx = Array.from(node.parentNode.childNodes).indexOf(node)
      type = node.getAttribute \base-block
      return [node, doc, idx, type]

    move-block: (src, des) ->
      collab.doc.submitOp [{p: ["child", src], lm: des}]
    delete-block: (block) ->
      [node, doc, idx, type] = @_info block
      if !node => return
      doc.submitOp [{p: ["child", idx], ld: doc.data.child[idx]}]
    insert-block: (block) ->
      [node, doc, idx, type] = @_info block
      if !node => return
      doc.submitOp [{
        p: ["child", idx], li: {content: @block-content(node), type: type}
      }]
    # always innerHTML the root will lose event handler inside it. need more sophisticated approach
    block-content: (node) -> 
      inner = Array.from(node.childNodes).filter(-> /inner/.exec(it.getAttribute(\class))).0
      return (inner or {}).innerHTML
    edit-block: (block) ->
      [node, doc, idx, type] = @_info block
      if !node => return
      content = do
        last: (doc.data.child[idx] or {}).content or ''
        now: @block-content(node)
      diffs = fast-diff content.last, content.now
      if !doc.data.child[idx] => doc.submitOp [{p: ["child", idx], li: {content: "", type: type}}]
      offset = 0
      for diff in diffs
        if diff.0 == 0 => offset += diff.1.length
        else if diff.0 == 1 =>
          doc.submitOp [{p: ["child", idx, 'content', offset], si: diff.1}]
          offset += diff.1.length
        else
          doc.submitOp [{p: ["child", idx, 'content', offset], sd: diff.1}]
    cursor: (user, cursor) ->
      if !user or !collab.doc or !collab.doc.data => return
      collab.doc.submitOp [{
        p: ["collaborator", user.key, "cursor"], oi: cursor
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
        for v,idx in doc.data.child => editor.block.prepare v.content, v.type, idx
        for k,v of doc.data.collaborator => editor.collaborator.add v, k
      editor.loading.toggle false
    (e) <~ doc.fetch
    if !doc.type => ret = doc.create {attr: {}, child: [], collaborator: {}}
    doc.subscribe (ops, source) ~> @handle ops, source
    doc.on \op, (ops, source) ~> @handle ops, source
    collab.action.join user

  handle: (ops, source) ->
    if !ops or source => return
    for op in ops =>
      if op.si or op.sd =>
        node = @root.childNodes[op.p.1]
        inner = Array.from(node.childNodes).filter(-> /inner/.exec(it.getAttribute(\class))).0
        inner.innerHTML = @doc.data.child[op.p.1].content
        @editor.block.prepare node, node.getAttribute(\base-block), op.p.1, true
      else if op.li => @editor.block.prepare op.li.content, op.li.type, op.p.1
      else if op.ld =>
        node = @root.childNodes[op.p.1]
        node.parentNode.removeChild(node)
      else if op.lm =>
        [src, des] = [op.p.1, op.lm]
        node = @root.childNodes[src]
        @root.removeChild node
        @root.insertBefore node, @root.childNodes[des]
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
    panel.style.left = "#{800 + Math.round((window.innerWidth - 800)/2)}px"
    panel.style.right = "auto"

