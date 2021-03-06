module.exports = do
  editable: false
  transform-text: (text) ->
    if /youtube\./.exec(text) =>
      ret = /v=(.+)[&#?]?/.exec(text)
      return if ret => "https://www.youtube.com/embed/#{ret.1}" else text
    else if /youtu\.be/.exec(text) =>
      ret = /youtu\.be\/(.+)[&#?]?/.exec(text)
      return if ret => "https://www.youtube.com/embed/#{ret.1}" else text
    else if /vimeo\./.exec(text) =>
      if /channels/.exec(text) => ret = /vimeo\.com\/channels\/staffpicks\/([^?&#]+)/.exec(text)
      else ret = /vimeo\.com\/([^?&#]+)/.exec(text)
      return if ret => "https://player.vimeo.com/video/#{ret.1}" else text
    else return "about:blank"
    if !/^https?:\/\//.exec(text) => return "about:blank"
