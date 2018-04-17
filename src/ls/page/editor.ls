angular.module \webedit
  # async update like uploadcare holds element for future editing, which might failed
  # if the element is updated. we use 'nodeProxy' technique to always find the corresponding element
  # by a randomized attribute name, and automatically sync the attribute with others.
  ..service \nodeProxy, <[$rootScope]> ++ ($rootScope) ->
    ret = (node, sync = true) ->
      origin-node = node
      query-id = "_node-proxy-#{Math.random!toString(16).substring(2)}"
      node.setAttribute query-id, true
      if sync => ret.collab.action.edit-block node
      retfunc = -> document.querySelector("[#{query-id}]") or throw new Error("node #{query-id} not found")
      retfunc <<< destroy: ->
        newnode = retfunc!
        newnode.removeAttribute query-id
        if sync => ret.collab.action.edit-block newnode
        return newnode
      return retfunc
    ret.init = -> ret.collab = it
    return ret
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
            if exports.custom and exports.custom.attrs =>
              puredom.use-attr exports.custom.attrs
          return res @cache[name]
  ..service \webSettings, <[$rootScope]> ++ ($rootScope) ->
    ret = do
      unit: {}
      style: {}
      option: do
        fontFamily: ["Default", "Arial", "Helvetica Neue", "Tahoma"]
        fontFamilyCJK: ["Default", "Noto Sans"]
        backgroundPositionX: <[default left center right]>
        backgroundPositionY: <[default top center bottom]>
        backgroundRepeat: <[default repeat repeat-x repeat-y no-repeat]>
        backgroundAttachment: <[default scroll fixed local]>
        backgroundSize: <[default cover contain auto]>
        fontWeight: <[default 200 300 400 500 600 700 800 900]>
        boxShadow: <[default none light modest heavy]>
        animationName: <[inherit none bounce slide fade]>
      set-block: (block) ->
        if !block.webSettings => block.webSettings = {}
        @style = block.webSettings or {}
        @block = block
    <[
      marginLeft marginTop marginRight marginBottom
      paddingLeft paddingTop paddingRight paddingBottom
      borderLeftWidth borderTopWidth borderRightWidth borderBottomWidth
      fontSize
    ]>.map -> ret.unit[it] = "px"
    <[animationDuration animationDelay]>.map -> ret.unit[it] = "s"
    return ret
  ..controller \webSettings,
  <[$scope $timeout webSettings collaborate]> ++
  ($scope, $timeout, webSettings, collaborate) ->
    $scope.settings = webSettings
    $scope.set-background-image = ->
      shrink = "1024x1024"
      dialog = uploadcare.open-dialog null, null, {
        imageShrink: shrink
        crop: \free
      }
      dialog.done ->
        file = (if it.files => that! else [it]).0
        $scope.settings.style.backgroundImage = "url(/assets/img/loader/msg.svg)"
        file.done (info) ->
          $scope.settings.style.backgroundImage = "url(#{info.cdnUrl}/-/preview/800x600/)"
    $scope.action-handle = null
    /* Future feature
    $scope.externalCSS = do
      value: null
      add: (value) -> if value =>
        $scope.settings.{}css.[]urls.push value
      remove: (value) -> if value =>
        idx = $scope.settings.{}css.[]urls.indexOf(value)
        if ~idx => $scope.settings.css.urls.splice idx, 1
    */
    $scope.$watch 'settings.style', (->
      if !webSettings.block => return
      for k,v of $scope.settings.style =>
        if !v or v == \default => webSettings.block.style[k] = ''
        else webSettings.block.style[k] = v + (webSettings.unit[k] or '')
      if $scope.action-handle =>
        $timeout.cancel $scope.action-handle
        $scope.action-handle = null
      $scope.action-handle = $timeout (->
        collaborate.action.edit-style(
          webSettings.block, (webSettings.block == document.querySelector('#editor > .inner'))
        )
      ), 1000
    ), true

  ..controller \editor, <[$scope $interval $timeout ldBase blockLoader collaborate global webSettings nodeProxy]> ++
  ($scope, $interval, $timeout, ldBase, blockLoader, collaborate, global, webSettings, node-proxy) ->
    $scope.loading = true

    node-proxy.init collaborate

    # when user change content of doc, notify all blocks that are listening to change events.
    edit-proxy = do
      change: (blocks) ->
        if @change.handle => $timeout.cancel @change.handle
        @change.handle = $timeout (~>
          @change.handle = null
          Array.from(document.querySelector('#editor .inner').querySelectorAll('.block-item')).map (node) ->
            blockLoader.get(node.getAttribute(\base-block)).then (ret) ->
              if !ret or !ret.exports or !ret.exports.handle or !ret.exports.handle.change => return
              ret.exports.handle.change blocks
        ), 1000
      edit-block: (block) ->
        @change [block]
        collaborate.action.edit-block block
      insert-block: (block) ->
        @change [block]
        collaborate.action.insert-block block
      delete-block: (block) ->
        @change [block]
        blockLoader.get(block.getAttribute(\base-block)).then (ret) ->
          if !ret or !ret.exports or !ret.exports.handle or !ret.exports.handle.change => return
          ret.exports.destroy block
        collaborate.action.delete-block block
      move-block:  (src, des) ->
        @change [src, des]
        collaborate.action.move-block src, des

    medium = do
      list: []
      pause: -> @list.map -> it.destroy!
      resume: -> @list.map -> it.setup!
      prepare: (block) ->
        me = new MediumEditor(block, {
          toolbar: do
            buttons: <[bold italic underline indent]>.map(->
              { name: it, contentDefault: "<i class='fa fa-#it'></i>" }) ++
            <[h1 h2 h3 h4]> ++ [
              {name: \colorPicker, contentDefault: "<i class='fa fa-adjust'></i>" },
              {name: \align-left, contentDefault: '1'}
              {name: \align-center, contentDefault: '2'},
              {name: \align-right, contentDefault: '3'},
              {name: \anchor, contentDefault: "<i class='fa fa-link'></i>" }
              {name: \removeFormat, contentDefault: "<i class='fa fa-eraser'></i>" }
            ]
          extensions: do
            colorPicker: new ColorPickerExtension!
            align-left: medium-editor-align-extention.left
            align-center: medium-editor-align-extention.center
            align-right: medium-editor-align-extention.right

          # spellcheck cause content to be reset by writing values to innerHTML when me.destroy!
          # this causes problem if there are event handlers inside. so we disable it for now.
          spellcheck: false
        })
        @list.push me
        me.subscribe \editableInput, (evt, elem) -> edit-proxy.edit-block elem
        me
    text-handle = do
      elem: null
      coord: x: 0, y: 0
      init: ->
        @elem = document.querySelector \#editor-text-handle
        @elem.addEventListener \mouseover, (e) ~>
          if !@timeout => return
          $timeout.cancel @timeout
          @timeout = null
        @elem.addEventListener \keypress, (e) ~> if e.keyCode == 13 => @save!
        @elem.addEventListener \click, (e) ~>
          if e.target.classList.contains \medium-editor-toolbar-save => @save!
          else if e.target.classList.contains \medium-editor-toolbar-close => @toggle null
      save: ->
        text = @elem.querySelector(\input).value
        info = collaborate.action.info @target
        (ret) <~ blockLoader.get info.3 .then _
        if ret.{}exports.{}transform.text => text := ret.{}exports.{}transform.text text
        if text => @target.setAttribute(@target.getAttribute(\edit-text), text)
        if ret.{}exports.{}handle.text => ret.{}exports.{}handle.text @target, text
        edit-proxy.edit-block @target
        @toggle!
      toggle: (options = {}) ->
        if @timeout =>
          $timeout.cancel @timeout
          @timeout = null
        if !options.delay => @_toggle options
        else @timeout = $timeout (~> @_toggle options), options.delay
      _toggle: (options) ->
        {node,inside,text,placeholder} = options
        if !@elem => @init!
        if placeholder => @elem.querySelector 'input' .setAttribute \placeholder, placeholder
        animation = \ldt-slide-bottom-in
        if node != @target => @elem.classList.remove animation
        if !node => return @elem.style.display = \none
        [@target, box] = [node, node.getBoundingClientRect!]
        coord = do
          x: "#{box.x + box.width * 0.5 - 150}px"
          y: "#{box.y - 48 + document.scrollingElement.scrollTop}px"
        @elem.style
          ..left = coord.x
          ..top = coord.y
          ..display = \block
        @elem.classList.add \ld, animation
        @coord <<< coord
        @elem.querySelector \input .value = text
    text-handle.init!

    node-handle = do
      elem: null
      init: ->
        @elem = document.querySelector \#editor-node-handle
        @elem.addEventListener \click, (e) ~>
          if !@target => return
          target = @target
          parent = target.parentNode
          className = e.target.getAttribute \class
          if /fa-clone/.exec(className) =>
            newnode = target.cloneNode true
            newnode.classList.add \ld, \ldt-jump-in, \fast
            sort-editable.init-child newnode
            parent.insertBefore newnode, target.nextSibling
            setTimeout (->
              newnode.classList.remove \ld, \ldt-jump-in, \fast
              edit-proxy.edit-block parent
            ), 800
          else if /fa-trash-o/.exec(className) =>
            target.classList.add \ld, \ldt-jump-out, \fast
            setTimeout (->
              parent.removeChild(target)
              edit-proxy.edit-block parent
            ), 400
          else if /fa-link/.exec(className) =>
          @elem.style.display = "none"
          edit-proxy.edit-block parent
      coord: x: 0, y: 0
      toggle: (node, inside = false) ->
        if !@elem => @init!
        animation = \ldt-bounce-in
        if node != @target => @elem.classList.remove animation
        if !node => return @elem.style.display = \none
        [@target, box] = [node, node.getBoundingClientRect!]
        coord = do
          x: "#{box.x + box.width + 5 + (if inside => -20 else 0)}px"
          y: "#{box.y + box.height * 0.5 - 22 + document.scrollingElement.scrollTop}px"
        @elem.style
          ..left = coord.x
          ..top = coord.y
          ..display = \block
        @elem.classList.add \ld, animation
        @coord <<< coord
    node-handle.init!

    sort-editable = do
      init-child: (node) ->
        Array.from(node.querySelectorAll('[repeat-host]'))
          .map (host)->
            repeat-selector = if host.getAttribute(\repeat-class) => \. + that
            else if host.childNodes.length =>
              if host.childNodes.0 and (host.childNodes.0.getAttribute(\class) or '').split(' ').0.trim! =>
                (\. + that)
              else host.nodeName
            else \div
            # NOTE since things work by updating block innerHTML currently, we dont have to destroy this.
            # must be awared of it if we upgrade our dom mapping
            Sortable.create host, do
              group: name: "sortable-#{Math.random!toString(16)substring(2)}"
              disabled: false
              draggable: repeat-selector
              dragoverBubble: true
              onEnd: (evt) -> edit-proxy.edit-block node

      init: (node, redo = false) ->
        @init-child node
        # track previous cursor so we can manually select a range by checking shift-key status
        last-range = null
        if redo => return
        node.addEventListener \selectstart, (e) -> e.allowSelect = true
        # lazy prepare eid for
        node.addEventListener \keypress, (e) ->
          if !e.target => return
          selection = window.getSelection!
          if !selection or selection.rangeCount = 0 => return
          range = selection.getRangeAt 0
          target = range.startContainer
          if target.nodeType == 3 => target = target.parentNode
          if !target.getAttribute(\eid) =>
            count = 0
            while count < 100 =>
              eid = Math.random!toString 16 .substring(2)
              if !document.querySelector("[eid='#eid']") => break
              count++
            if count < 100 => target.setAttribute \eid, eid
            collaborate.action.edit-block target
        # draggable block & contenteditable -> prevent contenteditable from target node so it can be dragged
        node.addEventListener \mousedown, (e) ~>
          # cancel all contenteditable in ancestor to prepare for dragging and editing
          # top down search ... ( all, seems better for dragging )
          Array.from(node.parentNode.querySelectorAll '[contenteditable]').map ->
            it.removeAttribute \contenteditable

          target = e.target
          ret = @search target, document.createRange!, {x: e.clientX, y: e.clientY}
          # target is an empty element, which cannot be searched by above
          if !(target.innerHTML.replace /(<br>\s*)*/,'').trim! => target.setAttribute(\contenteditable, true)
          # if click is right on text, we enable the editing. if it's too far, then do nothing.
          # is this still working? or can we remove it?
          else if ret and ret.0 and (ret.0.length <= ret.1 or ret.1 == 0) and ret.2 > 800 =>
          else if ret.length and target.parentNode => return target.setAttribute(\contenteditable, true)

        node.addEventListener \mousemove, (e) ~>
          # if not dragging, and mouse is inside a repeat-item:
          #   - if close to text, then switch to selection mode
          #   - if far from text, then disable contenteditable for dragging
          #      - if user has selected text (extentOffset != 0), then still give back the editability
          if !e.buttons =>
            target = e.target
            ret = @search e.target, document.createRange!, {x: e.clientX, y: e.clientY}
            while target and target.getAttribute =>
              if target.getAttribute(\repeat-item) => break
              target = target.parentNode
            if target and target.getAttribute =>
              selection = window.getSelection!
              if selection.extentOffset == 0 and (!ret or !(ret.2?) or ret.2 > 800) =>
                e.target.setAttribute \contenteditable, false
              else e.target.setAttribute \contenteditable, true

          # show node-handle on hover if node is image ( click will popup uploader)
          #   or if node has [edit-text]
          target = e.target
          while target and target.getAttribute =>
            if target.getAttribute(\image) and target.getAttribute(\repeat-item) => break
            target = target.parentNode
          if !target or !target.getAttribute => return
          node-handle.toggle target, true
        node.addEventListener \mouseover, (e) ~>
          target = e.target
          while target and target.getAttribute =>
            if target.getAttribute(\edit-text) => break
            target = target.parentNode
          if !target or !target.getAttribute => return text-handle.toggle {delay: 500}
          text = target.getAttribute(target.getAttribute(\edit-text))
          placeholder = target.getAttribute(\edit-text-placeholder) or 'enter some text...'
          text-handle.toggle {node: target, inside: true, text, placeholder}

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
          while target and target.parentNode and target.getAttribute
            if target.getAttribute(\repeat-item) => break
            target = target.parentNode
          if target and target.getAttribute and target.getAttribute \repeat-item =>
            node-handle.toggle target
          else node-handle.toggle null

          # only if we are focusing on the repeat-item should we make a whole selection on it
          if e.target and e.target.getAttribute and e.target.getAttribute(\repeat-item) =>
            target = e.target
            target.setAttribute \contenteditable, true
            target.focus!
            selection = window.getSelection!
            if selection.rangeCount => range = selection.getRangeAt 0
            else
              range = document.createRange!
              selection.addRange range
            range.collapse false
            range.selectNodeContents target
            return
          target = e.target
          editable = target.getAttribute \editable
          if editable == \false => cancel-editable = true
          target.removeAttribute \contenteditable
          while target
            if target.getAttribute(\editable) == \true => break
            if (target.getAttribute(\image) and target.getAttribute(\image) != 'bk')
            or target.getAttribute(\editable) == \false =>
              cancel-editable = true
              break
            else if target.parentNode and target.parentNode.getAttribute(\repeat-host) == \true => break
            if !target.parentNode => return
            if target == node => break
            target = target.parentNode
          target.setAttribute \contenteditable, !cancel-editable
          if cancel-editable => return
          target.focus!
          selection = window.getSelection!
          if selection.rangeCount == 0 => return
          range = selection.getRangeAt 0
          ret = if cursor => that
          else @search target, range, {x: e.clientX, y: e.clientY}
          if !ret or ret.length == 0 => return
          if last-range and e.shift-key and e.target.getAttribute \repeat-item =>
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

    page = do
      share: do
        modal: {}
        link: window.location.origin + "#{window.location.pathname}/view".replace(/\/\//g, '/')
        public: false
        set-public: ->
          if @public == it => return
          @public = it
          collaborate.action.set-public @public
      prepare: (data) ->
        document.querySelector('#editor > .inner')
          ..setAttribute \style, (data.style or '')
          ..style.width = "#{$scope.config.size.value}px"
        @share.set-public data.attr.is-public


    block = do
      library: do
        root: null
        loaded: {}
        scripts: {}
        add: (name) ->
          Promise.resolve!
            .then ~>
              if @loaded[name] => return
              blockLoader.get name
            .then (ret = {}) ~>
              if !@root => @root = document.querySelector \#editor-library
              libraries = ret.{}exports.library
              if !libraries => return
              node = document.createElement("div")
              for k,v of libraries =>
                if @scripts[v] => continue
                script = @scripts[v] = document.createElement("script")
                script.setAttribute \type, \text/javascript
                script.setAttribute \src, v
                @root.appendChild script
              @loaded[name] = true
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
              node.innerHTML = ret.css # clean, from server
              if !@root => @root = document.querySelector \#editor-style
              @root.appendChild(node)
        remove: (name) ->
          if !@root or !@nodes[name] => return
          @root.removeChild(@nodes[name])
      remove: (node) ->
        edit-proxy.delete-block node
        node.parentNode.removeChild(node)
      # After all block loaded, notify all block a change event to trigger their change listener.
      init: -> edit-proxy.change!
      clone: (node) ->
        newnode = node.cloneNode true
        node.parentNode.insertBefore newnode, node.nextSibling
        @prepare newnode, {highlight: true}

      prepare-async: (node, options = {}) -> new Promise (res, rej) ~>
        if @prepare-async.handle => $timeout.cancel @prepare-async.handle
        @prepare-async.handle = $timeout (~>
          @prepare-async.handle = 0
          @prepare node, options
            .then -> res it
            .catch -> rej it
        ), 10

      prepare: (node, options = {}) ->
        # actually redo should be true if typeof(node) == \string
        editor.cursor.save!
        {name, idx, redo, style} = options
        [source, code] = [true, null]
        if typeof(node) == \string =>
          [code, source] = [node, false]
          node = document.createElement("div")
          root = document.querySelector '#editor > .inner'
          root.insertBefore(node, root.childNodes[idx])
          editor.placeholder.remove!
        if options.content =>
          inner = Array.from(node.childNodes).filter(-> /inner/.exec(it.getAttribute(\class))).0
          if inner => inner.innerHTML = puredom.sanitize(options.content)
        name = name or node.getAttribute(\base-block)
        Array.from(node.attributes).map -> if !(it.name in <[base-block style]>) => node.removeAttribute it.name
        node.setAttribute \class, "initializing"

        promise = blockLoader.get name
          .then (ret) ~>
            if !redo =>
              inner = document.createElement("div")
              inner.setAttribute \class, \inner
              inner.innerHTML = if code => puredom.sanitize(code) else ret.html
              if style => node.setAttribute("style", style)
              while node.lastChild => node.removeChild(node.lastChild)
              node.appendChild inner
              handle = document.createElement("div")
              handle.setAttribute \class, 'handle ld ldt-float-left-in'
              handle.innerHTML = <[arrows clone cog times]>.map(-> "<i class='fa fa-#it'></i>").join('') # clean
              handle.addEventListener \click, (e) ~>
                classList = e.target.classList
                if classList.contains \fa-times => @remove node
                else if classList.contains \fa-clone => @clone node
                else if classList.contains \fa-cog => $scope.blockConfig.toggle node
              node.appendChild handle
              # resolve conflict between medium(contenteditable) and sortable(drag)
              # TODO need to find a way to fight iframe eat dragend issue
              # listen to drop might be a good idea
              # note: eventlistener should only be added if node is newly-created. that's guarded by redo flag
              node.addEventListener \dragstart, (e) -> medium.pause!
              node.addEventListener \dragend, (e) -> medium.resume!
              node.addEventListener \drop, (e) -> medium.resume!
              block.style.add name
              block.library.add name
              if source => edit-proxy.insert-block node
            node.setAttribute \class, "block-item block-#name"
            if !redo and options.highlight => node.classList.add \ld, \ldt-jump-in, \fast
            node.setAttribute \base-block, name
            inner = node.querySelector '.block-item > .inner'
            if ret.{}exports.{}config.editable != false => me = medium.prepare inner
            sort-editable.init inner, redo
            if ret.exports and ret.exports.wrap => ret.exports.wrap node, false, collaborate
            editor.cursor.load!

    editor = do
      online: do
        default-countdown: 10
        state: true
        retry: ->
          editor.loading.toggle true
          @state = true
          $timeout (-> collaborate.init document.querySelector('#editor .inner'), editor, user), 100
          if !@retry.countdown or @retry.countdown < 0 => @retry.countdown = @default-countdown
          else @retry.countdown--
        toggle: (v) -> $scope.force$apply ~>
          if @retry.countdown => return @retry!
          editor.online.state = v
          editor.loading.toggle true
      loading: toggle: (v) -> $scope.force$apply ->
        if v? => $scope.loading = v else $scope.loading = !!!$scope.loading
      server: {} <<< global{domain, scheme}
      collaborator: do
        add: (user, key) -> $scope.force$apply ~> $scope.collaborator[key] = user
        update: (user, key) -> $scope.force$apply ~> $scope.collaborator[key] = user
        remove: (key) -> $scope.force$apply ~> delete $scope.collaborator[key]
      # update document can lead to cursor losing. we save and load cursor here so edit can be continued.
      cursor: do
        state: null
        save: ->
          @state = null
          selection = window.getSelection!
          if !selection.rangeCount => return
          range = selection.getRangeAt 0
          @state = do
            range: range
            startSelector: btools.get-eid-selector range.startContainer
            startOffset: range.startOffset
            endSelector: btools.get-eid-selector range.endContainer
            endOffset: range.endOffset
        load: ->
          if !@state => return
          selection = window.getSelection!
          range = document.createRange!
          startContainer = btools.from-eid-selector @state.startSelector
          endContainer = btools.from-eid-selector @state.endSelector
          if !startContainer => return @state = null
          range.setStart startContainer, @state.startOffset
          if endContainer => range.setEnd endContainer, @state.endOffset
          selection.removeAllRanges!
          selection.addRange range
          @state = null

      page: page
      block: block
      placeholder: do
        remove: ->
          node = document.querySelector('#editor > .inner > .placeholder')
          if node => node.parentNode.removeChild(node)
      prune: (root) ->
        # TODO clean medium-editor attribute here
        Array.from(root.querySelectorAll '[editable]').map (n) -> n.removeAttribute \editable
        Array.from(root.querySelectorAll '[contenteditable]').map (n) -> n.removeAttribute \contenteditable
        Array.from(root.querySelectorAll '.block-item > .handle').map (n) -> n.parentNode.removeChild n
      export: (option = {}) ->
        root = document.querySelector '#editor > .inner' .cloneNode true
        style = document.querySelector '#editor-style'
        base-style = document.querySelector '#page-basic'
        @prune root
        if option.body-only =>
          payload = root.innerHTML #dirty
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
          """ #dirty

        return puredom.sanitize payload
    Sortable.create document.querySelector(\#blocks-picker), do
      group: name: \block, put: false, pull: \clone
      disabled: false
      sort: false
      draggable: \.block-thumb

    Sortable.create document.querySelector('#editor .inner'), do
      group: name: \block, pull: \clone
      filter: \.unsortable
      preventOnFilter: false
      disabled: false
      draggable: \.block-item
      dragoverBubble: true
      scrollSensitivity: 60
      scrollSpeed: 30
      onAdd: -> block.prepare it.item
      onEnd: (evt) ->
        if evt.oldIndex == evt.newIndex => return
        edit-proxy.move-block evt.oldIndex, evt.newIndex
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
        document.querySelector \#editor-preview .innerHTML = @code # clean if editor.export is clean
        @modal.ctrl.toggle true
    $scope.config = do
      modal: {}
      size: do
        value: 1024, name: '1024px'
        resize-async: ldBase.async \resize, ->
          <~ $scope.force$apply
          max-size = window.innerWidth - 180 * 2
          for size in [1440,1200,1024,800,640,480] => break if size < max-size
          @set "#{size}px"
        relayout: ->
          widgets = document.querySelector \#blocks-picker
          panel = document.querySelector \#collab-info
          preview = document.querySelector '.editor-preview-modal .cover-modal-inner'
          widgets.style.right = "#{@value + Math.round((window.innerWidth - @value)/2)}px"
          panel.style.left = "#{@value + Math.round((window.innerWidth - @value)/2)}px"
          preview.style.width = "#{@value}px"
        set: (name) ->
          if /px/.exec(name) => @value = parseInt(name.replace(/px/,''))
          else if /Full/.exec(name) => @value = window.innerWidth
          else if /%/.exec(name) => @value = window.innerWidth * Math.round(name.replace(/%/,'')) * 0.01
          @name = name
          @relayout!
    $scope.pageConfig = do
      modal: {}
      tab: 1
      toggle: ->
        webSettings.set-block document.querySelector('#editor > .inner')
        @modal.ctrl.toggle!
    $scope.blockConfig = do
      modal: {}
      toggle: (node) ->
        webSettings.set-block node
        @modal.ctrl.toggle!
    $scope.share = page.share

    $scope.$watch 'user.data.key', (n, o) -> if n != o =>
      collaborate.action.exit(if user.data => user.data.key else null)
      if n => collaborate.action.join $scope.user.data

    $scope.$watch 'config.size.value', -> $scope.config.size.relayout!

    $scope.editor = editor
    $scope.collaborator = {}

    document.body.addEventListener \keyup, (e) ->
      node-handle.toggle null
      edit-proxy.edit-block e.target
    user = $scope.user.data or {displayname: "guest", key: Math.random!toString(16).substring(2), guest: true}
    editor.online.retry!
    document.querySelector('#editor .inner').addEventListener \click, (e) ->
      target = e.target
      while target
        if target.getAttribute and target.getAttribute(\edit-text) => break
        target = target.parentNode
      if target and target.getAttribute and target.getAttribute(\edit-text) => text-handle.toggle null
      target = e.target
      while target
        if target.getAttribute and target.getAttribute(\image) => break
        target = target.parentNode
      if !target or !target.getAttribute or !target.getAttribute(\image) => return
      if target.getAttribute(\image) == 'bk' and e.target != target => return

      retarget = node-proxy target

      box = target.getBoundingClientRect!
      size = Math.round((if box.width > box.height => box.width else box.height) * 2)
      if size > 1024 => size = 1024
      shrink = "#{size}x#{size}"
      dialog = uploadcare.open-dialog null, null, {
        multiple: !!target.getAttribute(\repeat-item)
        imageShrink: shrink
        crop: \free
      }
      dialog.fail -> retarget.destroy!
      (ret) <- dialog.done
      Promise.resolve!
        .then ->
          files = if ret.files => that! else [ret]
          if files.length == 1 =>
            retarget!style.backgroundImage = "url(/assets/img/loader/msg.svg)"
            files.0.done (info) ->
              retarget!style.backgroundImage = "url(#{info.cdnUrl}/-/preview/800x600/)"
              edit-proxy.edit-block retarget.destroy!
          else =>
            nodes = retarget!parentNode.querySelectorAll('[image]')
            Array.from(nodes).map -> it.style.backgroundImage = "url(/assets/img/loader/msg.svg)"
            Promise.all files.map(-> it.promise!)
              .then (images) ->
                [nodes, j] = [retarget!parentNode.querySelectorAll('[image]'), 0]
                for i from 0 til nodes.length =>
                  nodes[i].style.backgroundImage = "url(#{images[j].cdnUrl}/-/preview/800x600/)"
                  j = ( j + 1 ) % images.length
                edit-proxy.edit-block retarget.destroy!
        .catch (e) -> alert("the image node you're editing is removed by others.")
    last-position = null
    $interval (->
      selection = window.getSelection!
      if !selection or !selection.rangeCount => return
      rbox = document.querySelector('#editor > .inner').getBoundingClientRect!
      range = selection.getRangeAt 0
      box = range.getBoundingClientRect!
      box.x -= rbox.x
      box.y -= rbox.y
      if last-position and last-position.x == box.x and last-position.y == box.y and
      (!last-position.width? or last-position.width == box.width) and
      (!last-position.height? or last-position.height == box.height) => return
      if box.x < 0 or box.x > rbox.width =>
        if last-position and last-position.blur => return
        last-position := {blur: true}
      else last-position := box{x, y, width, height}
      collaborate.action.cursor user, last-position
    ), 1000

    # fix selection range for better double click editing
    # - when dblclick text, browser selects all text in the element. however often it marks
    #   the select range from begin of current element to beginning of next element,
    #   if we then type something, the next element will be merged into current element.
    #   this code can fix this behavior up.
    document.body.addEventListener \mouseup, ->
      selection = window.getSelection!
      if !selection.rangeCount => return
      range =  selection.getRangeAt 0
      [start,end] = [range.startContainer, range.endContainer]
      if start != end =>
        cur = start
        while cur and cur.parentNode
          cur = cur.parentNode
          if end == cur => return range.selectNodeContents start
        oldend = end
        while end and end.parentNode
          end = end.previousSibling or end.parentNode
          if end.childNodes.length == 0 or
          (end == oldend.parentNode and Array.from(end.childNodes).indexOf(oldend) == 0) => continue
          break
      if start.nodeType == 3 => start = start.previousSibling or start.parentNode
      if end.nodeType == 3 => end = end.previousSibling or end.parentNode
      if start == end and end != range.endContainer and range.endOffset == 0 => range.selectNodeContents start
    blocks-picker = document.querySelector \#blocks-picker
    blocks-preview = document.querySelector \#blocks-preview
    blocks-picker.addEventListener \dragstart, -> blocks-preview.style.display = \none
    blocks-picker.addEventListener \mouseout, (e) -> blocks-preview.style.display = \none
    blocks-picker.addEventListener \mousemove, (e) ->
      target = e.target
      if !target.classList or !target.classList.contains("thumb") =>
        if target != blocks-picker => blocks-preview.style.display = \none
        return
      box = target.getBoundingClientRect!
      name = target.getAttribute \name
      ratio = target.getAttribute \ratio
      if ratio < 20 => ratio = 20
      window-bottom = window.innerHeight + document.scrollingElement.scrollTop
      popup-top = box.y + box.height * 0.5 - 25 + document.scrollingElement.scrollTop
      popup-height = 2.56 * ratio
      if popup-top + popup-height > window-bottom - 5 => popup-top = window-bottom - popup-height - 5
      blocks-preview.style
        ..left = "#{box.x + box.width}px"
        ..top = "#{popup-top}px"
        ..display = \block
      blocks-preview.querySelector \.name .innerText = name
      blocks-preview.querySelector \.inner .style
        ..backgroundImage = "url(/blocks/#name/index.jpg)"
        ..height = "0"
        ..paddingBottom = "#{ratio - 1}%"
    document.addEventListener \scroll, ->
      node-handle.toggle null
      blocks-preview.style.display = \none
    <[mousemove keydown scroll]>.map (name) -> document.addEventListener name, ->
      editor.online.retry.countdown = editor.online.default-countdown #TODO larger for pro user

    window.addEventListener \resize, -> $scope.config.size.resize-async!
