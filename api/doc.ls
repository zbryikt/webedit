require! <[fs bluebird]>
require! <[../engine/aux ../engine/utils/codeint]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect
sharedb = engine.sharedb.obj

check-permission = (userkey, doc-slug) ->
  io.query([
    "select doc.* from doc",
    """ 
    left join doc_perm as p1 on p1.doc = doc.key and p1.uid = $1 and p1.perm > 10
    where
      doc.slug = $2 and
      (
	doc.owner = $1 or doc.privacy <= 10 or doc.privacy is null or
	(p1.uid = $1 and p1.perm > 10)
      )
    """,
    "limit 1"
  ].join(' '), [userkey, doc-slug])
    .then (r={}) -> return (r.rows or []).0

# key parameters:
# req.agent.stream.ws for stream
# req.agent.stream.user for user session object
# req.id for doc id
# req.snapshot for doc snapshot
sharedb.use 'doc', (req, cb) ->
  # no websocket stream - it's server stream
  if !req.agent.stream.ws => return cb!
  uid = if req.agent.stream.user => that.key else null
  check-permission uid, req.id
    .then (ret) ->
      if !ret => return aux.reject 403
      req.agent.stream.approved = true
      return cb!
    .catch (e) ->
      if e and !e.code => console.log e
      return cb 'access denied'

sharedb.use 'submit', (req, cb) ->
  if !req.agent.stream.approved => return
  return cb!

sharedb.use 'after submit', (req, cb) ->
  if !(req.op and req.op.op) or req.collection != 'doc' => return cb!
  op = req.op.op
  op-title = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'title' and it.si))[* - 1]
  #TODO verify title and thumbnail
  if op-title =>
    title = op-title.si
    return io.query("update doc set title = ($1) where slug = $2", [title, req.id]).finally -> cb!

  op-thumbnail = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'thumbnail' and it.si))[* - 1]
  if op-thumbnail =>
    thumb = op-thumbnail.si
    return io.query("update doc set thumbnail = ($1) where slug = $2", [thumb, req.id]).finally -> cb!

  op-set-public = op.filter(-> it.p.0 == 'attr' and it.od and it.oi and it.od.is-public != it.oi.is-public).0
  if op-set-public =>
    io.query "update doc set publish = ($1) where slug = $2", [op-set-public.oi.is-public, req.id]
      .finally -> cb!
  return cb!

engine.app.get \/page/create, aux.needlogin (req, res) ->
  id = codeint.uuid!
  io.query "insert into doc (slug,owner) values ($1, $2)", [id, req.user.key]
    .then -> res.redirect "/page/#id/"

engine.app.get \/page/:id/view, (req, res) ->
  if !req.params.id => return aux.r404 res, null, true
  [is-preview, local] = [!!req.{}query.preview, {}]
  # if it's in preview mode, then we only accept requests with Referer from our site.
  if is-preview and (req.header('Referer') or {}).indexOf("#{engine.config.domain}/page/#{req.params.id}") =>
    return aux.r404 res, null, true
  io.query "select * from doc where slug = $1", [req.params.id]
    .then (r={}) ->
      if !(r.rows and r.rows.length) => return aux.reject 404 # no such doc
      if r.rows.0.publish => return bluebird.resolve r.rows.0 # already public
      else if !is-preview => return aux.reject 404 # not publish and is not preview
      else check-permission (req.user or {}).key, req.params.id # this is only allowed if it's a preview
    .then (ret) ->
      if !ret => return aux.reject 403 # no permission
      local <<< ret
      io.query "select data from snapshots where doc_id = $1", [req.params.id]
    .then (r={}) ->
      ret = (r.rows or []).0
      if !ret => aux.reject 404 # snapshot not found
      res.render \page/view.jade, do
        data: ret.data, config: {gacode: local.gacode}, preview: is-preview, id: req.params.id
    .catch aux.error-handler res

