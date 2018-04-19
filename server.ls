require! <[bluebird fs-extra]>
require! <[./secret ./engine ./engine/aux ./engine/io/postgresql ./api ./api/ext]>
config = require "./config/site/#{secret.config}"

config = aux.merge-config config, secret

/* use this code snippet to make complete log helper
console._warn = console.warn
console.warn = ->
  ret = "[WARN] "
  for i from 0 til arguments.length => ret += ' ' + arguments[i].toString!
  ret = ret.split \\n .0
  console.log (if ret.length > 60 => ret.substring(0,60) + '...' else ret).yellow
*/

bluebird.config do
  warnings: true
  longStackTraces: true
  cancellation: true
  monitoring: true

pgsql = new postgresql config

engine.init config, pgsql.authio, (-> ext engine, pgsql)
  .then ->
    engine.app.get \/, (req, res) -> res.render 'index.jade'
    api engine, pgsql
    engine.app.use (req, res, next) ~> aux.r404 res, "", true
    engine.start!
  .catch ->
    console.log "[Exception] ", it.stack
