require! <[fs marked]>

unescape = (text) -> text.replace /\&\#[0-9]*;|&amp;/g, (code) ->
  if /amp/.exec(code) => return \&
  return String.fromCharCode(code.match(/[0-9]+/))

option = do
  html: breaks: true, renderer: new marked.Renderer!
  text: do
    breaks: true
    renderer: do ->
      render = new marked.Renderer!
      render
        ..br = -> "\r\n"
        ..link = (href, title, text) -> unescape text
        ..paragraph = (text) -> "#{unescape(text)}\r\n\r\n"
        ..heading = (text) -> "=== #{unescape(text)} ==="
        ..image = (href, title, text) -> ""
      render

module.exports = do
  to-text: ->
    marked.set-options option.text
    return marked it
  to-html: ->
    marked.set-options option.html
    return marked it
