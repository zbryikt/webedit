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
            # TODO export API
            if exports.custom and exports.custom.attrs =>
              puredom.use-attr exports.custom.attrs
          return res @cache[name]
  ..service \webSettings, <[$rootScope]> ++ ($rootScope) ->
    ret = do
      unit: {}
      style: {}
      info: {}
      list: <[
        fontFamily
        backgroundPositionX backgroundPositionY backgroundRepeat backgroundAttachment
        backgroundSize fontWeight boxShadow animationName
        backgroundImage backgroundColor color fontSize
        marginTop marginBottom marginLeft marginRight
        paddingTop paddingBottom paddingLeft paddingRight
        borderTopWidth borderLeftWidth borderRightWidth borderBottomWidth
        borderTopColor borderLeftColor borderRightColor borderBottomColor
      ]>
      option: do
        fontFamily:
          * name: \Default, value: 'default'
          * name: \Arial, value: \Arial
          * name: 'Helvetica Neue', value: 'Helvetica Neue'
          * name: \Tahoma, value: \Tahoma
          * name: \Raleway, value: \Raleway
          * name: \微軟正黑體, value: "Microsoft JhengHei"
          * name: '黑體(繁)', value: "Heiti TC"
          * name: '黑體(簡)', value: "Heiti SC"
          * name: '蘋方體(繁)', value: "PingFangTC-Regular"
          * name: '細明體', value: "MingLiU"
          * name: '標楷體', value: 'DFKai-sb'
        backgroundPositionX: <[default left center right]>
        backgroundPositionY: <[default top center bottom]>
        backgroundRepeat: <[default repeat repeat-x repeat-y no-repeat]>
        backgroundAttachment: <[default scroll fixed local]>
        backgroundSize: <[default cover contain auto]>
        fontWeight: <[default 200 300 400 500 600 700 800 900]>
        boxShadow: <[default none light modest heavy]>
        animationName: <[inherit none bounce slide fade]>
      set-block: (block) ->
        @style = {}
        (block.getAttribute(\style) or '').split \; .map ~>
          it = it.split(":").map -> it.trim!
          if !it.1 or !it.0 => return
          name = it.0.split(\-).map((d,i) -> if i => d[0].toUpperCase! + d.substring(1) else d).join('')
          value = it.1
          @style[name] = value
        @info <<< do
          id: "\##{block.getAttribute(\id)}"
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
    $scope.reset = -> $scope.settings.style = {}
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
          # use #{info.cdnUrl}/-/preview/800x600/ for image resizing. animated GIF will fail this.
          $scope.settings.style.backgroundImage = "url(#{info.cdnUrl})"
    $scope.action-handle = null

    $scope.$watch 'settings.style', ((n,o) ->
      if !webSettings.block => return
      for k in $scope.settings.list =>
        v = $scope.settings.style[k]
        if !v or v == \default => webSettings.block.style[k] = $scope.settings.style[k] = ''
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

  ..controller \editor, <[$scope $interval $timeout ldBase blockLoader collaborate global webSettings nodeProxy]> ++ ($scope, $interval, $timeout, ldBase, blockLoader, collaborate, global, webSettings, node-proxy) ->
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
              # TODO export API
              ret.exports.handle.change node, blocks
        ), 1000
      edit-block-async: (block) ->
        if @edit-block-async.handle =>
          $timeout.cancel @edit-block-async.handle
        @edit-block-async.handle = $timeout (~>
          @edit-block-async.handle = null
          @change [block]
          collaborate.action.edit-block block
        ), 500

      edit-block: (block) ->
        @change [block]
        collaborate.action.edit-block block
      insert-block: (block) ->
        @change [block]
        collaborate.action.insert-block block
      delete-block: (block) ->
        @change [block]
        blockLoader.get(block.getAttribute(\base-block)).then (ret) ->
          # TODO export API
          if ret and ret.exports and ret.exports.destroy => ret.exports.destroy block
          collaborate.action.delete-block block
      move-block:  (src, des) ->
        @change [src, des]
        collaborate.action.move-block src, des
      set-thumbnail: (thumbnail) -> collaborate.action.set-thumbnail thumbnail

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
              {name: \orderedlist, contentDefault: "<i class='fa fa-list-ol'></i>" },
              {name: \unorderedlist, contentDefault: "<i class='fa fa-list-ul'></i>" },
              {name: \foreColor, contentDefault: "<i class='fa fa-adjust'></i>" },
              {name: \backColor, contentDefault: "<i class='fa fa-paint-brush'></i>" },
              {name: \borderColor, contentDefault: "<i class='fa fa-square-o'></i>" },
              {name: \align-left, contentDefault: '1'}
              {name: \align-center, contentDefault: '2'},
              {name: \align-right, contentDefault: '3'},
              {name: \anchor, contentDefault: "<i class='fa fa-link'></i>" }
              {name: \removeFormat, contentDefault: "<i class='fa fa-eraser'></i>" }
            ]
          extensions: do
            align-left: medium-editor-align-extention.left
            align-center: medium-editor-align-extention.center
            align-right: medium-editor-align-extention.right
            backColor: new medium-editor-style-extension.backColor!
            foreColor: new medium-editor-style-extension.foreColor!
            borderColor: new medium-editor-style-extension.borderColor!

          # spellcheck cause content to be reset by writing values to innerHTML when me.destroy!
          # this causes problem if there are event handlers inside. so we disable it for now.
          spellcheck: false
        })
        @list.push me
        me.subscribe \editableInput, (evt, elem) -> edit-proxy.edit-block elem
        me
    image-handle = do
      init: -> @handle = document.querySelector \#editor-image-handle
      aspect: do
        lock: false
        toggle: (value) -> @lock = if value? => value else !!!@lock
      click: (target) ->
        if target => @target = target
        if !@target => return
        target = @target
        retarget = node-proxy target
        box = @target.getBoundingClientRect!
        size = Math.round((if box.width > box.height => box.width else box.height) * 2)
        if size > 1024 => size = 1024
        shrink = "#{size}x#{size}"
        ret = /url\("([^"]+)"\)/.exec(window.getComputedStyle(target).backgroundImage or "")
        file = if ret => ret.1 else null
        file = uploadcare.fileFrom 'url', file
        dialog = uploadcare.open-dialog file, null, {
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
                # use #{info.cdnUrl}/-/preview/800x600/ for image resizing. animated GIF will fail this.
                retarget!style.backgroundImage = "url(#{info.cdnUrl})"
                edit-proxy.edit-block retarget.destroy!
                edit-proxy.set-thumbnail "#{info.cdnUrl}/-/preview/1200x630/"
            else =>
              nodes = retarget!parentNode.querySelectorAll('[image]')
              Array.from(nodes).map -> it.style.backgroundImage = "url(/assets/img/loader/msg.svg)"
              Promise.all files.map(-> it.promise!)
                .then (images) ->
                  [nodes, j] = [retarget!parentNode.querySelectorAll('[image]'), 0]
                  for i from 0 til nodes.length =>
                    # use #{info.cdnUrl}/-/preview/800x600/ for image resizing. animated GIF will fail this.
                    nodes[i].style.backgroundImage = "url(#{images[j].cdnUrl})"
                    j = ( j + 1 ) % images.length
                  edit-proxy.edit-block retarget.destroy!
                  edit-proxy.set-thumbnail "#{images.0.cdnUrl}/-/preview/1200x630/"
          .catch (e) -> alert("the image node you're editing is removed by others.")


      resizable: (imgs = []) ->
        if !Array.isArray(imgs) => imgs = [imgs].filter(->it)
        imgs.map (img) ~>
          if img.getAttribute(\image) == \bk or img.resizabled => return
          img.resizabled = true
          # if mouse down in the center region of image, we allow drag
          # else prevent default so user can resize image smoothly
          img.addEventListener \mousedown, (e) ->
            [x,y] = [e.offsetX , e.offsetY]
            box = @getBoundingClientRect!
            [x,y] = [x/box.width , y/box.height]
            if x < 0.1 or x > 0.9 or y < 0.1 or y > 0.9 => e.preventDefault!; e.stopPropagation!
          interact img
            .resizable edges: { left: true, right: true, bottom: true, top: true }
          .on \resizemove, (e) ~>
            target = e.target
            w = target.getBoundingClientRect!width + e.deltaRect.width
            h = target.getBoundingClientRect!height + e.deltaRect.height
            ratio = +target.getAttribute(\image-ratio)
            if isNaN(ratio) or !ratio =>
              ratio = Math.round(100 * w / (h or 1)) * 0.01
              target.setAttribute \image-ratio, ratio
            if @aspect.lock =>
              if e.deltaRect.width => h = w / ratio
              else if e.deltaRect.width => w = h * ratio
            target.style.width = "#{w}px"
            target.style.height = "#{h}px"
            target.style.flex = "0 0 #{w}px"
            target.style.transition = "none"
            if img.handle => $timeout.cancel img.handle
            img.handle = $timeout (->
              target.style.flex = "1 1 auto"
              img.handle = null
              target.style.transition = ".5s all cubic-bezier(.3,.1,.3,.9)"
            ), 500
            edit-proxy.edit-block-async target

    image-handle.init!

    text-handle = do
      elem: null
      coord: x: 0, y: 0
      init: ->
        @elem = document.querySelector \#editor-text-handle
        @elem.addEventListener \mouseover, (e) ~>
          if !@timeout => return
          $timeout.cancel @timeout
          @timeout = null
        @elem.addEventListener \keypress, (e) ~>
          if e.keyCode == 13 => @save!
          if !@timeout => return
          $timeout.cancel @timeout
          @timeout = null
        @elem.addEventListener \click, (e) ~>
          if e.target.classList.contains \medium-editor-toolbar-save => @save!
          else if e.target.classList.contains \medium-editor-toolbar-close => @toggle null
      save: ->
        text = @elem.querySelector(\input).value
        info = collaborate.action.info @target
        (ret) <~ blockLoader.get info.3 .then _
        # TODO export API
        if ret.{}exports.{}transform.text => text := ret.{}exports.{}transform.text text
        if text => @target.setAttribute(@target.getAttribute(\edit-text), text)
        # TODO export API
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
          y: "#{box.y - 39 + document.scrollingElement.scrollTop}px"
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
        # NOTE edit-transition attribute should never go to server. guarded by puredom.
        @elem = document.querySelector \#editor-node-handle
        @elem.addEventListener \click, (e) ~>
          if !@target => return
          target = @target
          parent = target.parentNode
          className = e.target.getAttribute \class
          if /fa-clone/.exec(className) =>
            newnode = target.cloneNode true
            newnode.setAttribute \edit-transition, 'jump-in'
            sort-editable.init-child newnode
            if newnode.getAttribute \image => image-handle.resizable newnode
            parent.insertBefore newnode, target.nextSibling
            setTimeout (->
              newnode.setAttribute \edit-transition, 'jump-in'
              edit-proxy.edit-block parent
            ), 800
          else if /fa-trash-o/.exec(className) =>
            target.setAttribute \edit-transition, 'jump-out'
            setTimeout (~>
              parent.removeChild(target)
              edit-proxy.edit-block parent
              @toggle null
            ), 400
          else if /fa-link/.exec(className) =>
          else if /fa-camera/.exec(className) => image-handle.click @target
          else if /fa-lock/.exec(className) =>
            e.target.classList.add \fa-unlock-alt
            e.target.classList.remove \fa-lock
            image-handle.aspect.toggle false
          else if /fa-unlock-alt/.exec(className) =>
            e.target.classList.add \fa-lock
            e.target.classList.remove \fa-unlock-alt
            image-handle.aspect.toggle true
          @elem.style.display = "none"
          edit-proxy.edit-block parent
      coord: x: 0, y: 0
      toggle: (node, options = {}) ->
        if !@elem => @init!
        animation = \ldt-bounce-in
        if node != @target => @elem.classList.remove animation
        if !node => return @elem.style.display = \none
        @elem.classList[if options.no-repeat => \add else \remove] \no-repeat
        @elem.classList[if options.image => \add else \remove] \image
        @elem.classList[if options.aspect-ratio => \add else \remove] \aspect-ratio
        [@target, box] = [node, node.getBoundingClientRect!]
        coord = do
          x: "#{box.x + box.width + 5 + (if options.inside => -20 else 0)}px"
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
          # 1. target is an empty element, which cannot be searched by above
          # 2. if click is right on text, we enable the editing
          #    ( if it's too far (ret.2 > 800 or ret.1 outside text length, then do nothing. )
          if !((target.innerHTML.replace /(<br>\s*)*/,'').trim!) or
          (ret and ret.length and ret.0 and ((ret.1 < ret.0.length and ret.1 >= 0) and ret.2 < 800)) =>
            # make node editable for better selection, unless we explicitly say the node is editable
            if target.getAttribute(\editable) == \true => target.setAttribute(\contenteditable, true)
            else node.setAttribute(\contenteditable, true)

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
            if target.getAttribute(\image) or target.getAttribute(\repeat-item) => break
            target = target.parentNode
          if !target or !target.getAttribute => return
          image-attr = target.getAttribute(\image)
          node-handle.toggle target, do
            inside: true
            no-repeat: !!!target.getAttribute(\repeat-item)
            image: !!image-attr
            aspect-ratio: !!(image-attr and image-attr != \bk)
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
          else @search target, range, {x: e.clientX, y: e.clientY} # remove this in the future?
          if !ret or ret.length == 0 => return
          # firefox: caretPositionFromPoint, otherwise for webKit
          # here we overwrite the search result, because it just do a broadly search instead of accurate position
          # it's still useful for now, since we need distance to decide whether to trigger draggin
          calc-range = (document.caretPositionFromPoint or document.caretRangeFromPoint)(e.clientX, e.clientY)
          ret.0 = calc-range.startContainer
          ret.1 = calc-range.startOffset
          if last-range and e.shift-key and e.target.getAttribute \repeat-item =>
            order = [[last-range.startContainer, last-range.startOffset], [ret.0, ret.1]]
            if order.0.1 > order.1.1 => order = [order.1, order.0]
            range.setStart order.0.0, order.0.1
            range.setEnd order.1.0, order.1.1
          else
            range.setStart ret.0, ret.1
            range.collapse true
          last-range := range

      # should be able to be written with caretPositionFromPoint for better / faster result
      # still need distance info for deciding to trigger dragging or not
      search: (node, range, m, root = true) ->
        ret = []
        for i from 0 til node.childNodes.length =>
          child = node.childNodes[i]
          if child.nodeName == \#text =>
            [idx,dx,dy] = [-1,-1,-1]
            for j from 0 til child.length + 1
              range.setStart child, j
              box = range.getBoundingClientRect!
              # we normalize the distance to 16 so it will be consistent between different font size
              size = box.height
              if box.x <= m.x and box.y <= m.y =>
                idx = j
                dx = (m.x - box.x - size * 0.5) / size * 16
                dy = (m.y - box.y - size * 0.5) / size * 16
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
        @share.set-public (data.attr or {}).is-public


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
              # TODO export API
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
          .then ->
            node.parentNode.removeChild(node)
            node-handle.toggle null
            text-handle.toggle null
      # After all block loaded, notify all block a change event to trigger their change listener.
      init: ->
        edit-proxy.change!
        try
          if _jf? and _jf.flush => _jf.flush!
        catch e
          console.log e
      clone: (node) ->
        # by default .inner is the first child
        if !node.childNodes.0 => return
        code = node.childNodes.0.innerHTML
        @prepare code, do
          highlight: true
          idx: Array.from(node.parentNode.childNodes).indexOf(node) + 1
          name: node.getAttribute(\base-block)
          source: true
          style: node.getAttribute(\style)

      # idx: mandatory
      prepare-handle: {}
      prepare-async: (node, options = {idx: 0}) -> new Promise (res, rej) ~>
        idx = options.idx or 0
        if @prepare-handle[idx] => $timeout.cancel @prepare-handle[idx]
        @prepare-handle[idx] = $timeout (~>
          @prepare-handle[idx] = 0
          @prepare node, options
            .then -> res it
            .catch -> rej it
        ), 10

      prepare: (node, options = {source: true}) ->
        # actually redo should be true if typeof(node) != \string
        editor.cursor.save!
        {name, idx, redo, style, source} = options
        code = null
        if typeof(node) == \string =>
          code = node
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
        if options.eid => eid = that
        else if (node.getAttribute \eid) => eid = that
        else for i from 0 til 100 =>
          eid = Math.random!toString 16 .substring 2
          if !document.querySelector("[eid='#eid']") => break
        node.setAttribute \eid, eid
        node.setAttribute \id, "block-id-" + eid

        promise = blockLoader.get name
          .then (ret) ~>
            node.setAttribute \class, "block-item block-#name"
            node.setAttribute \base-block, name
            if !redo =>
              inner = document.createElement("div")
              inner.setAttribute \class, \inner
              inner.innerHTML = if code => puredom.sanitize(code) else ret.html
              if style => node.setAttribute("style", style)
              while node.lastChild => node.removeChild(node.lastChild)
              node.appendChild inner
              handle = document.createElement("div")
              handle.setAttribute \class, 'handle ld ldt-float-left-in'
              handle.innerHTML = <[arrows clone cog trash-o]>.map(-> "<i class='fa fa-#it'></i>").join('') # clean
              handle.addEventListener \click, (e) ~>
                classList = e.target.classList
                if classList.contains \fa-trash-o => @remove node
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
            if !redo and options.highlight => node.classList.add \ld, \ldt-jump-in, \fast
            inner = node.querySelector '.block-item > .inner'
            image-handle.resizable Array.from(inner.querySelectorAll '*[image]')
            # TODO export API
            if ret.{}exports.{}config.editable != false => me = medium.prepare inner
            sort-editable.init inner, redo
            # TODO export API
            if ret.exports and ret.exports.wrap => ret.exports.wrap node, collaborate, false
            editor.cursor.load!

    $scope.css = do
      init: ->
        @node = document.querySelector \#editor-css
        @style = document.querySelector '#editor-css style'
        # we use watch but it might cause infinite update.
        # fortunately it's guarded automatically by collab when doing str-diff, or directly by n!=o check
        $scope.$watch 'css.inline.value', (n,o) ~>
          if n == o => return
          collaborate.action.css.edit-inline n
          @style.innerText = n

        $scope.$watch 'css.theme.value.name', (n,o) -> if n != o =>
          collaborate.action.css.edit-theme $scope.css.theme.value
        @theme.value = @theme.list.0
      prepare: (css = {}) -> $scope.force$apply ~>
        @inline.value = css.inline
        @theme.value = css.theme
        @links.list ++= css.links

      theme: do
        value: {}
        list:
          * name: "Default" # the first element in this list should be the default theme
        update: (value) -> $scope.force$apply ~> @value = value
      inline: do
        value: ""
        update: (value) -> $scope.force$apply ~> @value = value
      links: do
        value: null
        list: []
        # local: is this action trigger directly by user?
        add: (value, local = false) -> $scope.force$apply ~>
          if !value => return
          @list.push value
          if !local => return
          collaborate.action.css.add-link value
          @value = null
        remove: (value, local = false) -> $scope.force$apply ~>
          if !value => return
          idx = @list.indexOf(value)
          if !~idx => return
          @list.splice idx, 1
          if !local => return
          collaborate.action.css.remove-link value
          @value = null
    $scope.css.init!

    editor = do
      user: $scope.user
      css: $scope.css
      online: do
        default-countdown: 10
        state: true
        code: null
        retry: ->
          editor.loading.toggle true
          @state = true
          $timeout (-> collaborate.init document.querySelector('#editor .inner'), editor), 100
          if !@retry.countdown or @retry.countdown < 0 => @retry.countdown = @default-countdown
          else @retry.countdown--
        toggle: (v, options = {}) -> $scope.force$apply ~>
          if !options and @retry.countdown => return @retry!
          @code = options.code
          editor.online.state = v
          editor.loading.toggle true
      loading: toggle: (v) -> $scope.force$apply ->
        if v? => $scope.loading = v else $scope.loading = !!!$scope.loading
      server: {} <<< global{domain, scheme}
      collaborator: do
        list: {}
        count: 0
        init: ->
          $timeout (~>
            @count = 0
            for k,v of (@list or {}) =>
              @list[k].cbox = editor.cursor.to-box(@list[k].cursor or {})
              @count++
          ), 0
        handle: (cursor) ->
          if cursor.action == \init =>
            @list = cursor.data
            @init!
          else if cursor.action in <[join update]> =>
            if !@list[cursor.key] => @count++
            @list[cursor.key] = (@list[cursor.key] or {}) <<< cursor.data
            if @list[cursor.key].cursor => @list[cursor.key].cbox = editor.cursor.to-box(that)
          else if cursor.action == \exit =>
            if @list[cursor.key] =>
              @count--
              delete @list[cursor.key]
      # update document can lead to cursor losing. we save and load cursor here so edit can be continued.
      cursor: do
        state: null
        get: ->
          selection = window.getSelection!
          if !selection.rangeCount => return null
          range = selection.getRangeAt 0
          return do
            startSelector: btools.get-eid-selector range.startContainer
            startOffset: range.startOffset
            endSelector: btools.get-eid-selector range.endContainer
            endOffset: range.endOffset
        save: -> @state = @get!
        to-box: (state) ->
          range = @to-range state
          rbox = document.querySelector('#editor > .inner').getBoundingClientRect!
          if !(range and rbox) => return
          box = range.getBoundingClientRect!
          [box.x, box.y] = [ box.x - rbox.x, box.y - rbox.y]
          return {blur: (box.x < 0 or box.x > rbox.width)} <<< box{x, y, width, height}
        to-range: (state) ->
          range = document.createRange!
          startContainer = btools.from-eid-selector state.startSelector
          endContainer = btools.from-eid-selector state.endSelector
          if !startContainer => return null
          range.setStart startContainer, state.startOffset
          if endContainer => range.setEnd endContainer, state.endOffset
          return range
        load: ->
          if !@state => return
          selection = window.getSelection!
          range = @to-range @state
          if !range => return
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

    $scope.collaborator = editor.collaborator

    $scope.export = do
      modal: config: {}, ctrl: {}
      run: ->
        @code = editor.export!
        @modal.ctrl.toggle true
    $scope.preview = do
      modal: {}
      run: ->
        document.querySelector '#editor-preview iframe' .setAttribute \src, page.share.link + "?preview=true"
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

    $scope.insert = do
      node: (node) -> new Promise (res, rej) ->
        editor.cursor.load!
        selection = window.getSelection!
        if !(selection and selection.rangeCount) => return rej!
        range = selection.getRangeAt 0
        range.collapse true
        range.insertNode node
        range.setStartAfter node
        selection.removeAllRanges!
        selection.addRange range
        return res!
      image: ->
        shrink = "1024x1024"
        dialog = uploadcare.open-dialog null, null, {
          imageShrink: shrink
          crop: \free
        }
        <~ dialog.done
        file = (if it.files => that! else [it]).0
        img = document.createElement("img")
        img.style.width = "32px"
        img.style.height = "32px"
        img.style.backgroundImage = "url(/assets/img/loader/msg.svg)"
        # 1 pixel transparent gif
        img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAPHx8QAAACH5BAEAAAAALAAAAAABAAEAQAICRAEAOw=="
        @node img
          .then ->
            (info) <- file.done
            img.setAttribute \image, \image
            img.setAttribute \image-ratio, Math.round(100 * (info.crop.width / info.crop.height)) * 0.01
            img.style.backgroundImage = "url(#{info.cdnUrl})"
            img.style.width = "#{info.crop.width}px"
            img.style.height = "#{info.crop.height}px"
            img.style.backgroundSize = "100% 100%"
            img.style.backgroundColor = \#eee
            img.style.backgroundPosition = "center center"
            image-handle.resizable img
            edit-proxy.edit-block img
          .catch ->
      hr: ->
        hr = document.createElement("hr")
        @node hr .then -> edit-proxy.edit-block hr
      button: ->
        btn-container = document.createElement("div")
        btn-container.setAttribute \repeat-host, \repeat-host
        btn = document.createElement("a")
        btn.classList.add \btn, \btn-primary, \mr-1, \ml-1
        btn.innerHTML = "Get Start"
        btn.setAttribute \href, "#"
        btn.setAttribute \editable, "true"
        btn.setAttribute \repeat-item, "repeat-item"
        btn-container.appendChild btn
        @node btn-container .then -> edit-proxy.edit-block btn-container


      icon: -> $scope.iconPicker.toggle!
    $scope.iconPicker = do
      modal: {}
      toggle: -> @modal.ctrl.toggle!
      click: (e) ->
        if !e.target or !e.target.getAttribute => return
        code = e.target.getAttribute("c")
        if !code => return
        code = "&\#x#code;"
        icon = document.createElement("i")
        icon.classList.add \fa-icon
        icon.innerHTML = code
        $scope.insert.node icon
        #document.execCommand("insertHTML", false, "<i class='fa-icon'>#code</i>")
        @modal.ctrl.toggle false
        edit-proxy.edit-block icon
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

    $scope.$watch 'config.size.value', -> $scope.config.size.relayout!
    # force reload to update websocket so the backend / frontend can sync in collaborators status
    $scope.$watch 'user.data.key', (n, o)->
      if (n or o) and (n != o) => $timeout (-> window.location.reload!), 5000

    $scope.editor = editor

    document.body.addEventListener \keyup, (e) ->
      node-handle.toggle null
      edit-proxy.edit-block e.target
    editor.online.retry!
    document.querySelector('#editor .inner').addEventListener \click, (e) ->
      target = e.target
      while target
        if target.getAttribute and target.getAttribute(\edit-text) => break
        target = target.parentNode
      if target and target.getAttribute and target.getAttribute(\edit-text) => text-handle.toggle null

    last-cursor = null
    $interval (->
      if !$scope.user.data => return
      cursor = editor.cursor.get!
      if JSON.stringify(cursor) == JSON.stringify(last-cursor) => return
      collaborate.action.cursor $scope.user.data, cursor
      last-cursor := cursor
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
        ..backgroundImage = "url(/blocks/#name/index.png)"
        ..height = "0"
        ..paddingBottom = "#{ratio - 1}%"
    document.addEventListener \scroll, ->
      node-handle.toggle null
      blocks-preview.style.display = \none
    <[mousemove keydown scroll]>.map (name) -> document.addEventListener name, ->
      editor.online.retry.countdown = editor.online.default-countdown #TODO larger for pro user

    window.addEventListener \resize, -> $scope.config.size.resize-async!
    window.addEventListener \keydown, (e) ->
      if !(e.metaKey or e.ctrlKey) => return
      if e.keyCode == 90 =>
        collaborate.history.undo!
        e.preventDefault!
        return false
