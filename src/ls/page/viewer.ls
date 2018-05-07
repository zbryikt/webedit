blocks-manager = do
  init: (block, options = {}) ->
    exports = @code.hash[block.getAttribute(\base-block)] or {}
    block.obj = new Object!
    block.obj.__proto__ = {} <<< block.obj.__proto__ <<< {init:(->),update:(->),destroy:(->)} <<< exports
    block.obj <<< block: block, page: page-object, view-mode: true <<< options
    block.obj.init!
    block.obj.update!

  code: do
    hash: {}
    add: (name, cb) ->
      module = {}
      cb module
      @hash[name] = module.exports
    wrap: ->
      [blocks, ...args] = arguments
      if !blocks.length => blocks = [blocks]
      for block in blocks => blocks-manager.init block
      page-object.fire \block.change, blocks

    libs: {}
    load-library: (types) ->
      hash = {}
      if !Array.isArray(types) => types = [types]
      for type in types => for k,v of ((@hash[type] or {}).library or {})
        hash[v] = true
      for url of hash =>
        script = document.createElement("script")
        script.setAttribute \type, 'text/javascript'
        script.setAttribute \src, url
        document.body.appendChild script
      @libs <<< hash


$(document).ready ->
  document.querySelectorAll 'a[href^="#"]' .forEach (node) ->
    node.addEventListener \click, (e) ->
      e.preventDefault!
      $('html,body').animate({ scrollTop: $($.attr(this, 'href')).offset().top }, 300)
