module.exports = do
  editable: false
  change: (blocks, source) ->
    clearTimeout @handle
    if source => @handle = setTimeout (~> @balance!), 10
  balance: ->
    # auto balance image height in the same row
    hash = {}
    btools.qsAll \.thumb, @block .map ->
      box = it.getBoundingClientRect!
      key = Math.round(box.y)
      hash[][key].push [it, box.height]
    for key, list of hash
      max = Math.max.apply null, list.map -> it.1
      vote = {}
      list.map -> vote[it.1] = (if vote[it.1] => that else 0) + 1
      vote = [[k,v] for k,v of vote]
      vote.sort (a,b) -> a.1 - b.1
      height = vote.0.0
      list.map -> it.0.style.height = "#{height}px"
    if @collab => @collab.action.edit-block @block
  init: ->
    if !@view-mode => return
    @balance!
    @block.addEventListener \click, (e) ->
      if !e.target or !e.target.classList => return
      target = e.target
      while target and target.classList
        if target.classList.contains(\thumb) => break
        target = target.parentNode
      if !target.classList.contains(\thumb) => return
      img = target.style.backgroundImage
      btools.qs ".modal-block-gallery" .map (modal) ->
        $(modal).modal('show')
        content = modal.querySelector '.modal-content > div'
        content.style.backgroundImage = img
    if document.querySelector ".modal-block-gallery" => return
    root = document.createElement("div")
    root.setAttribute \class, "modal fade modal-block-gallery"
    dialog = document.createElement("div")
    dialog.setAttribute \class, "modal-dialog modal-dialog-centered"
    content = document.createElement("div")
    content.setAttribute \class, "modal-content"
    inner = document.createElement("div")
    inner.setAttribute \class, 'inner'
    root.appendChild dialog
    dialog.appendChild content
    content.appendChild inner
    document.body.appendChild root
    root.addEventListener \click, -> $(root).modal('hide')
