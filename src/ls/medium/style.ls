medium-editor-style-extension = {}
(->

  pickerColors = <[
    #212121 #8E8E8E #C2C4C5 #ffffff #F44336
    #E91E63 #9C27B0 #673AB7 #3F51B5 #2196F3
    #03A9F4 #00BCD4 #009688 #4CAF50 #8BC34A
    #CDDC39 #FFEB3B #FFC107 #FF9800 #FF5722
    #795548 #607D8B rgba(255,255,255,0)
  ]>

  # option: name = color / background / borderColor
  #         icon = <custom html>
  #         command = foreColor / backColor / NA
  config-factory = (option = {}) -> do
    name: option.name
    init: ->
      @button = @document.createElement \button
      @button.classList.add \medium-editor-action, "editor-#{option.name}-picker", "editor-image-button"
      @button.innerHTML = option.icon
      @on @button, \click, (e) ~> @handleClick e
    getButton: -> return @button
    handleClick: (event) ->
      event.preventDefault!
      event.stopPropagation!
      @selectionState = @base.exportSelection!
      picker = vanillaColorPicker(
        @document.querySelector(".medium-editor-toolbar-active .editor-#{option.name}-picker").parentNode
      )
      selection = window.getSelection!
      if !selection.rangeCount => return
      range = selection.getRangeAt 0
      node = [range.startContainer, range.endContainer]
      rawnode = range.startContainer
      # if start / end are on the end of both side of certain node:
      if !option.command or (range.startOffset == 0 and
      range.endOffset == (if node.1.nodeType == 3 => node.1.length else node.1.childNodes.length)) =>
        seed = Math.random!
        while (node.0 and node.1 and
        (node.0 != node.1 or node.0.nodeType == 3) and
        !(node.0.seed == seed or node.1.seed == seed)) =>
          node.0.seed = seed
          node.1.seed = seed
          node = [node.0.parentNode, node.1.parentNode]
        if !node.0 => return
        node = if node.1.seed == seed => node.1 else node.0
      else node = null

      picker.set("customColors", pickerColors)
      picker.set("positionOnTop")
      picker.openPicker!
      picker.on \colorChosen, (color) ~>
        @base.importSelection(@selectionState)
        if node =>
          node.style[option.style] = color

          if /border/.exec(option.name) =>
            borderWidth = window.getComputedStyle(node).borderWidth
            if !borderWidth or borderWidth == \0px =>
            node.style.borderWidth = \1px
            node.style.borderStyle = \solid
          @trigger \editableInput, {}, node
          return
        if option.command =>
          @base.importSelection(@selectionState)
          @document.execCommand \styleWithCSS, false, true
          @document.execCommand option.command, false, color
          @trigger \editableInput, {}, if rawnode.getAttribute => rawnode else rawnode.parentNode
  medium-editor-style-extension <<< do
    backColor: MediumEditor.Extension.extend config-factory do
      name: \backColor
      style: \background
      icon: """<div style="background-image:url(/assets/img/page/medium/backColor.svg"></div>"""
      command: \backColor
    foreColor: MediumEditor.Extension.extend config-factory do
      name: \foreColor
      style: \color
      icon: """<div style="background-image:url(/assets/img/page/medium/foreColor.svg"></div>"""
      command: \foreColor
    borderColor: MediumEditor.Extension.extend config-factory do
      name: \borderColor
      style: \borderColor
      icon: """<div style="background-image:url(/assets/img/page/medium/borderColor.svg"></div>"""
      command: null
)!

