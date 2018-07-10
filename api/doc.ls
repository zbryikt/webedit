require! <[fs bluebird dns]>
require! <[../engine/aux ../engine/utils/codeint]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect
sharedb = engine.sharedb.obj

check-permission = (userkey, doc-slug, level = 10) ->
  io.query([
    "select doc.*,users.plan,p1.perm from users,doc",
    """ 
    left join doc_perm as p1 on p1.doc = doc.key and p1.uid = $1 and p1.perm >= $3
    where
      users.key = doc.owner and
      doc.slug = $2 and
      (
	doc.owner = $1 or doc.privacy <= $3 or doc.privacy is null or
	(p1.uid = $1 and p1.perm >= $3)
      )
    """,
    "limit 1"
  ].join(' '), [userkey, doc-slug, level])
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
  check-permission uid, req.id, 10
    .then (ret) ->
      if !ret => return aux.reject 403
      req.agent.stream.approved = ret.perm or (if ret.owner == uid => 40 else 30)
      return cb!
    .catch (e) ->
      if e and !e.code => console.log e
      return cb 'access denied'

sharedb.use 'submit', (req, cb) ->
  # no websocket stream - it's server stream
  if !req.agent.stream.ws => return cb!
  if !req.agent.stream.approved or req.agent.stream.approved < 20 => return cb 'access denied'
  return cb!

sharedb.use 'after submit', (req, cb) ->
  if !(req.op and req.op.op) or req.collection != 'doc' => return cb!
  op = req.op.op
  op-title = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'title' and it.si))[* - 1]
  #TODO verify title and thumbnail
  if op-title =>
    title = op-title.si
    io.query "select auto_og from doc where slug = $1", [req.id]
      .then (r={}) ->
        if !(r.rows and r.rows.0 and r.rows.0.auto_og) => return
        io.query("update doc set title = ($1) where slug = $2", [title, req.id])
      .catch -> # just ignore any error.
    return cb!

  op-thumbnail = op.filter(-> (it.p.0 == 'attr' and it.p.1 == 'thumbnail' and it.si))[* - 1]
  if op-thumbnail =>
    thumb = op-thumbnail.si
    io.query "select auto_og from doc where slug = $1", [req.id]
      .then (r={}) ->
        if !(r.rows and r.rows.0 and r.rows.0.auto_og) => return
        io.query("update doc set thumbnail = ($1) where slug = $2", [thumb, req.id])
      .catch -> # just ignore any error.
    return cb!

  op-set-public = op.filter(-> it.p.0 == 'attr' and it.od and it.oi and it.od.is-public != it.oi.is-public).0
  if op-set-public =>
    io.query "update doc set publish = ($1) where slug = $2", [op-set-public.oi.is-public, req.id]
      .catch -> # just ignore any error.
    return cb!
  return cb!

engine.app.get \/page/create, aux.needlogin (req, res) ->
  id = codeint.uuid!
  io.query "insert into doc (slug,owner) values ($1, $2)", [id, req.user.key]
    .then -> res.redirect "/page/#id/"

engine.app.get \/page/:id/view, (req, res) ->
  if !req.params.id => return aux.r404 res, null, true
  [is-preview, local] = [!!req.{}query.preview, {}]
  # if it's in preview mode, then we only accept requests with Referer from our site.
  if is-preview and !~(req.header('Referer') or '').indexOf("#{engine.config.domain}/page/#{req.params.id}") =>
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
      io.query """
      select snapshots.data,users.plan from users,doc,snapshots
      where snapshots.doc_id = $1 and users.key = doc.owner and doc.slug = snapshots.doc_id
      """, [req.params.id]
    .then (r={}) ->
      ret = (r.rows or []).0
      if !ret => aux.reject 404 # snapshot not found
      if !(ret.plan and ret.plan.name == \pro) => delete local.gacode # gacode only available for pro users
      ret.data.child = (ret.data.child or []).filter(->it)
      res.render \page/view.jade, do
        config: {} <<< local{gacode, title, description, thumbnail, privacy}
        data: ret.data, preview: is-preview, id: req.params.id, plan: ret.plan
    .catch aux.error-handler res

# this rule is only for custom domain.
engine.app.get \/view/:id, (req, res) ->
  [id, domain] = [(req.params.id or '').replace(/^id-/,''), req.get('host')]
  local = {}
  # not custom domain -> bye
  if !domain or domain == engine.config.domain => return aux.r404 res
  (new bluebird (res, rej) ->
    dns.resolveCname domain, (e, addr) ->
      if engine.config.debug => addr = [{value: "user-1.domain.makeweb.io"}]
      else if e or !addr or !addr.0 => return rej aux.error 404
      ret = /(user|team)-(\d+).domain.makeweb.io/.exec(addr.0.value or addr.0 or '')
      # only support user mode mapping for now
      if !ret or ret.1 != \user or !ret.2 or isNaN(+ret.2) => return rej aux.error 404
      local <<< {type: ret.1, key: +ret.2}
      return res!
  )
    .then ->
      io.query """
      select doc.title, doc.description, doc.thumbnail, doc.slug, doc.gacode, doc.privacy,
      snapshots.data, users.plan 
      from users,doc,snapshots
      where
        users.key = doc.owner and
        doc.domain = $1
        #{if id => "and doc.path = $3 " else ''}
        and snapshots.doc_id = doc.slug
        and doc.publish = true
        and doc.owner = $2
      """, [domain, local.key] ++ (if id => [id] else [])

    .then (r={}) ->
      ret = (r.[]rows.0 or {})
      {slug, data, plan} = ret{slug, data, plan}
      if !slug or !data => return res.status(404).send!
      # custom domain available only for pro user
      if !(ret.plan and ret.plan.name == \pro) => return res.status(404).send!
      config = {id, domain, slug} <<< ret{title, description, thumbnail, gacode, privacy}
      data.child = (data.child or []).filter(->it)
      res.render \page/view.jade, {data, config, plan, id: slug}
      return null
    .catch aux.error-handler res

