module.exports = do
  handle: resize: (node) -> btools.qs(\.container, node).map (container) ->
    box = container.getBoundingClientRect!
    btools.qsAll(\.thumb, node).map -> it.style.backgroundSize = "#{box.width}px auto"
    btools.qs(\.ctrl, node).map -> it.style.left = "#{box.width * 0.5}px"
    thumbs = btools.qsAll \.thumb, node
    thumbs.0.style.width = "#{box.width * 0.5}px" #\50%
    thumbs.1.style.width = "#{box.width * 0.5}px" #\50%
  config:
    editable: false
  wrap: (node) ->
    container = node.querySelector \.container
    if !container => return
    dragging = false
    node.addEventListener \mousedown, (e) -> dragging := true
    node.addEventListener \mousemove, (e) ->
      if !dragging => return
      box = container.getBoundingClientRect!
      x = e.clientX - box.x
      btools.qs(\.ctrl, node).map -> it.style.left = "#{e.clientX - box.x}px"
      thumbs = btools.qsAll \.thumb, node
      thumbs.0.style.width = "#{x}px"
      thumbs.1.style.width = "#{box.width - x}px"
    node.addEventListener \mouseup, (e) -> dragging := false
    window.addEventListener \resize, ~> @handle.resize node
    @handle.resize node
