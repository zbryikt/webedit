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
    
publish-text = document.querySelector '#landing-publish-text'
publish-text.content = publish-text.innerText
publish-text.innerText = ''

drag-sample = document.querySelector '#landing-drag-sample'

scroll-check = -> 
  h = window.innerHeight
  y = window.pageYOffset

  blocks.map (block) ->
    top = block.getBoundingClientRect!top
    if top < h * 0.8 and !block.revealed and !/ld/.exec(block.getAttribute(\class)) =>
      className = block.getAttribute \reveal-block or 'ldt-fade-in'
      block.setAttribute \class, block.getAttribute(\class) + ' ld ' + className
  top = publish-text.getBoundingClientRect!top
  if top < h * 0.8 and !publish-text.handler =>
    t = publish-text.content
    c = 0
    publish-text.handler = setInterval (->
      publish-text.innerText = t.substring(0,c)
      c := c + 1
      if c > t.length => clearInterval publish-text.handler
    ), 100
  top = drag-sample.getBoundingClientRect!top
  if top < h * 0.8 => drag-sample.setAttribute \class, 'active'




window.addEventListener \scroll, scroll-check
scroll-check!

