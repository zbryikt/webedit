module.exports = do
  wrap: (node) ->
    node.addEventListener \click, (e) ->
      if !/choice/.exec(e.target.getAttribute(\class)) => return
      target = e.target
      className = target.getAttribute \class .split(' ')
      len = className.length
      className = className.filter(-> it != 'active')
      is-active = className.length != len
      Array.from(target.parentNode.childNodes).map ->
        it.setAttribute \class, it.getAttribute(\class).replace(/ ?active ?/, ' ').trim!
      if is-active => target.setAttribute(className.join(' ') ++ ' active')
