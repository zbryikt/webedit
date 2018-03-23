
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
    block-content: (node) -> node.querySelector('.block-item > .inner').innerHTML
    edit-block: (block) ->
      [node, doc, idx, type] = @_info block
      if !node => return
      content = do
        last: (doc.data.child[idx] or {}).content or ''
        now: @block-content(node)
      diffs = fast-diff content.last, content.now
      if !doc.data.child[idx] =>
        doc.submitOp [{p: ["child", idx], li: {content: "", type: type}}]
      offset = 0
      for diff in diffs
        if diff.0 == 0 => offset += diff.1.length
        else if diff.0 == 1 =>
          doc.submitOp [{p: ["child", idx, 'content', offset], si: diff.1}]
          offset += diff.1.length
        else
          doc.submitOp [{p: ["child", idx, 'content', offset], sd: diff.1}]

  init: (root, block-manager) ->
    [@root, @block-manager] = [root, block-manager]
    path = window.location.pathname
    @socket = new WebSocket \ws://localhost:9000/
    @connection = new sharedb.Connection @socket
    @pageid = if /^\/page\//.exec(path) => path.replace(/^\/page\//,'').replace(/\/$/, '') else null
    @doc = doc = @connection.get \doc, @pageid
    doc.on \load, ->
      if doc.data => for v,idx in doc.data.child => block-manager.prepare v.content, v.type, idx
    (e) <~ doc.fetch
    if !doc.type => ret = doc.create {attr: {}, child: []}
    doc.subscribe (ops, source) ~> @handle ops, source
    doc.on \op, (ops, source) ~> @handle ops, source
  handle: (ops, source) ->
    if !ops or source => return
    for op in ops =>
      if op.si or op.sd =>
        @root.childNodes[op.p.1].querySelector('.block-item > .inner').innerHTML = @doc.data.child[op.p.1].content
      else if op.li => @block-manager.prepare op.li.content, op.li.type, op.p.1
      else if op.ld =>
        node = @root.childNodes[op.p.1]
        node.parentNode.removeChild(node)

angular.module \webedit
  ..service \collaborate, <[$rootScope]> ++ ($rootScope) -> return collab
  ..controller \collabInfo, <[$scope $http]> ++ ($scope, $http) ->
    panel = document.querySelector \#collab-info
    panel.style.left = "#{800 + Math.round((window.innerWidth - 800)/2)}px"
    panel.style.right = "auto"

