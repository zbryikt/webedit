require! <[fs bluebird]>
require! <[../engine/aux]>
(engine,io) <- (->module.exports = it)  _

connect = engine.sharedb.connect

engine.app.get \/page/create, (req, res) ->
  res.redirect "/page/#{Math.random!toString 16 .substring 2}/"

engine.app.get \/page/:id/clone, (req, res) ->
  newid = Math.random!toString 16 .substring 2
  srcdoc = connect.get \doc, req.params.id
  (e) <- srcdoc.fetch
  desdoc = connect.get \doc, newid
  if !srcdoc.type or !srcdoc.data => return res.status 404 .send!
  (e) <- desdoc.fetch
  desdoc.create srcdoc.data
  res.redirect "/page/#newid/"
