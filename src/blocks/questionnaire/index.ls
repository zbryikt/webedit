module.exports = do

  wrap: (node) ->
    btools.qs(\.result).map -> it.style.display = \none
    btools.qs(\.submit).map -> it.addEventListener \click, ->
      btools.qs('.result').map -> it.style.display = \block
    scoring = ->
      result = btools.qsAll('.choice.active')
        .map -> +(it.getAttribute(\score) or 0)
        .reduce(((a,b) -> a + b), 0)
      btools.qs('.score').map -> it.innerText = result
      btools.qs('.result').map -> it.style.display = \none
    node.addEventListener \click, (e) ->
      target = e.target
      if !target.classList.contains(\choice) => return
      Array.from(target.parentNode.childNodes).map ->
        if it != target and it.classList.contains(\choice) => it.classList.remove(\active)
      target.classList.toggle \active
      scoring!
