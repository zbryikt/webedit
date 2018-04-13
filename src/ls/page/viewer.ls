blocks-manager = do
  code: do
    hash: {}
    add: (name, cb) ->
      module = {}
      cb module
      @hash[name] = module.exports
    wrap: (blocks, view-mode = false) ->
      if !blocks.length => blocks = [blocks]
      for block in blocks =>
        exports = @hash[block.getAttribute(\base-block)]
        if exports and exports.wrap => exports.wrap block, view-mode
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


