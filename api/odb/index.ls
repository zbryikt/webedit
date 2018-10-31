/*
require! <[fs fs-extra bluebird crypto read-chunk sharp]>
require! <[../../engine/aux ../doctool]>
(engine,io) <- (->module.exports = it)  _

app = engine.app

app.get \/page-res/:id/:name, (req, res) ->
  if !req.params.id => return aux.r404 res
  # TODO versioning with doctool.get-snapshot-at
  doctool.get-latest-snapshot req.params.id
    .then (data = {}) ->
      if !data.child => return aux.r404 res
      blocks = (data.child or []).map -> {package: it.package, block: it.type, version: it.version}
      # TODO make css and js from blocks and 
    .catch aux.error-handler res

app.delete \/page-res/:id/, (req, res) ->
  # TODO delete all content for page-res of :id
  # TODO better put under makeweb.io domain
*/
