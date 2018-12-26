require! <[fs fs-extra qs moment sharedb]>
require! <[bluebird colors path]>
require! <[../engine/aux ../engine/io/postgresql/ ../secret]>

json0 = sharedb.types.map.json0
config = require "../config/site/#{secret.config}"

io = new postgresql secret

/* sample usage
get-latest-snapshot 'a73f060e73bdd'
  .then ->
    console.log "latest: ", it
    get-version 'a73f060e73bdd'
  .then (ver) ->
    get-snapshot-at 'a73f060e73bdd', ver
  .then -> console.log it
*/

get-versions = (id) ->
  io.query "select version as v,operation->'m'->'ts' as t from ops where doc_id = $1", [id]
    .then (r={}) -> return r.[]rows or []

get-version = (id) ->
  io.query "select max(version) from ops where doc_id = $1", [id]
    .then (r={}) -> return (r.[]rows.0 or {}).max or 0

get-latest-snapshot = (id) ->
  io.query "select * from snapshots where doc_id = $1 limit 1", [id]
    .then (r={}) -> return r.[]rows.0.data

get-invert-ops = (id, version) ->
  local = {}
  io.query "select * from snapshots where doc_id = $1 limit 1", [id]
    .then (r={}) ->
      local.snapshot = r.[]rows.0
      io.query "select version,operation from ops where doc_id = $1 and version >= $2", [id, version]
    .then (r={}) -> 
      local.ops = r.[]rows
      if !(local.ops and local.ops.length) => return null
      content = local.snapshot.data
      for idx from local.ops.length - 1 to 1 by -1 =>
        op = json0.invert(local.ops[idx].operation.op)
        if !local.merged => local.merged = op
        else local.merged = json0.compose(local.merged, op)
      return local.merged

get-snapshot-at = (id, version) ->
  local = {}
  io.query "select * from snapshots where doc_id = $1 limit 1", [id]
    .then (r={}) ->
      local.snapshot = r.[]rows.0
      get-invert-ops id, version
    .then (op) ->
      return if op => ret = json0.apply local.snapshot.data, op else local.snapshot.data

module.exports = {get-versions, get-version, get-latest-snapshot, get-snapshot-at, get-invert-ops}
