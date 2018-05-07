require! <[../../api/code read fs]>

(e,v) <- read {silent: true, prompt: "Enter Password: "}, _
[plain,encoded] = ['../../config/key/default', '../../config/key/default.aes']
if fs.exists-sync(encoded) and fs.exists-sync(plain) =>
  console.log "both files exist."
if fs.exists-sync encoded =>
  ret = fs.read-file-sync encoded .toString!
  (ret) <- code.decode ret, v .then _
  fs.write-file-sync plain, ret
  console.log "done."
else if fs.exists-sync plain =>
  ret = fs.read-file-sync plain .toString!
  (ret) <- code.encode ret, v .then _
  fs.write-file-sync encoded, ret
  console.log "done."
else => console.log 'use "ssh-key -t rsa" then "ssh-key -f <file> -e -m pem" to make key pair'
