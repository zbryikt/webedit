module.exports = do
  transform: do
    link: (link) ->
      if /youtube\./.exec(link) =>
        ret = /v=(.+)[&#]?/.exec(link)
        return if ret => "https://www.youtube.com/embed/#{ret.1}" else link
      else if /vimeo\./.exec(link) =>
        if /channels/.exec(link) => ret = /vimeo\.com\/channels\/staffpicks\/([^?&#]+)/.exec(link)
        else ret = /vimeo\.com\/([^?&#]+)/.exec(link)
        return if ret => "https://player.vimeo.com/video/#{ret.1}" else link

  config:
    editable: false
