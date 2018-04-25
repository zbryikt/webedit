module.exports = do
  config:
    editable: false
  transform: text: (text) ->
    ret = /src="([^"]+)"/.exec(text)
    return if ret => ret.1 else text
    # if we want to force https ...
    /*
    ret = if ret => ret.1 else text
    ret = ret.replace /^http:/, ''
    return ret
    */
