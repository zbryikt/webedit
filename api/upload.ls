require! <[@plotdb/uploadr express-formidable]>

(engine,io) <- (->module.exports = it)  _

{app,api} = engine

cfg = do
  uploadr: do
    host: \native
    config:
      folder: 'static/assets/files'
      url: '/assets/files'
      adopt: (req, {url, name, id}) -> new Promise (res, rej) ->
        db.query "insert into file (owner,url,name,id) values ($1,$2,$3,$4)", [req.user.key, url, name, id]
          .then -> res!
          .catch rej
  formidable: {multiples: true}

app.post \/d/uploadr, express-formidable(cfg.formidable), uploadr.provider(cfg.uploadr).getUploadRouter!

app.get \/d/file, aux.signedin, (req, res) ->
  limit = +(req.query.limit or 20) <? 100
  offset = +(req.query.offset or 0)
  if isNaN(limit) => limit = 20
  if isNaN(offset) => offset = 0
  io.query "select * from file where owner = $1 offset $2 limit $3", [req.user.key, offset, limit]
    .then (r={}) -> res.send(r.rows or [])

app.delete \/d/file/:key, (req, res) ->
  key = +req.params.key
  lc = {}
  io.query "select * from file where key = $1", [key]
    .then (r={}) ->
      if !r.[]rows.length => return lderror.reject 404
      lc.file = r.rows.0
      io.query "select count(key) as count from file where url = $1", [lc.file.url]
    .then (r={}) ->
      if r.rows.0.count <= 1 =>
        new Promise (res, rej) -> fs-extra.remove path.join("static", lc.file.url), -> res!
      else Promise.resolve!
    .then -> io.query "delete from file where key = $1", [key]
    .then -> res.send!

