uuidv4 = require 'uuid/v4'

hash = {}
map = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-$".split('');
sep = "0"
for i from 0 til map.length => hash[map[i]] = i

codeint = do
  encode: (v) ->
    ret = ''
    while true
      ret = map[v .&. 0x3f] + ret
      v = v .>>>. 6
      if !v => break
    return ret
  decode: (s) ->
    ret = 0
    for i from 0 til s.length
      ret = (ret .<<. 6) + hash[s[i]]
    return ret
  uuid: (uuid) ->
    if !uuid => uuid = uuidv4!
    uuid.split(\-).map(~> @encode(parseInt(it, 16))).join(sep)

module.exports = codeint
