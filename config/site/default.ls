(->
  config = do
    name: \webedit
    debug: false
    is-production: true
    facebook:
      clientID: \<your-facebook-clientid-here>
    google:
      clientID: \<your-google-clientid-here>
  if module? => module.exports = config
)!
