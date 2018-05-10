module.exports = do
  init: ->
    @block.addEventListener \click, (e) ~>
      if e.target.nodeName != \TH => return
      box = e.target.getBoundingClientRect!
      if e.offsetX > box.width - 30 and e.offsetX < box.width - 10 => is-add = true
      else if e.offsetX < 30 and e.offsetX > 10 => is-add = false
      else return
      index = Array.from(e.target.parentNode.childNodes).indexOf(e.target)
      btools.qsAll \tr, @block .map (tr, i) ->
        if is-add => tr.insertBefore tr.childNodes[index].cloneNode(true), tr.childNodes[index + 1]
        else tr.removeChild tr.childNodes[index]
      @collab.action.edit-block @block
