module.exports = do
  scroll: ->
    box = @block.getBoundingClientRect!
    y = (if box.y < 0 => scrolltop = -box.y else 0)
    @navblock.style.position = \absolute
    @navblock.style.transform = "translate(0,#{y}px)"

  init: ->
    (navblock) <~ btools.qs '.navblock', @block .map
    @navblock = navblock
    navblock.style.transform = ""
    document.addEventListener \scroll, (~> @scroll it)
    @scroll!
