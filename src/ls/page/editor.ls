sort-editable = do
  init: (node) ->
    node.addEventListener \selectstart, (e) -> e.allowSelect = true
    # draggable block & contenteditable -> prevent contenteditable from target node so it can be dragged
    node.addEventListener \mousedown, (e) ~>
      target = e.target
      ret = @search target, document.createRange!, {x: e.clientX, y: e.clientY}
      # too far
      if ret and ret.0 and (ret.0.length <= ret.1 or ret.1 == 0) and ret.2 > 800 =>
      else if target.parentNode and !target.parentNode.getAttribute(\repeat) =>
        target.setAttribute \contenteditable, true
        return
      sel = window.getSelection!
      while target and target.parentNode
        if target.getAttribute \contenteditable => target.setAttribute \contenteditable, false
        if target == node => break
        target = target.parentNode
    # track previous cursor so we can manually select a range by checking shift-key status
    last-range = null
    # click fired if it's not drag. enable contenteditable and focus node
    node.addEventListener \click, (e) ~>
      cursor = null
      cancel-editable = false # for non-editable elements inside
      selection = window.getSelection!
      if selection.rangeCount > 0 =>
        range = window.getSelection!getRangeAt 0
        if range.startOffset < range.endOffset or !range.collapsed => return
        cursor = [ range.startContainer, range.startOffset ]
      target = e.target
      editable = target.getAttribute \editable
      if editable == \false => cancel-editable = true
      target.removeAttribute \contenteditable
      while target
        if target.getAttribute(\editable) == \true => break
        else if target.parentNode and target.parentNode.getAttribute(\repeat) == \true => break
        if !target.parentNode => return
        if target == node => break
        target = target.parentNode
      target.setAttribute \contenteditable, !cancel-editable #true
      if cancel-editable => return
      target.focus!
      selection = window.getSelection!
      if selection.rangeCount == 0 => return
      range = selection.getRangeAt 0
      ret = if cursor => that
      else @search target, range, {x: e.clientX, y: e.clientY}
      if !ret or ret.length == 0 => return
      if last-range and e.shift-key =>
        order = [[last-range.startContainer, last-range.startOffset], [ret.0, ret.1]]
        if order.0.1 > order.1.1 => order = [order.1, order.0]
        range.setStart order.0.0, order.0.1
        range.setEnd order.1.0, order.1.1
      else
        range.setStart ret.0, ret.1
        range.collapse true
      last-range := range

  search: (node, range, m, root = true) ->
    ret = []
    for i from 0 til node.childNodes.length =>
      child = node.childNodes[i]
      if child.nodeName == \#text =>
        [idx,dx,dy] = [-1,-1,-1]
        for j from 0 til child.length + 1
          range.setStart child, j
          box = range.getBoundingClientRect!
          if box.x <= m.x and box.y <= m.y => [idx,dx,dy] = [j, m.x - box.x, m.y - box.y]
          else if box.x > m.x and box.y > m.y => break
        if idx >= 0 => ret.push [child, idx, dx, dy]
        continue
      if !child.getBoundingClientRect => continue
      box = child.getBoundingClientRect!
      if box.x <= m.x and box.y <= m.y => ret ++= @search(child, range, m, false)
    if !root or !ret.length => return ret
    ret = ret.map -> [it.0, it.1, ((it.2 ** 2) + (it.3 ** 2))]
    [min,idx] = [ret.0.2, 0]
    for i from 1 til ret.length => if ret[i].2 < min => [min, idx] = [ret[i].2, i]
    return ret[idx]


