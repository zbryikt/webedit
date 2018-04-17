module.exports = do
  handle:
    change: (node) ->
      nbox = node.getBoundingClientRect!
      timeline = node.querySelector(\.timeline)
      if !timeline => return
      timeline.style.top = null
      timeline.style.height = "#{nbox.height}px"
      timeline.classList.remove \sticky, \no-transition
      tbox = timeline.getBoundingClientRect!
      cnode = node.nextSibling
      for item in btools.qsAll('.timeline .item', node) => if cnode =>
        item.classList.remove \active
        btools.qs \.inner, cnode .map -> it.style.marginLeft = "#{tbox.width + tbox.x - nbox.x + 10}px"
        cnode = cnode.nextSibling

  destroy: (node) ->
    cnode = node.nextSibling
    for item in btools.qsAll('.timeline .item', node) => if cnode =>
      btools.qs \.inner, cnode .map -> it.style.marginLeft = null
      cnode = cnode.nextSibling
    if node.scroll-listener => window.removeEventListener \scroll, node.scroll-listener

  wrap: (node) ->
    if node.inited => return
    node.inited = true
    node.scroll-listener = ->
      timeline = node.querySelector(\.timeline)
      row = node.querySelector('.row')
      items = timeline.querySelectorAll(\.item)
      tbox = timeline.getBoundingClientRect!
      rbox = row.getBoundingClientRect!
      if !timeline => return
      scrolltop = document.scrollingElement.scrollTop
      nbox = node.getBoundingClientRect!
      last-node = node
      for item in items => if last-node => last-node = last-node.nextSibling
      lbox = last-node.getBoundingClientRect!
      [cnode,count] = [node, 0]
      for item in items =>
        cbox = cnode.getBoundingClientRect!
        item.classList.remove \active
        if cbox.top >= window.innerHeight/2 and last-item =>
          last-item.classList.add \active
          last-item = null
          break
        [cnode,count,last-item] = [cnode.nextSibling, count + 1, item]
      if last-item => last-item.classList.add \active
      if rbox.top >= 0 =>
        timeline.classList.remove \sticky
        timeline.style.top = null
        timeline.style.height = "#{nbox.height}px"
      else if rbox.top < 0 =>
        timeline.style.height = "#{window.innerHeight}px"
        timeline.classList.add \sticky
        timeline.classList.remove \ldt-fade-out
      if lbox.top <= window.innerHeight =>
        timeline.classList.add \no-transition
        timeline.style.top = "#{cbox.top + cbox.height - tbox.height}px"
      else => timeline.classList.remove \no-transition
    window.addEventListener \scroll, node.scroll-listener
