puredom = do
  use-attr: (attrs) ->
    if !@use-attr.hash => @use-attr.hash = {}
    for item in attrs => if !@use-attr.hash[item] =>
      @use-attr.hash[item] = true
      @options.ADD_ATTR.push item
  options:
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "style",
      "eid", # for quick reference of certain node. mainly used in cursor save / load
      "auto-content", # content generated automatically so dont sync its content
      "repeat-host", "repeat-item", "repeat-class",
      "base-block",
      "edit-text", "edit-text-placeholder", # for anything to keep in attr in this node
      "editable", # editable element. we add a contenteditable on node with this additionally
      "image", "image-ratio"
      "resizable" # for letting block resize
    ]
  sanitize: (code = "", options = {}) ->
    merged-options = {} <<< @options
    for k,v of options =>
      if merged-options[k] and Array.isArray(merged-options[k]) => merged-options[k] ++= v
      else merged-options[k] = v
    DOMPurify.sanitize code, merged-options
