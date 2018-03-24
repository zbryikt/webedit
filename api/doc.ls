require! <[fs bluebird]>
require! <[../engine/aux]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect

engine.app.get \/page/create, aux.needlogin (req, res) ->
  id = Math.random!toString 16 .substring 2
  io.query "insert into doc (slug,owner) values ($1, $2)", [id, req.user.key]
    .then -> res.redirect "/page/#id/"

engine.app.get \/page/:id/view, (req, res) ->
  doc = connect.get \doc, req.params.id
  (e) <- doc.fetch
  res.render \page/view.jade, {data: doc.data}

engine.app.get \/page/:id/clone, aux.needlogin (req, res) ->
  newid = Math.random!toString 16 .substring 2
  srcdoc = connect.get \doc, req.params.id
  (e) <- srcdoc.fetch
  desdoc = connect.get \doc, newid
  if !srcdoc.type or !srcdoc.data => return res.status 404 .send!
  (e) <- desdoc.fetch
  desdoc.create srcdoc.data
  io.query "insert into doc (slug,owner) values ($1, $2)", [newid, req.user.key]
    .then -> res.redirect "/page/#newid/"

engine.router.api.get \/me/doc/, aux.needlogin (req, res) ->
  io.query "select * from doc where owner = $1", [req.user.key]
    .then (r={}) -> res.send r.rows or []
