require! <[fs bluebird colors js-yaml]>
require! <[nodemailer nodemailer-mailgun-transport]>
require! <[./md ../../engine/aux ../../secret]>

mailgun = nodemailer.createTransport(nodemailer-mailgun-transport(secret.mailgun))

# sample-payload = do
#   from: '"Your DisplayName" <your@email.address>'
#   to: "someone@some.where"
#   subject: "Your Title"
#   text: """  .... ( your text ) .... """
#   html: """  .... ( your html ) .... """

module.exports = do
  send: (payload) -> new bluebird (res, rej) ->
    (e,i) <- mailgun.sendMail payload, _
    if !e => return res!
    console.log "[MAILGUN] SendMail failed: ".red, e
    return rej(aux.error 500, "failed to send mail. try later?")

  # content -> text / html
  send-from-md: (payload, map = {}) -> new bluebird (res, rej) ->
    payload.text = md.to-text(payload.content or '')
    payload.html = md.to-html(payload.content or '')
    for k,v of map =>
      payload.text = payload.text.replace new RegExp("\#{#k}", "g"), v
      payload.html = payload.html.replace new RegExp("\#{#k}", "g"), v
    delete payload.content
    module.exports.send payload .then -> res!

  by-template: (name, email, map = {}, config = {}) -> new bluebird (res, rej) ->
    path = if config.path => that else '.'
    (e, content) <- fs.read-file "#path/config/mail/#name.yaml", _
    if e =>
      console.log "[MAIL] send mail failed: ", e
      return rej(aux.error 500, "failed to send mail. try later?")
    try
      payload = js-yaml.safe-load content
    catch e
      console.log "[MAIL] send mail failed: ", e
      return rej(aux.error 500, "failed to send mail. try later?")
    option = from: payload.from, to: email, subject: payload.subject, content: payload.content
    if config.bcc => option.bcc = config.bcc
    module.exports.send-from-md(option, map)
      .then -> res!
      .catch (e) -> rej e
