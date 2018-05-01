(->
  config = do
    name: \webedit
    domain: \localhost
    scheme: \http
    debug: false
    is-production: false
    facebook:
      clientID: \<your-facebook-clientid-here>
    google:
      clientID: \<your-google-clientid-here>
  if module? => module.exports = config
)!
