module.exports = do
  custom: attrs: <[card-score-sep]>
  init: ->
    if !@view-mode => return
    <~ setInterval _, 1000
    score = Array.from(document.querySelectorAll '.chosen[card-score]')
      .map (d,i) -> +d.getAttribute(\card-score)
      .filter -> !isNaN(it)
      .reduce(((a,b) -> a + b), 0)
    sep = Array.from(@block.querySelectorAll '.card-score')
    sep.map ->
      it.sep = it.getAttribute(\card-score-sep)
      it.sep = if it.sep == null => NaN else +it.sep
    sep.sort (a,b) -> a.sep - b.sep
    matched = sep.filter -> it.sep? and !isNaN(it.sep) and it.sep > score
    if !matched.length => matched = sep.filter -> isNaN(it.sep)
    sep.map -> it.classList.remove \matched
    if matched.0 => matched.0.classList.add \matched


  destroy: ->
