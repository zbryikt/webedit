module.exports = do
  wrap: (node) ->
    node.querySelector('.result').style.display = \none
    node.querySelector(\.submit).addEventListener \click, ->
      node.querySelector('.result').style.display = \block
    scoring = ->
      result = Array.from(node.querySelectorAll('.choice.active'))
        .map -> +(it.getAttribute(\score) or 0)
        .reduce(((a,b) -> a + b), 0)
      node.querySelector('.score').innerText = result
      node.querySelector('.result').style.display = \none
    node.addEventListener \click, (e) ->
      target = e.target
      if !target.classList.contains(\choice) => return
      Array.from(target.parentNode.childNodes).map ->
        if it != target and it.classList.contains(\choice) => it.classList.remove(\active)
      target.classList.toggle \active
      scoring!
