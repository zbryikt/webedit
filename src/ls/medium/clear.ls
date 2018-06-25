medium-editor-clear-extension = {}
(->
  option = do
    name: 'clear'
    init: ->
      @button = @document.createElement \button
      @button.classList.add \medium-editor-action, "editor-clear", "editor-image-button"
      @button.innerHTML = '<i class="fa fa-eraser"></i>'
      @on @button, \click, (e) ~> @handleClick e
    getButton: -> return @button
    handleClick: (event) ->
      event.preventDefault!
      event.stopPropagation!
      selection = window.getSelection!
      if !selection.rangeCount => return
      range = selection.getRangeAt 0
      #node = [range.startContainer, range.endContainer]
      @document.execCommand \formatblock, false, \div
      @document.execCommand \removeformat
  medium-editor-clear-extension := MediumEditor.Extension.extend(option)
)!
