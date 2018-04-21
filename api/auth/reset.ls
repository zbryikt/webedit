require! <[bluebird fs fs-extra crypto]>
require! <[../../engine/aux ../util/mail.ls]>
(engine,io) <- (->module.exports = it)  _

engine.router.api.post \/me/passwd/reset/:token, (req, res) ->
  token = req.params.token
  password = {plain: req.body.password}
  io.authio.user.hashing password.plain, true, true
    .then (ret) ->
      password.hashed = ret
      io.query(["select users.key from users,pwresettoken"
      "where pwresettoken.token=$1 and users.key=pwresettoken.owner"].join(" "),[token])
    .then (r={}) ->
      if !r.[]rows.length => return aux.reject 403
      user = r.rows.0
      user.password = password.hashed
      io.query "update users set (password,usepasswd) = ($2,$3) where key = $1", [user.key, user.password, true]
    .then -> io.query "delete from pwresettoken where pwresettoken.token=$1", [token]
    .then ->
      res.redirect \/auth/reset/done
      return null
    .catch aux.error-handler res, true

engine.app.get \/me/passwd/reset/:token, (req, res) ->
  token = req.params.token
  if !token => return aux.r400 res, "", true
  io.query "select owner,time from pwresettoken where token = $1", [token]
    .then (r={})->
      if !r.[]rows.length => return aux.reject 403, ""
      obj = r.rows.0
      if new Date!getTime! - new Date(obj.time).getTime! > 1000 * 600 =>
        res.redirect \/auth/reset/expire/
        return null
      res.redirect "/auth/reset/change/?token=#token"
      return null
    .catch aux.error-handler res, true

engine.router.api.post \/me/passwd/reset, (req, res) ->
  email = "#{req.body.email}".trim!
  if !email => return aux.r400 res, "did you provide you email?", true
  obj = {}
  io.query "select key from users where username = $1", [email]
    .then (r={}) ->
      if r.[]rows.length == 0 => return aux.reject 404
      time = new Date!
      obj <<< {key: r.rows.0.key, hex: "#{r.rows.0.key}" + (crypto.randomBytes(30).toString \hex), time: time }
      io.query "delete from pwresettoken where owner=$1", [obj.key]
    .then -> io.query "insert into pwresettoken (owner,token,time) values ($1,$2,$3)", [obj.key, obj.hex, obj.time]
    .then -> mail.by-template \reset-password, email, {token: obj.hex}
    .then -> 
      res.redirect \/auth/reset/sent/
      return null
    .catch aux.error-handler res, true

