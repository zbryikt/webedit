require! <[crypto bluebird]>

default-key = 'some my random key'

decode = (code, key, salt) -> new bluebird (res, rej) ->
  if !key => key := default-key
  idx = code.indexOf \:
  iv = new Buffer(code.substring(0,idx), \hex)
  code := code.substring(idx + 1)
  (e,key) <- crypto.pbkdf2 key, iv, 100000, 32, 'sha512'
  if e => return rej e
  decipher = crypto.createDecipheriv 'aes-256-cbc', key, iv
  return res "#{decipher.update(code, \base64, \utf8)}#{decipher.final(\utf8)}"
encode = (text, key) -> new bluebird (res, rej) ->
  if !key => key := default-key
  iv = crypto.randomBytes 16
  (e,key) <- crypto.pbkdf2 key, iv, 100000, 32, 'sha512'
  if e => return rej e
  cipher = crypto.createCipheriv 'aes-256-cbc', key, iv
  return res "#{iv.toString \hex}:#{cipher.update(text, \utf8, \base64)}#{cipher.final(\base64)}"

# sample usage
/*
encode \hello
  .then (code) -> decode code
  .then (answer) -> console.log answer
*/

module.exports = {encode, decode}
