module.exports = do
  custom: attrs: <[card-score]>
  init: ->
    if @view-mode =>
      @block.addEventListener \click, (e) -> 
        node = btools.trace-up \.flip-card, e.target
        if !node => return
        btools.qsAll(\.flip-card.chosen, @block).map -> it.classList.remove \chosen
        node.classList.add \chosen
  destroy: ->
