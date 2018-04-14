btools = do
  # one can use "btools.qs(...).map -> ... " to prevent exception on null result
  qs: (selector, root = document) -> [root.querySelector(selector)]
  qsp: (selector, root = document) -> new Promise (res, rej) ->
    ret = root.querySelector selector
    if ret => return res ret
    else return rej!

  # make it simpler to iterate as an array
  qsAll: (selector, root = document) -> Array.from(root.querySelectorAll(selector))
