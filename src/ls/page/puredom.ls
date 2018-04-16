puredom = do
  use-attr: (attrs) ->
    if !@use-attr.hash => @use-attr.hash = {}
    for item in attrs => if !@use-attr.hash[item] =>
      @use-attr.hash[item] = true
      @options.ADD_ATTR.push item
  options:
    ADD_ATTR: <[
      style
      repeat-host repeat-item base-block edit-text edit-text-placeholder image repeat-class
    ]>
  sanitize: (code = "") -> DOMPurify.sanitize code, @options
