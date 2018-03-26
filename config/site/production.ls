(->
  config = do
    name: \makeweb
    domain: \makeweb.io
    debug: false
    is-production: true
    facebook:
      clientID: \119910418852628
    google:
      clientID: \1003996266757-blno84e0pr7chu0rrhsdvhd3nj59n0bk.apps.googleusercontent.com
  if module? => module.exports = config
)!
