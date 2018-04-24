module.exports = do
  custom: attrs: <[score]>
  wrap: (node) ->
    btools.qs(\.result, node).map -> it.style.display = \none
    btools.qs(\.submit, node).map -> it.addEventListener \click, ->
      btools.qs('.result', node).map -> it.style.display = \block
      result = btools.qsAll('.choice.active', node)
        .map -> +(it.getAttribute(\score) or 0)
        .reduce(((a,b) -> a + b), 0)
      set-active = (n, value) ->
        n.style.opacity = if value => 1 else 0.3
        if value => n.classList.add \text-danger else n.classList.remove \text-danger
      btools.qsAll('.result .card *[repeat-item]', node).map ->
        ret = /(\d+)\s*~\s*(\d+)/.exec(it.innerText)
        if ret and result >= +(ret.1) and result <= +(ret.2) => return set-active it, true
        ret = /<\s*(\d+)/.exec(it.innerText)
        if ret and result < +(ret.1) => return set-active it, true
        ret = />\s*(\d+)/.exec(it.innerText)
        if ret and result > +(ret.1) => return set-active it, true
        it.style.opacity = 0.3
        set-active it, false

    scoring = ->
      result = btools.qsAll('.choice.active', node)
        .map -> +(it.getAttribute(\score) or 0)
        .reduce(((a,b) -> a + b), 0)
      btools.qs('.score', node).map -> it.innerText = result
      btools.qs('.result', node).map -> it.style.display = \none

    node.addEventListener \click, (e) ->
      target = e.target
      if !target.classList.contains(\choice) => return
      Array.from(target.parentNode.childNodes).map ->
        if it != target and it.classList.contains(\choice) => it.classList.remove(\active)
      target.classList.toggle \active
      scoring!
