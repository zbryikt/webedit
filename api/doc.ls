require! <[fs bluebird]>
require! <[../engine/aux]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect
sharedb = engine.sharedb.obj

# key parameters:
# req.agent.stream.ws for stream
# req.agent.stream.user for user session object
# req.id for doc id
# req.snapshot for doc snapshot
sharedb.use 'doc', (req, cb) ->
  # no websocket stream - it's server stream
  if !req.agent.stream.ws => return cb!
  /* check req.agent.stream.user for accessibility */
  io.query "select owner from doc where slug = $1", [req.id]
    .then -> return cb!

sharedb.use 'after submit', (req, cb) ->
  if !(req.op and req.op.op) or req.collection != 'doc' => return cb!
  op = req.op.op
  op-title = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'title' and it.si))[* - 1]
  if op-title =>
    title = op-title.si
    return io.query("update doc set title = ($1) where slug = $2", [title, req.id]).finally -> cb!

  op-thumbnail = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'thumbnail' and it.si))[* - 1]
  if op-thumbnail =>
    thumb = op-thumbnail.si
    return io.query("update doc set thumbnail = ($1) where slug = $2", [thumb, req.id]).finally -> cb!

  return cb!

engine.app.get \/page/create, aux.needlogin (req, res) ->
  id = Math.random!toString 16 .substring 2
  io.query "insert into doc (slug,owner) values ($1, $2)", [id, req.user.key]
    .then -> res.redirect "/page/#id/"

engine.app.get \/page/:id/view, (req, res) ->
  if !req.params.id => return aux.r404 res, null, true
  doc = connect.get \doc, req.params.id
  (e) <- doc.fetch
  if e or !doc.data => return aux.r404 res, null, true
  promise = if (!doc.data.attr or !doc.data.attr.is-public) => # is private
    if !req.user or !req.user.key => aux.reject 404 # .. and not login -> 404
    else # .. and is login ...
      io.query "select owner from doc where slug = $1", [req.params.id]
        .then (r={}) -> # .. no record or not owner -> 404
          if !r.rows or !r.rows.0 or req.user.key != r.rows.0.owner => return aux.reject 404
  else bluebird.resolve! # ... is public
  promise
    .then -> res.render \page/view.jade, {data: doc.data}
    .catch aux.error-handler(res, true)

engine.app.get \/page/:id/clone, aux.needlogin (req, res) ->
  if !req.params.id => return aux.r404 res
  newid = Math.random!toString 16 .substring 2
  srcdoc = connect.get \doc, req.params.id
  (e) <- srcdoc.fetch
  desdoc = connect.get \doc, newid
  if !srcdoc.type or !srcdoc.data => return res.status 404 .send!
  (e) <- desdoc.fetch
  desdoc.create srcdoc.data
  io.query "select * from doc where slug = $1",[req.params.id]
    .then (r={}) ->
      data = r.rows.0
      if !data => return aux.reject 404
      io.query "insert into doc (slug,owner,title,thumbnail) values ($1, $2, $3, $4)", [
        newid, req.user.key, data.title or 'untitled', data.thumbnail or ''
      ]
    .then ->
      res.redirect "/page/#newid/"
      return null
    .catch aux.error-handler(res, true)

engine.router.api.delete \/page/:id/, aux.needlogin (req, res) ->
  if !req.params.id => return aux.r404 res
  io.query "select key,deleted from doc where owner = $1 and slug = $2", [req.user.key, req.params.id]
    .then (r={}) ->
      if !r.rows or !r.rows.0 or r.rows.0.deleted => return aux.reject 404
      io.query "update doc set deleted = true where owner = $1 and slug = $2", [req.user.key, req.params.id]
    .then -> res.send!
    .catch aux.error-handler res

engine.router.api.get \/me/doc/, aux.needlogin (req, res) ->
  io.query """
  select doc.*,users.displayname from doc,users
  where doc.owner = $1 and users.key = doc.owner and doc.deleted is not true
  """, [req.user.key]
    .then (r={}) -> res.send r.rows or []

engine.router.api.get \/page/:id/revisions, aux.needlogin (req, res) ->
  io.query "select count(version) from ops where doc_id = $1", [req.params.id]
    .then (r={}) -> res.send (r.[]rows.0 or {})
