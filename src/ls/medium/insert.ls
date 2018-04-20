medium-editor-insert-extension = {}
(->
  icon-config = do
    name: "icon-picker"
    init: ->
      @button = @document.createElement \button
      @button.classList.add \medium-editor-action
      @button.innerHTML = """<i class="fa fa-smile"></i>"""
      @on @button, \click, @handleClick.bind(@)
    getButton: -> return @button
    handleClick: (event) ->
      selection = window.getSelection!
      if !selection.rangeCount => return
      range = selection.getRangeAt 0
      node = range.startContainer
      @trigger \editableInput, {}, node

  medium-editor-insert-extension <<< do
    icon: new (MediumEditor.Extension.extend(icon-config))!
)!

