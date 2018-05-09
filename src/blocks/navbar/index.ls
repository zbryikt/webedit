module.exports = do
  init: -> @change!
  change: ->
    bar = @block.querySelector(\nav.navbar)
    bk = @block.style.backgroundColor or @block.style.backgroundImage or null
    fk = @block.style.color or null
    (node) <~ btools.qs('nav.navbar', @block).map _
    if bk => node.style.background = bk
    if fk => node.style.color = fk

