module.exports = do
  init: ->
    if !@view-mode => return
    btools.qsAll \.number, @block .map ->
      ret = /^(.*?)(\d+)(.*?)$/.exec(it.innerText)
      if !ret => return
      it.value = +ret.2
      it.value-prefix = if ret.1 != null => ret.1 else ''
      it.value-postfix = if ret.3 => ret.3 else ''

      if isNaN(it.value) => return
      it.speed = 20 + Math.random! * 40
      it.current-value = 0
      it.innerText = "#{it.value-prefix}0#{it.value-postfix}"
    @scroll = (e) ~> 
      box = @block.getBoundingClientRect!
      if box.y <= window.innerHeight and !@animating =>
        @animating = true
        @animate!
        document.removeEventListener \scroll, @scroll
    document.addEventListener \scroll, @scroll
    @scroll!
  animate: ->
    numbers = btools.qsAll \.number, @block
    remains = numbers
      .map ->
        if !it.speed => return false
        it.current-value += (it.value / it.speed)
        if it.current-value >= it.value and it.value > 0 => it.current-value = it.value
        else if it.current-value <= it.value and it.value < 0 => it.current-value = it.value
        it.innerText = "#{it.value-prefix}#{Math.round(it.current-value)}#{it.value-postfix}"
        it.current-value != it.value
      .filter -> it
      .length
    if remains => requestAnimationFrame (~> @animate!)

  destroy: ->
    if !@view-mode => return
    document.removeEventListener \scroll, @scroll

