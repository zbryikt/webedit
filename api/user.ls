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

api.post \/me/sync/, (req, res) ->
  if !req.user or !req.user.key => return aux.r400 res
  res.send req.user

app.get \/me/invoice/:id, (req, res) ->
  if !(req.user and req.user.key) => return aux.r403 res
  if !req.params.id or isNaN(+req.params.id) => return aux.r400 res
  local = {}
  io.query("""
  select * from payment where owner = $1 and key = $2
  order by createdtime desc""", [req.user.key, +req.params.id])
    .then (r={}) ->
      if !r.rows or !r.rows.0 => return aux.reject 404
      local.payment = payment = r.rows.0
      payment.gwinfo = {common: payment.{}gwinfo.common or null}
      if payment.type == 'subscription' => io.query "select * from bill_agreement where key = $1", [payment.ref]
      else io.query "select * from purchase where key = $1", [payment.ref]
    .then (r={}) ->
      if r and r.rows and r.rows.length => ref = r.rows.0
      if local.payment.state == \refunded =>
        res.render \me/billing/invoice-refunded.jade, {data: {payment: local.payment, entry: ref}}
      else res.render \me/billing/invoice.jade, {data: {payment: local.payment, entry: ref}}
      return null
    .catch aux.error-handler res

app.get \/me/billing/, (req, res) ->
  if !(req.user and req.user.key) => return res.redirect \/auth/?nexturl=/me/billing/
  bluebird.resolve!
    .then -> io.query("""
      select * from bill_agreement
      where owner = $1 and state = ANY('{active,canceled,suspended}')
      order by createdtime desc
      """, [req.user.key])
    .then (r={}) ->
      agreement = r.[]rows.filter(-> it.state == 'active').0 or r.rows.0
      if agreement => agreement = agreement{key,state,gwinfo,invoice,createdtime,lastpay,plan}
      res.render \me/billing/index.jade, {agreement}
      return null
    .catch aux.error-handler res

api.get \/payment/, (req, res) ->
  if !req.user or !req.user.key => return aux.r403 res
  io.query("""
    select key,name,type,ref,amount,gwinfo,createdtime,currency,gateway,state from payment
    where owner = $1 order by createdtime desc
  """, [req.user.key])
    .then (r={}) ->
      return res.send r.rows or []
    .catch aux.error-handler res