# this rule is only for custom domain.
engine.app.get \/view/:id, (req, res) ->
  [id, domain] = [(req.params.id or '').replace(/^id-/,''), req.get('host')]
  # not custom domain -> bye
  if !domain or domain == engine.config.domain => return aux.r404 res
  io.query """
  select doc.slug, doc.gacode, snapshots.data from doc,snapshots
  where
    doc.domain = $1
    #{if id => "and doc.path = $2 " else ''}
    and snapshots.doc_id = doc.slug
    and doc.publish = true
  """, [domain] ++ (if id => [id] else [])
    .then (r={}) ->
      ret = (r.[]rows.0 or {})
      {slug, data} = ret{slug, data}
      if !slug or !data => return res.status(404).send!
      config = {slug, domain, id, gacode: ret.gacode}
      res.render \page/view.jade, {data: data, config: config, id: slug}
      return null

engine.app.get \/page/:id/clone, aux.needlogin (req, res) ->
  if !req.params.id => return aux.r404 res
  newid = codeint.uuid!
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
  io.query("""
    select
      doc.*,
      u2.displayname,
      array_agg(u1.key) filter (where u1.key is not null) as perm_key,
      array_agg(u1.displayname) filter (where u1.key is not null) as perm_name,
      array_agg(u1.username) filter (where u1.key is not null) as perm_email,
      array_agg(p1.perm) filter (where u1.key is not null) as perm
    from users as u2, doc
    left join doc_perm as p1 on doc.key = p1.doc
    left join users as u1 on p1.uid = u1.key
    left join doc_perm as p2 on doc.key = p2.doc and p2.uid = $1 and p2.perm > 10
    where
      u2.key = doc.owner and
      doc.deleted is not true and
      (
        doc.owner = $1 or
        (p2.doc = doc.key and p2.uid = $1 and p2.perm > 10)
      )
    group by doc.key, u2.key
    order by doc.createdtime desc
  """, [req.user.key])
    .then (r={}) -> res.send r.rows or []
    .catch aux.error-handler res

engine.router.api.get \/page/:id/revisions, aux.needlogin (req, res) ->
  io.query "select count(version) from ops where doc_id = $1", [req.params.id]
    .then (r={}) -> res.send (r.[]rows.0 or {})

engine.router.api.put \/page/:id/perm, aux.needlogin (req, res) ->
  if !req.params.id or !req.body.emails or !req.body.perm? => return aux.r404 res
  if isNaN(+req.body.perm) => return aux.r400 res
  local = {perm: +req.body.perm}
  io.query("""select key,owner from doc where slug = $1 and owner = $2""", [req.params.id, req.user.key])
    .then (r={}) ->
      if !r.rows or !r.rows.length => return aux.reject 404
      local.dockey = r.rows.0.key
      local.emails = req.body.emails.split \, .map -> it.trim!
      io.query("select key,username,displayname from users where username = ANY($1)", [local.emails])
    .then (r={}) ->
      local.users = rows = (r.rows or [])
      [query,params] = [[], [local.dockey, local.perm]]
      for idx from 0 til rows.length =>
        query.push "($1,$2,$#{idx + 3})"
        params.push rows[idx].key
      query = query.join(',')
      if rows.length =>
        io.query("""
        insert into doc_perm (doc,perm,uid) values #query
        on conflict (doc,uid) do update set perm = $2
        """, params)
      else promise.resolve!
    .then -> res.send local.users
    .catch aux.error-handler res


engine.router.api.put \/page/:id/, aux.needlogin (req, res) ->
  if !req.params.id => return aux.r404 res
  io.query("""
  select owner,title,thumbnail,privacy from doc where slug = $1 and owner = $2
  """, [req.params.id, req.user.key])
    .then (r={}) ->
      if !r.[]rows.length => return aux.reject 403
      ret = r.rows.0
      args = <[title thumbnail domain path gacode tags privacy]>.map -> req.body[it] or ret.it
      if !args.5 => args.5 = ""
      args.5 = (if Array.isArray(args.5) => args.5 else if !(args.5 and args.5.split) => [] else args.5.split(\,))
      args.5 = JSON.stringify(args.5.filter(->it))
      args.6 = +args.6
      if isNaN(args.6) => args.6 = null
      #TODO verify parameters
      #TODO only pro user can update domain,path and gacode
      io.query("""
      update doc set (title,thumbnail,domain,path,gacode,tags,privacy) = ($3, $4, $5, $6, $7, $8, $9)
      where slug = $1 and owner = $2""",
      [req.params.id, req.user.key] ++ args
      )
    .then -> res.send!
    .catch aux.error-handler res
