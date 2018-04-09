module.exports = do
  config:
    editable: false
  wrap: (node) ->
    ctrl = node.querySelector \.ctrl
    thumbs = node.querySelectorAll \.thumb
    container = node.querySelector \.container
    dragging = false
    node.addEventListener \mousedown, (e) -> dragging := true
    node.addEventListener \mousemove, (e) ->
      if !dragging => return
      box = container.getBoundingClientRect!
      x = e.clientX - box.x
      ctrl.style.left = "#{e.clientX - box.x}px"
      thumbs.0.style.width = "#{x}px"
      thumbs.1.style.width = "#{box.width - x}px"
    node.addEventListener \mouseup, (e) -> dragging := false
    box = container.getBoundingClientRect!
    Array.from(thumbs).map -> it.style.backgroundSize = "#{box.width}px"

