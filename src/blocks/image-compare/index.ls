module.exports = do
  editable: false
  resize: ->
    btools.qs(\.container, @block).map (container) ~>
      box = container.getBoundingClientRect!
      btools.qsAll(\.thumb, @block).map -> it.style.backgroundSize = "#{box.width}px auto"
      btools.qs(\.ctrl, @block).map -> it.style.left = "#{box.width * 0.5}px"
      thumbs = btools.qsAll \.thumb, @block
      thumbs.0.style.width = "#{box.width * 0.5}px" #\50%
      thumbs.1.style.width = "#{box.width * 0.5}px" #\50%

  init: ->
    dragging = false
    @block.addEventListener \mousedown, (e) -> dragging := true
    @block.addEventListener \mousemove, (e) ~>
      container = @block.querySelector \.container
      if !dragging or !container => return
      box = container.getBoundingClientRect!
      x = e.clientX - box.x
      btools.qs(\.ctrl, @block).map -> it.style.left = "#{e.clientX - box.x}px"
      thumbs = btools.qsAll \.thumb, @block
      thumbs.0.style.width = "#{x}px"
      thumbs.1.style.width = "#{box.width - x}px"
    @block.addEventListener \mouseup, (e) -> dragging := false
    @resize-handler = ~> @resize!
    window.addEventListener \resize, @resize-handler
    @resize!

  destroy: -> window.removeEventListener \resize, @resize-handler
