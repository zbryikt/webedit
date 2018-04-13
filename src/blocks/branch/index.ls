module.exports = do
  wrap: (node, view-mode)->
    if !view-mode => return
    blocks = Array.from(document.querySelectorAll('.block-item'))
    [last, idx] = [-1 , 0]
    update = (start, end, idx) ->
      for i from start to end =>
        if !view-mode => blocks[i].style.borderLeft = '4px solid #f00'
        blocks[i].setAttribute('branch-id', idx)
    for i from 0 til blocks.length =>
      if blocks[i].classList.contains("block-branch") => 
        if last >= 0 => update(last, i, idx)
        [last, idx] = [i + 1, idx + 1]
    if last >= 0 => update last, blocks.length - 1, idx
    node.addEventListener \click, (e) ->
      branch-id = (e.target.getAttribute and e.target.getAttribute(\branch-target)) or null
      if !branch-id => return
      target = e.target
      while target and target.classList =>
        if target.classList.contains \block-branch => break
        target = target.parentNode
      if !target.classList => return
      last = target
      Array.from(document.querySelectorAll "[branch-id]").map ->
        if it.getAttribute(\branch-id) != branch-id => return
        parent = it.parentNode
        newnode = it.cloneNode(true)
        newnode.removeAttribute \branch-id
        parent.insertBefore newnode, last
        if !newnode.classList.contains(\block-branch) => blocks-manager.code.wrap newnode, view-mode
        last := newnode
        newnode.style.display = \block
      setTimeout (->
        box = last.getBoundingClientRect!
        src = document.scrollingElement.scrollTop
        des = box.y + box.height + src + 80
        count = 0
        delta = 0.001
        handler = setInterval (->
          value = src + (des - src) * delta * count * count
          window.scrollTo 0, value
          count := count + 1
          if value >= des => clearInterval handler
        ), 10
      ), 500
