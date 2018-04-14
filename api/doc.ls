require! <[fs bluebird]>
require! <[../engine/aux]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect
sharedb = engine.sharedb.obj

sharedb.use 'after submit', (req, cb) ->
  if !(req.op and req.op.op) or req.collection != 'doc' => return cb!
  op = req.op.op
  op = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'title' and it.si))[* - 1]
  if !op => return cb!
  title = op.si
  io.query("update doc set title = ($1) where slug = $2", [title, req.id]).finally -> cb!

engine.app.get \/page/create, aux.needlogin (req, res) ->
  id = Math.random!toString 16 .substring 2
  io.query "insert into doc (slug,owner) values ($1, $2)", [id, req.user.key]
    .then -> res.redirect "/page/#id/"

engine.app.get \/page/:id/view, (req, res) ->
  doc = connect.get \doc, req.params.id
  (e) <- doc.fetch
  if !doc.data.attr or !doc.data.attr.is-public => return aux.r404 res, null, true
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
  io.query "select doc.*,users.displayname from doc,users where doc.owner = $1 and users.key = doc.owner", [req.user.key]
    .then (r={}) -> res.send r.rows or []
