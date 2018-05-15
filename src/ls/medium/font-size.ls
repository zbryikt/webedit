medium-editor-fontsize-extension = {}
(->
  config = do
    name: "font-size"
    init: ->
      console.log \inited
      @button = @document.createElement \button
      @button.classList.add \medium-editor-action, \medium-editor-font-size
      @button.innerHTML = "<span style='font-family:serif;'>T<small style='font-size:0.7em'>T</small></span>"
      @on @button, \click, (e) ~> @handleClick e
      @div = div = document.createElement("div")
      div.classList.add 'medium-editor-font-size-list', 'medium-editor-sublist'
      document.body.appendChild(div)
      div.innerHTML = (
        ["<div class='list'>", "<div class='item'>Auto</div>"] ++
        ["<div class='item' data-size='#it'>#{it}px</div>" for it in [12,14,18,24,30,36,48,60,72,96]] ++
        ["</div>"]
      ).join('')
      @subscribe \hideToolbar, ~> @div.style.display = \none
      div.style.display = \none
      div.addEventListener \click, (e) ~>
        if !(e.target and e.target.getAttribute) => return
        size = +e.target.getAttribute('data-size')
        @base.importSelection(@selectionState)
        @document.execCommand \styleWithCSS, false, true
        @document.execCommand \fontSize, false, 7
        range = window.getSelection!getRangeAt 0
        target = range.startContainer
        while target and (target.getAttribute or target.nodeType == 3) =>
          if target.getAttribute and target.style => break
          target = target.parentNode
        if target.style =>
          if isNaN(size) or !size => target.style.fontSize = ""
          else target.style.fontSize = "#{size}px"
          @trigger \editableInput, {}, target
        div.style.display = \none
    getButton: -> return @button
    handleClick: (event) ->
      event.preventDefault!
      event.stopPropagation!
      @selectionState = @base.exportSelection!
      ref = @document.querySelector(".medium-editor-toolbar-active .medium-editor-font-size").parentNode
      box = ref.getBoundingClientRect!
      @div.style.top = ((box.y + box.height) + document.scrollingElement.scrollTop) + "px"
      @div.style.left = box.x + "px"
      @div.style.display = \block

  medium-editor-fontsize-extension := MediumEditor.Extension.extend(config)
)!
