puredom = do
  use-attr: (attrs) ->
    if !@use-attr.hash => @use-attr.hash = {}
    for item in attrs => if !@use-attr.hash[item] =>
      @use-attr.hash[item] = true
      @options.ADD_ATTR.push item
  options:
    ADD_ATTR: [
      "style",
      "eid", # for quick reference of certain node. mainly used in cursor save / load
      "auto-content", # content generated automatically so dont sync its content
      "repeat-host", "repeat-item", "repeat-class",
      "base-block",
      "edit-text", "edit-text-placeholder", # for anything to keep in attr in this node
      "image"
    ]
  sanitize: (code = "") -> DOMPurify.sanitize code, @options
