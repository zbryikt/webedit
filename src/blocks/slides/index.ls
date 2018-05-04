module.exports = do
  handle: change: (node, blocks) ->
    slides = btools.qsAll('.slides > .slide', node)
    slides.map -> it.style.display = \none
    [idx,oldidx] = [node.{}block-slides.idx or 0, node.{}block-slides.oldidx or 0]
    slides[idx].style.display = \table-cell

  wrap: (block) ->
    if block.inited => return
    block.inited = true
    block.block-slides = {idx: 0}
    move = (dir) ->
      slides = btools.qsAll('.slides > .slide', block)
      len = slides.length
      oldidx = block.block-slides.idx
      idx = oldidx + dir
      if idx < 0 => idx = len - 1
      if idx >= len => idx = 0
      block.block-slides.idx = idx
      block.block-slides.oldidx = oldidx
      slides.map -> it.style.display = \none
      slides[idx].style.display = \table-cell
      if oldidx != idx =>
        slides[oldidx].style.display = \table-cell
        setTimeout (-> slides[oldidx].style.display = \none ), 0
      
    block.addEventListener \click, (e) ->
      target = e.target
      while target and target.classList
        if target.classList.contains('fa-chevron-right') => return move -1
        else if target.classList.contains('fa-chevron-left') => return move 1
        target = target.parentNode

    document.body.addEventListener \keydown, (e) ->
      if e.keyCode == 37 => move -1
      else if e.keyCode == 39 => move 1
