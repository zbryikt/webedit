module.exports = do
  custom: do
    attrs: <[branch-id branch-target]>

  init: ->
    change-handler = ~>
      blocks = btools.qsAll \.block-item
      [last, idx] = [-1 , -1]
      if @view-mode and @inited => return
      if @view-mode => @inited = true
      update = (start, end, idx) ~>
        for i from start to end =>
          if !@view-mode => blocks[i].classList.add "block-branch-no#{1 + (idx % 3)}", \block-branch-no
          blocks[i].setAttribute('branch-id', idx + 1)
      for i from 0 til blocks.length =>
        blocks[i].classList.remove \block-branch-no1, \block-branch-no2, \block-branch-no3
        if ~blocks[i].classList.value.indexOf("block-branch") =>
          if last >= 0 => update(last, i, idx)
          [last, idx] = [i + 1, idx + 1]
          btools.qs \.hint, blocks[i] .map (hint) ->
            hint.classList.remove \block-branch-no1, \block-branch-no2, \block-branch-no3
            hint.classList.add "block-branch-no#{1 + (idx % 3)}"
            hint.innerText = idx + 1
      if last >= 0 => update last, blocks.length - 1, idx

    @page.addEventListener \block.change, (~> change-handler!)

    if !@view-mode =>
      hint = @block.querySelector \.hint
      if hint => return
      hint = document.createElement("div")
      hint.classList.add \hint
      @block.appendChild hint
      if !@branching => change-handler!
      return
    #if !@branching => change-handler!

    @block.addEventListener \click, (e) ~>
      branch-id = (e.target.getAttribute and e.target.getAttribute(\branch-target)) or null
      if !branch-id => return
      for item in e.target.parentNode.childNodes => if item.getAttribute and item.getAttribute(\branch-target) =>
        item.classList.remove \active
      e.target.classList.add \active
      console.log \branch-id, branch-id
      target = e.target
      while target and target.classList =>
        if ~target.classList.value.indexOf(\block-branch) => break
        target = target.parentNode
      if !target.classList => return
      [first, last] = [null, target]
      cnode = @block.nextSibling
      while cnode
        next = cnode.nextSibling
        if cnode.sourceBranch => cnode.parentNode.removeChild(cnode)
        cnode = next
      btools.qsAll "[branch-id]" .map ~>
        if it.getAttribute(\branch-id) != branch-id => return
        console.log it, it.getAttribute(\branch-id), branch-id
        parent = it.parentNode
        newnode = it.cloneNode(true)
        newnode.removeAttribute \branch-id
        newnode.sourceBranch = @block
        parent.insertBefore newnode, last.nextSibling
        blocks-manager.init newnode, { branching: !!~newnode.classList.value.indexOf('block-branch')}
        last := newnode
        if !first => first := newnode
        newnode.style.display = \block
      setTimeout (->
        box = first.getBoundingClientRect!
        src = document.scrollingElement.scrollTop
        des = box.y + src - 20
        count = 0
        delta = 0.001
        handler = setInterval (->
          value = src + (des - src) * delta * count * count
          window.scrollTo 0, value
          count := count + 1
          if value >= des => clearInterval handler
        ), 10
      ), 250

  destroy: ->
    if btools.qsAll('.block-branch,.block-branch-list').length <= 1 =>
      btools.qsAll(\.block-branch-no).map ->
        it.classList.remove \block-branch-no, \block-branch-no1, \block-branch-no2, \block-branch-no3
