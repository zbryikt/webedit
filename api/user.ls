require! <[fs fs-extra bluebird crypto read-chunk sharp]>
require! <[../engine/aux ../src/ls/config/errcode]>
(engine,io) <- (->module.exports = it)  _

api = engine.router.api
app = engine.app

api.put \/user/:id, aux.numid false, (req, res) ->
  if !req.user or req.user.key != +req.params.id => return aux.r403 res
  {displayname} = req.body{displayname}
  displayname = "#displayname".trim!
  if displayname.length > 30 or displayname.length < 1 => return aux.r400 res, errcode("profile.displayname.length")
  io.query "update users set (displayname) = ($1) where key = $2",
  [displayname, req.user.key]
    .then ->
      req.user <<< {displayname}
      req.login req.user, -> res.send!
      return null

app.put \/me/avatar, engine.multi.parser, (req, res) ->
  if !req.user => return aux.r403 res
  if !req.files.image => return aux.r400 res
  fs-extra.ensure-dir "static/s/avatar/"
    .then ->
      sharp req.files.image.path
        .resize 200,200
        .toFile "static/s/avatar/#{req.user.key}.png", (err, info) ->
          if err => return aux.r500 res, "#{err}"
          res.send!
    .catch -> aux.r500 res

api.put \/me/passwd/, (req, res) ->
  {n,o} = req.body{n,o}
  if !req.user or !req.user.key or !req.user.usepasswd => return aux.r400 res
  if n.length < 4 => return aux.r400 res, errcode("profile.newPassword.length")
  io.query "select password from users where key = $1", [req.user.key]
    .then ({rows}) ->
      if !rows or !rows.0 => return aux.reject 403
      io.authio.user.compare o, rows.0.password
        .catch -> return aux.reject 403, errcode("profile.oldPassword.mismatch")
    .then -> io.authio.user.hashing n, true, true
    .then (pw-hashed) ->
      req.user <<< {password: pw-hashed}
      io.query "update users set (password) = ($1) where key = $2", [pw-hashed, req.user.key]
    .then -> req.login(req.user, -> res.send!); return null
    .catch aux.error-handler res

api.put \/me/su/:id, (req, res) ->
  if !req.user or req.user.username != engine.config.superuser => return aux.r403 res
  io.query "select * from users where key = $1", [+req.params.id]
    .then (r={})->
      if !r.rows or !r.rows.0 => return aux.reject 404
      req.user <<< r.rows.0
      req.logIn r.rows.0, -> res.send!
      return null
    .catch aux.error-handler res