engine.app.get \/page/:id/clone, aux.needlogin (req, res) ->
  if !req.params.id => return aux.r404 res
  newid = codeint.uuid!
  srcdoc = connect.get \doc, req.params.id
  (e) <- srcdoc.fetch
  if !srcdoc.type or !srcdoc.data => return res.status 404 .send!
  desdoc = connect.get \doc, newid
  (e) <- desdoc.fetch
  desdoc-create = -> new Promise (res, rej) -> desdoc.create srcdoc.data, (e) -> if e => rej e else res!
  io.query "select * from doc where slug = $1",[req.params.id]
    .then (r={}) ->
      data = r.rows.0
      if !data => return aux.reject 404
      io.query "insert into doc (slug,owner,title,description,thumbnail) values ($1, $2, $3, $4, $5)", [
        newid, req.user.key, data.title or 'untitled', data.description or '', data.thumbnail or ''
      ]
    .then -> desdoc-create!
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
      u2.displayname,u2.plan,
      array_agg(u1.key) filter (where u1.key is not null) as perm_key,
      array_agg(u1.displayname) filter (where u1.key is not null) as perm_name,
      array_agg(u1.username) filter (where u1.key is not null) as perm_email,
      array_agg(p1.perm) filter (where u1.key is not null) as perm
    from users as u2, doc
    left join doc_perm as p1 on doc.key = p1.doc
    left join users as u1 on p1.uid = u1.key
    left join doc_perm as p2 on doc.key = p2.doc and p2.uid = $1 and p2.perm >= 10
    where
      u2.key = doc.owner and
      doc.deleted is not true and
      (
        doc.owner = $1 or
        (p2.doc = doc.key and p2.uid = $1 and p2.perm >= 10)
      )
    group by doc.key, u2.key
    order by doc.createdtime desc
  """, [req.user.key])
    .then (r={}) -> res.send r.rows or []
    .catch aux.error-handler res

engine.router.api.get \/page/:id/revisions, aux.needlogin (req, res) ->
  io.query "select count(version) from ops where doc_id = $1", [req.params.id]
    .then (r={}) -> res.send (r.[]rows.0 or {})

engine.router.api.delete \/page/:id/perm/:userkey, aux.needlogin (req, res) ->
  if !req.params.id or !req.params.userkey or isNaN(+req.params.userkey) => return aux.r404 res
  local = {userkey: +req.params.userkey}
  check-permission req.user.key, req.params.id, 40
    .then (ret={}) ->
      if !ret => return aux.reject 404
      local.dockey = ret.key
      io.query("select key,username,displayname from users where key = $1", [local.userkey])
    .then (r={}) ->
      local.user = (r.rows or []).0
      if !local.user => return aux.reject 404
      io.query "delete from doc_perm where doc = $1 and uid = $2", [local.dockey, local.user.key]
    .then -> res.send!
    .catch aux.error-handler res

engine.router.api.put \/page/:id/perm, aux.needlogin (req, res) ->
  if !req.params.id or !req.body.emails or !req.body.perm? => return aux.r404 res
  if isNaN(+req.body.perm) => return aux.r400 res
  local = {perm: +req.body.perm}
  check-permission req.user.key, req.params.id, 40
    .then (ret={}) ->
      if !ret or !(ret.plan and ret.plan.name == \pro) => return aux.reject 404
      local.dockey = ret.key
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
      else Promise.resolve!
    .then -> res.send local.users
    .catch aux.error-handler res


engine.router.api.put \/page/:id/, aux.needlogin (req, res) ->
  if !req.params.id => return aux.r404 res
  if !req.body => return aux.r400 res
  # need to be admin or owner
  check-permission req.user.key, req.params.id, 40
    .then (ret) ->
      if !ret => return aux.reject 403
      # if overwrite current title/thumbnail, then no auto_og
      if (req.body.title and req.body.title != ret.title) or
      (req.body.thumbnail and req.body.thumbnail != ret.thumbnail) => ret.auto_og = false
      if !(req.user.plan and req.user.plan.name == 'pro') => <[domain path gacode]>.map -> delete ret[it]
      args = <[title thumbnail domain path gacode tags privacy auto_og publish description]>.map ->
        req.body[it] or ret[it]
      if !args.5 => args.5 = ""
      args.5 = (if Array.isArray(args.5) => args.5 else if !(args.5 and args.5.split) => [] else args.5.split(\,))
      args.5 = JSON.stringify(args.5.filter(->it))
      args.6 = +args.6
      if isNaN(args.6) => args.6 = null
      #TODO verify parameters
      io.query("""
      update doc set (title, thumbnail, domain, path, gacode, tags, privacy, auto_og, publish, description) =
      ($3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      where slug = $1 and owner = $2""",
      [req.params.id, req.user.key] ++ args
      )
    .then -> res.send!
    .catch aux.error-handler res
