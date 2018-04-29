module.exports = do
  config:
    editable: false
  wrap: (block, collab, view-mode) ->
    if block.inited or !view-mode => return
    block.inited = true
    block.addEventListener \click, (e) ->
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
