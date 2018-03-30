<- $(document).ready _
imgs = Array.from(document.querySelectorAll \.reveal)
shadow = document.createElement \div
shadowImage = document.createElement \div
shadow.setAttribute \class, \reveal-shadow
document.body.appendChild shadow
shadow.appendChild shadowImage
shadow.addEventListener \click, ->
  shadow.style <<< shadow.source <<< do
    opacity: 0, zIndex: -1

blocks = Array.from(document.querySelectorAll '[reveal-block]')
  
Array.from(document.querySelectorAll \.lightbox).map (img) ->
  img.addEventListener \click, ->
    box = img.getBoundingClientRect!
    shadow.setAttribute \class, 'reveal-shadow'
    shadow.box = box
    shadow.source = do
      width: "#{box.width}px", height: "#{box.height}px"
      top: "#{box.top}px", left: "#{box.left}px", zIndex: 9999
    shadow.style <<< shadow.source
    shadowImage.style.backgroundImage = "url(#{img.getAttribute(\data-lg-src) or img.getAttribute(\data-src)})"
    setTimeout (->
      shadow.setAttribute \class, 'reveal-shadow active'
      shadow.style <<< do
        width: "100%", height: "100%"
        top: "0", left: "0", opacity: 1
    ), 10
    

scroll-check = -> 
  h = window.innerHeight
  y = window.pageYOffset
  blocks.map (block) ->
    top = block.getBoundingClientRect!top
    if top < h * 0.8 and !block.revealed and !/ld/.exec(block.getAttribute(\class)) =>
      className = block.getAttribute \reveal-block or 'ldt-fade-in'
      block.setAttribute \class, block.getAttribute(\class) + ' ld ' + className
  /*
  imgs.map (img) ->
    top = img.getBoundingClientRect!top
    if top < h * 0.8 and !img.revealed =>
      img.revealed = true
      img.node = new Image!
      img.node.onload = ->
        setTimeout (-> 
          img.style.backgroundImage = "url(#{img.getAttribute(\data-src) or ''})"
          cls = img.getAttribute(\class).split(' ')
          if !(~cls.indexOf(\on)) => cls.push \on
          img.setAttribute(\class, cls.join(' '))
        ), Math.random! * 200
      img.node.src = img.getAttribute(\data-src) or ''
  */

window.addEventListener \scroll, scroll-check
scroll-check!
