require! <[fs fs-extra bluebird crypto read-chunk sharp]>
require! <[../../engine/io/postgresql/ ../../secret]>
io = new postgresql secret

userkey = -1
password = 'some random password'
io.authio.user.hashing password, true, true
  .then (pw-hashed) ->
    io.query "update users set (password,usepasswd) = ($2,$3) where key = $1", [userkey, pw-hashed, true]
  .then -> console.log \ok
  .then -> process.exit!
