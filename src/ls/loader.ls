block-loader = do
  cache: {}
  get: (name) -> new Promise (res, rej) ~>
    if @cache[name] => return res that
    $.ajax do
      url: "/templates/#name.html"
    .done (ret) ~> 
      @cache[name] = ret
      init-script name .then -> return res ret
