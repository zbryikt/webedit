module.exports = do
  handle: change: (node, blocks) ->
    slides = btools.qsAll('.slides .slide', node)
    slides.map -> it.style <<< zIndex: 0, opacity: 0, transition: \none, transform: "translate(0,0)"
    slides[node.{}block-slides.idx or 0].style <<< zIndex: 9, opacity: 1
  wrap: (block) ->
    if block.inited => return
    block.inited = true
    block.block-slides = {idx: 0}
    move = (dir) ->
      slides = btools.qsAll('.slides .slide', block)
      len = slides.length
      transition = "all .3s ease-in-out"
      oldidx = block.block-slides.idx
      idx = if len > 1 => (oldidx + dir + len * 2) % len else 0
      block.block-slides <<< {idx, oldidx}
      if idx == oldidx => return
      slides[oldidx].style <<< transition: \none, zIndex: 9, opacity: 1, transform: "translate(0,0)"
      slides[idx].style <<< transition: \none, zIndex: 0, opacity: 0, transform: "translate(#{100 * -dir}%,0)"
      <- setTimeout _, 0
      slides[oldidx].style <<< {transition, zIndex: 0, opacity: 0, transform: "translate(#{100 * dir}%,0)"}
      slides[idx].style <<< {transition, zIndex: 9, opacity: 1, transform: "translate(0,0)"}

      
    block.addEventListener \click, (e) ->
      target = e.target
      while target and target.classList
        if target.classList.contains('fa-chevron-right') => return move -1
        else if target.classList.contains('fa-chevron-left') => return move 1
        target = target.parentNode

    document.body.addEventListener \keydown, (e) ->
      if e.target == document.body =>
        if e.keyCode == 37 => move -1
        else if e.keyCode == 39 => move 1

    btools.qs('.slides > .slide', block).map -> it.style <<< opacity: 1, zIndex: 9
