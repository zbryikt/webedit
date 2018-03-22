require! <[fs path]>
require! <[./sample ./user ./doc]>
module.exports = (engine, io) ->
  user engine, io
  sample engine, io
  doc engine, io
