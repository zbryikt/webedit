require! <[fs path]>
require! <[./sample ./user ./doc ./auth/reset ./subscribe]>
module.exports = (engine, io) ->
  user engine, io
  reset engine, io
  sample engine, io
  doc engine, io
  # temporarily disable subscription api
  #subscribe engine, io
