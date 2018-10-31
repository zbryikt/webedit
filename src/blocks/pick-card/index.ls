module.exports = do
  custom: attrs: <[card-score]>
  init: ->
    if @view-mode =>
      @block.addEventListener \click, (e) ~> 
        node = btools.trace-up \.flip-card, e.target
        if !node => return
        btools.qsAll(\.flip-card.chosen, @block).map -> it.classList.remove \chosen
        node.classList.add \chosen
        answer = node.querySelector \.answer
        if !@result =>
          @result = document.createElement \div
          @result.classList.add \result
          @block.querySelector \.inner .appendChild @result
        @result.innerHTML = ''
        @result.appendChild answer.cloneNode true
        setTimeout (~>
          box = @result.getBoundingClientRect!
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

  destroy: ->
