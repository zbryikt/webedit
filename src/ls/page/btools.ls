btools = do
  # one can use "btools.qs(...).map -> ... " to prevent exception on null result
  qs: (selector, root = document) -> if root.querySelector(selector) => [that] else []
  qsp: (selector, root = document) -> new Promise (res, rej) ->
    ret = root.querySelector selector
    if ret => return res ret
    else return rej!

  # make it simpler to iterate as an array
  qsAll: (selector, root = document) -> Array.from(root.querySelectorAll(selector))
  # text node cannot be selected via css selector.
  # we use a [selector, idx] input to select text node if needed.
  from-eid-selector: (selector) ->
    if !selector => return null
    if !Array.isArray(selector) => return document.querySelector(selector)
    node = document.querySelector(selector.0)
    return if node and node.childNodes and selector.1 => node.childNodes[selector.1 - 1] else node
  get-eid-selector: (node) ->
    if !node => return null
    [selector, text-idx] = ["", null]
    if node.nodeType == 3 =>
      [child, node] = [node, node.parentNode]
      text-idx = Array.from(node.childNodes).indexOf(child) + 1
    while node and (node.getAttribute or node.nodeType == 3) =>
      if node.nodeType != 3 and node.getAttribute(\eid) => break
      [child, node] = [node, node.parentNode]
      idx = Array.from(node.childNodes).indexOf(child) + 1
      selector = " > *:nth-child(#idx)" + selector
    return if node and node.getAttribute and node.getAttribute(\eid) =>
      ["*[eid='#that']" + selector, text-idx]
    else null
