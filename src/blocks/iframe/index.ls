module.exports = do
  config:
    editable: false
  transform: text: (text) ->
    ret = /src="([^"]+)"/.exec(text)
    if ret => return ret.1
    return text

