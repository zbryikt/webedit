require! <[fs bluebird]>
require! <[../engine/aux]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect

engine.app.get \/page/create, (req, res) ->
  res.redirect "/page/#{Math.random!toString 16 .substring 2}"

engine.app.get \/page/:id/clone, (req, res) ->
  newid = Math.random!toString 16 .substring 2
  console.log "id:", req.params.id
  srcdoc = connect.get \doc, req.params.id
  srcdoc.fetch (e) ->
    desdoc = connect.get \doc, newid
    if !srcdoc.type or !srcdoc.data =>
      console.log "not foun", src.doc.tpe, srcdoc.data
      return res.status 404 .send!
    desdoc.fetch (e) ->
      console.log srcdoc.data
      desdoc.create srcdoc.data
      res.redirect "/page/#newid/"
