module.exports = do
  custom: do
    attrs: <[branch-id branch-target]>
  handle: change: (node, blocks, view-mode = false) ->
    blocks = btools.qsAll \.block-item
    [last, idx] = [-1 , -1]
    if view-mode and @inited => return
    if view-mode => @inited = true
    update = (start, end, idx) ->
      for i from start to end =>
        if !view-mode => blocks[i].classList.add "block-branch-no#{1 + (idx % 3)}", \block-branch-no
        blocks[i].setAttribute('branch-id', idx + 1)
    for i from 0 til blocks.length =>
      blocks[i].classList.remove \block-branch-no1, \block-branch-no2, \block-branch-no3
      if blocks[i].classList.contains("block-branch") =>
        if last >= 0 => update(last, i, idx)
        [last, idx] = [i + 1, idx + 1]
        btools.qs \.hint, blocks[i] .map (hint) ->
          hint.classList.remove \block-branch-no1, \block-branch-no2, \block-branch-no3
          hint.classList.add "block-branch-no#{1 + (idx % 3)}"
          hint.innerText = idx + 1
    if last >= 0 => update last, blocks.length - 1, idx
  destroy: ->
    if btools.qsAll(\.block-branch).length <= 1 =>
      btools.qsAll(\.block-branch-no).map ->
        it.classList.remove \block-branch-no, \block-branch-no1, \block-branch-no2, \block-branch-no3

  wrap: (node, collab, view-mode, branching = false)->
    if !branching => @handle.change node, null, view-mode
    if !view-mode =>
      hint = node.querySelector \.hint
      if !hint =>
        hint = document.createElement("div")
        hint.classList.add \hint
        node.appendChild hint
      return
    node.addEventListener \click, (e) ->
      branch-id = (e.target.getAttribute and e.target.getAttribute(\branch-target)) or null
      if !branch-id => return
      target = e.target
      while target and target.classList =>
        if target.classList.contains \block-branch => break
        target = target.parentNode
      if !target.classList => return
      [first, last] = [null, target]
      btools.qsAll "[branch-id]" .map ->
        if it.getAttribute(\branch-id) != branch-id => return
        parent = it.parentNode
        newnode = it.cloneNode(true)
        newnode.removeAttribute \branch-id
        parent.insertBefore newnode, last.nextSibling
        blocks-manager.code.wrap newnode, view-mode, !!newnode.classList.contains(\block-branch)
        last := newnode
        if !first => first := newnode
        newnode.style.display = \block
      setTimeout (->
        if last.classList.contains (\block-branch) =>
          box = last.getBoundingClientRect!
          src = document.scrollingElement.scrollTop
          des = box.y + src + box.height +  80
        else
          box = first.getBoundingClientRect!
          src = document.scrollingElement.scrollTop
          des = box.y + src - 80

        count = 0
        delta = 0.001
        handler = setInterval (->
          value = src + (des - src) * delta * count * count
          window.scrollTo 0, value
          count := count + 1
          if value >= des => clearInterval handler
        ), 10
      ), 250
