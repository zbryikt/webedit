module.exports = do
  debug: true
  _interactize: (blocks) ->
    btools.qsAll \.postit, @block .map (postit) ->
      if postit.inited => return
      postit.inited = true
      if blocks => postit.style.transform = null
      interact postit
        .draggable do
          autoScroll: true
          onmove: (e) ->
            postit.removeAttribute \edit-transition
            target = e.target
            {x,y} = target.{}ptr
            ret = /translate\(([0-9-.]+)px[ ,]+([0-9-.]+)px\)/.exec(target.style.transform or "")
            if isNaN(x) or !x => x = if ret => +ret.1 else 0
            if isNaN(y) or !y => y = if ret => +ret.2 else 0
            [x,y] = [x + e.dx, y + e.dy]
            target.style.transform = "translate(#{x}px,#{y}px)"
            target.ptr = {x,y}

  change: -> if !@view-mode => @_interactize it
  init: ->
    if @view-mode => @block.classList.add \view-mode
    else @_interactize!
  update: ->
  destroy: ->
  library: interactjs: \https://cdn.jsdelivr.net/npm/interactjs@1.3.3/dist/interact.min.js