angular.module \webedit
  ..service \blockLoader, <[$rootScope $http ]> ++ ($scope, $http) -> ret = do
    cache: {}
    get: (name) -> new Promise (res, rej) ~>
      if @cache[name] => return res that
      $http {url: "/blocks/#name/index.json"}
        .then (ret) ~>
          @cache[name] = ret.data
          if @cache[name].js =>
            exports = eval("""
            var module = {exports: {}};
            (function(module) { #that })(module);
            module.exports;
            """)
            @cache[name].exports = exports
          return res @cache[name]

  ..controller \editor, <[$scope $timeout blockLoader collaborate]> ++ ($scope, $timeout, blockLoader, collaborate) ->
    medium = do
      list: []
      pause: -> @list.map -> it.destroy!
      resume: -> @list.map -> it.setup!
      prepare: (block) ->
        me = new MediumEditor(block, {
          toolbar: do
            buttons: [
              'bold', 'italic', 'underline', 'h1', 'h2', 'h3', 'h4', 'indent',
              'colorPicker', 'anchor', 'justifyLeft', 'justifyCenter', 'justifyRight'
            ]
          extensions: { colorPicker: new ColorPickerExtension! }
        })
        @list.push me
        me.subscribe \editableInput, (evt, elem) -> collaborate.action.edit-block elem
    block = do
      style: do
        root: null
        nodes: {}
        add: (name) ->
          Promise.resolve!
            .then ~>
              if @nodes[name] => return
              blockLoader.get name
            .then (ret) ~>
              node = document.createElement("style")
              node.setAttribute \type, 'text/css'
              node.innerHTML = ret.css
              if !@root => @root = document.querySelector \#editor-style
              @root.appendChild(node) 
        remove: (name) ->
          if !@root or !@nodes[name] => return
          @root.removeChild(@nodes[name])
      image: (root) ->
        Array.from(root.querySelectorAll '[image]').map (node) ->
          input = document.createElement("input")
          [ ["class", "for-edit"]
            ["type", "hidden"]
            ["role", "uploadcare-uploader"]
            ["data-image-shrink", "1024x1024 70"]
            ["data-crop", "free"] ].map -> input.setAttribute it.0, it.1
          node.appendChild input
          node.setAttribute \editable, false
          widget = uploadcare.SingleWidget(input)
          Array.from(node.querySelectorAll \button).map -> it.setAttribute \editable, false
          widget.onChange -> if it => it.done (info) -> node.style.backgroundImage = "url(#{info.cdnUrl})"
      remove: (node) ->
        collaborate.action.delete-block node
        node.parentNode.removeChild(node)
      prepare: (node, name = null, idx = null) ->
        [source, code] = [true, null]
        if typeof(node) == \string =>
          [code, source] = [node, false]
          node = document.createElement("div")
          root = document.querySelector '#editor > .inner'
          root.insertBefore(node, root.childNodes[idx])
          editor.placeholder.remove!
        name = name or node.getAttribute(\base-block)
        Array.from(node.attributes).map -> node.removeAttribute it.name
        blockLoader.get name
          .then (ret) ~>
            inner = document.createElement("div")
            inner.setAttribute \class, \inner
            inner.innerHTML = if code => code else ret.html
            while node.lastChild => node.removeChild(node.lastChild)
            node.appendChild inner
            sort-editable.init inner
            if ret.exports and ret.exports.wrap => ret.exports.wrap node
            node.setAttribute \class, "block-item block-#name"
            node.setAttribute \base-block, name
            if ret.{}exports.{}config.editable != false => medium.prepare inner
            handle = document.createElement("div")
            handle.setAttribute \class, \handle
            handle.innerHTML = <[arrows cog times]>.map(-> "<i class='fa fa-#it'></i>").join('')
            handle.addEventListener \click, (e) ~>
              if /fa-times/.exec(e.target.getAttribute \class) => @remove node
            node.appendChild handle
            # resolve conflict between medium(contenteditable) and sortable(drag)
            node.addEventListener \dragstart, (e) -> medium.pause!
            node.addEventListener \dragend, (e) -> medium.resume!
            block.style.add name
            if source => collaborate.action.insert-block node
            @image node

    editor = do
      placeholder: do
        remove: ->
          node = document.querySelector('#editor > .inner > .placeholder')
          if node => node.parentNode.removeChild(node)
      prune: (root) ->
        # TODO clean medium-editor attribute here
        Array.from(root.querySelectorAll '[editable]').map (n) -> n.removeAttribute \editable
        Array.from(root.querySelectorAll '[contenteditable]').map (n) -> n.removeAttribute \contenteditable
        Array.from(root.querySelectorAll '[image]').map (node) ->
          Array.from(node.querySelectorAll('.for-edit, .uploadcare--widget')).map (n) ->
            n.parentNode.removeChild n
        Array.from(root.querySelectorAll '.block-item > .handle').map (n) -> n.parentNode.removeChild n
      export: (option = {}) ->
        root = document.querySelector '#editor > .inner' .cloneNode true
        style = document.querySelector '#editor-style'
        base-style = document.querySelector '#page-basic'
        @prune root
        if option.body-only =>
          payload = root.innerHTML
        else
          payload = """
          <html><head>
          <link rel="stylesheet" type="text/css"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"/>
          <script type="text/javascript"
          src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.bundle.min.js"></script>
          #{style.innerHTML}
          <style type="text/css"> #{base-style.innerHTML} </style>
          </head><body>
          #{root.innerHTML}
          </body></html>
          """

        return payload
    Sortable.create document.querySelector(\#blocks-picker), do
      group: name: \block, put: false, pull: \clone
      disabled: false
      draggable: \.block-thumb

    Sortable.create document.querySelector('#editor .inner'), do
      group: name: \block, pull: \clone
      disabled: false
      draggable: \.block-item
      onAdd: -> block.prepare it.item
      onEnd: (evt) -> collaborate.action.move-block evt.oldIndex, evt.newIndex
    document.querySelector('#editor > .inner')
      ..addEventListener \dragover, -> editor.placeholder.remove!

    $scope.export = do
      modal: config: {}, ctrl: {}
      run: ->
        @code = editor.export!
        @modal.ctrl.toggle true
    $scope.preview = do
      modal: {}
      run: ->
        @code = editor.export { body-only: true }
        document.querySelector \#editor-preview .innerHTML = @code
        @modal.ctrl.toggle true

    document.body.addEventListener \keyup, (e) -> collaborate.action.edit-block e.target
    collaborate.init document.querySelector('#editor .inner'), block
