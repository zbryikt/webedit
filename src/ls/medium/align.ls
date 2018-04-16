medium-editor-align-extention = {}
(->
  align-factory = (direction) ->
    return do
      name: "align-#direction"
      init: ->
        @button = @document.createElement \button
        @button.classList.add \medium-editor-action
        @button.innerHTML = """<i class="fa fa-align-#direction"></i>"""
        @on @button, \click, @handleClick.bind(@)
      getButton: -> return @button
      handleClick: (event) ->
        selection = window.getSelection!
        if !selection.rangeCount => return
        range = selection.getRangeAt 0
        node = [range.startContainer, range.endContainer]
        seed = Math.random!
        while (node.0 and node.1 and
        (node.0 != node.1 or node.0.nodeType == 3) and
        !(node.0.seed == seed or node.1.seed == seed)) =>
          node.0.seed = seed
          node.1.seed = seed
          node = [node.0.parentNode, node.1.parentNode]
        if !node.0 => return
        node = if node.1.seed = seed => node.1 else node.0
        while node =>
          align = window.getComputedStyle(node).textAlign
          display = window.getComputedStyle(node).display
          if (align != direction and display == \inline-block) or display == \block => break
          node = node.parentNode
        node.style.textAlign = direction
        @trigger \editableInput, {}, node

  medium-editor-align-extention <<< do
    left: new (MediumEditor.Extension.extend(align-factory \left))!
    center: new (MediumEditor.Extension.extend(align-factory \center))!
    right: new (MediumEditor.Extension.extend(align-factory \right))!
)!
