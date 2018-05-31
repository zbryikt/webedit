module.exports = do
  init: ->
    @page.addEventListener \block.change, ~>
      nbox = @block.getBoundingClientRect!
      timeline = @block.querySelector(\.timeline)
      if !timeline => return
      timeline.style.top = null
      timeline.style.height = "#{nbox.height}px"
      timeline.classList.remove \sticky, \no-transition
      tbox = timeline.getBoundingClientRect!
      cnode = @block
      for item in btools.qsAll('.timeline .item', @block) => if cnode =>
        item.classList.remove \active
        if cnode == @block => btools.qs '.inner .container', cnode .map ->
          offset = it.getBoundingClientRect!x - nbox.x
          it.style.paddingLeft = "#{tbox.width + tbox.x - offset - nbox.x + 10}px"
        else btools.qs \.inner, cnode .map ->
          it.style.marginLeft = "#{tbox.width + tbox.x - nbox.x + 10}px"
        cnode = cnode.nextSibling
    @scroll-listener = ~>
      timeline = @block.querySelector(\.timeline)
      if !timeline or !timeline.style => return
      row = @block.querySelector('.container')
      items = timeline.querySelectorAll(\.item)
      tbox = timeline.getBoundingClientRect!
      rbox = row.getBoundingClientRect!
      if !timeline => return
      scrolltop = document.scrollingElement.scrollTop
      nbox = @block.getBoundingClientRect!
      last-node = @block
      for item in items => if last-node => last-node = last-node.nextSibling
      if last-node => lbox = last-node.getBoundingClientRect!
      [cnode,count] = [@block, 0]
      for item in items => if cnode =>
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
      if lbox and lbox.top <= window.innerHeight =>
        timeline.classList.add \no-transition
        timeline.style.top = "#{cbox.top + cbox.height - tbox.height}px"
      else => timeline.classList.remove \no-transition
    window.addEventListener \scroll, @scroll-listener

  destroy: ->
    cnode = @block.nextSibling
    for item in btools.qsAll('.timeline .item', @block) => if cnode =>
      btools.qs \.inner, cnode .map -> it.style.marginLeft = null
      cnode = cnode.nextSibling
    if @scroll-listener => window.removeEventListener \scroll, @scroll-listener
