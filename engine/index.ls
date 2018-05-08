require! <[os fs fs-extra path bluebird crypto LiveScript chokidar moment jade]>
require! <[http sharedb sharedb-postgres websocket-json-stream ws]>
require! <[express body-parser express-session connect-multiparty oidc-provider]>
require! <[passport passport-local passport-facebook passport-google-oauth2]>
require! <[nodemailer nodemailer-smtp-transport csurf require-reload]>
#require! <[../config/keys/openid-keystore.json ./io/postgresql/openid-adapter]>
require! <[./aux ./watch ./utils/codeint]>
require! 'uglify-js': uglify-js, LiveScript: lsc
reload = require-reload require
colors = require \colors/safe

cwd = path.resolve process.cwd!
content-security-policy = []

get-ip = (default-ifname = "en0") ->
  ret = []
  ifaces = os.networkInterfaces!
  Object.keys ifaces .forEach (ifname) ->
    if default-ifname and ifname != default-ifname => return
    ifaces[ifname].forEach (iface) ->
      if \IPv4 == iface.family and iface.internal == false => ret.push iface.address
  ret

backend = do
  update-user: (req) -> req.logIn req.user, ->
  #session-store: (backend) -> @ <<< backend.dd.session-store!
  init: (config, authio, extapi) -> new bluebird (res, rej) ~>
    @config = config
    oidc = null
    promise = if config.openid-provider.enable =>
      oidc = new oidc-provider config.domain, do
        features: devInteractions: false
        findById: -> authio.oidc.find-by-id
        interactionUrl: -> "/openid/i/#{it.oidc.uuid}"
      oidc.initialize({
        keystore: openid-keystore
        clients: [{client_id: 'foo', client_secret: 'bar', redirect_uris: <[http://localhost:9000/cb]>}]
        adapter: authio.oidc.adapter
      })
    else bluebird.resolve!
    <~ promise.then _
    if oidc => oidc.app.proxy = true
    if @config.debug => # for weinre debug
      ip = get-ip!0 or "127.0.0.1"
      (list) <- content-security-policy.map
      if <[connect-src script-src]>.indexOf(list.0) < 0 => return
      list.push "http://#ip:8080"
      list.push "#{config.urlschema}#{config.domain}"
    content-security-policy := content-security-policy.map(-> it.join(" ")).join("; ")
    session-store = -> @ <<< authio.session
    session-store.prototype = express-session.Store.prototype

    app = express!
    server = http.create-server app

    cursors = do
      map: {}
      broadcast: (id, action, key, data) ->
        if !@map[id] => return
        for k,v of @map[id].agent => if v => v.send cursor: {action: action, key: key, data: data}
      # user object only initialize when socket create, unless explicitly updated
      switch: (id, oldkey, newkey) ->
        if !id or !oldkey or !newkey or !@map[id] => return
        map = @map[id]
        map.user[newkey] = map.user[oldkey]
        map.count[newkey] = map.count[oldkey]
        map.agent[newkey] = map.agent[oldkey]
        delete map.user[oldkey]
        delete map.count[oldkey]
        delete map.agent[oldkey]
      update: (id, user, agent, data) ->
        if !id or !user or !(user.key or user.guestkey) => return
        key = user.key or user.guestkey
        if !(@map[id] and @map[id].user[key]) => @join id, user, agent
        map = @map[id]
        map.user[key].cursor = (data.cursor or {}){startSelector, startOffset, endSelector, endOffset}
        @broadcast id, \update, key, map.user[key]{cursor}
      join: (id, user, agent) ->
        if !id or !user or !(user.key or user.guestkey) => return
        key = user.key or user.guestkey
        if !@map[id] => @map[id] = {user: {}, count: 0, agent: {}}
        map = @map[id]
        if !map.user[key] =>
          map.user[key] = {cursor: {}, count: 0} <<< user{displayname, key, guestkey}
          map.agent[key] = agent
          map.count++
        map.user[key].count++
        agent.send cursor: {action: \init, data: map.user}
        @broadcast id, \join, key, map.user[key]
      exit: (id, user) ->
        if !id or !user or !(user.key or user.guestkey) => return
        key = user.key or user.guestkey
        if !(@map[id] and @map[id].user[key]) => return
        map = @map[id]
        map.user[key].count--
        if !map.user[key].count =>
          map.count--
          @broadcast id, \exit, key, null
          delete map.user[key]
        if !map.count =>
          delete @map[id]

    /* operational transformation initialization OT { */
    collab = docs: {}
    collab.sharedb = new sharedb {db: sharedb-postgres(config.io-pg)}
    collab.connect = collab.sharedb.connect!

    # cursor: user update position
    collab.sharedb.use \receive, (req, cb) ->
      if !req.data.cursor => return cb!
      [id, user, cursor] = [req.agent.stream.id, req.agent.stream.user, req.data.cursor]
      if !(id and user and req.agent.stream.ws) => return
      cursors.update id, user, req.agent, cursor.data

    # key data: req.agent.stream is wjs below. here we keep doc id in it (wjs)
    collab.sharedb.use \doc, (req, cb) ->
      req.agent.stream.id = req.id
      if !collab.docs[req.id] =>
        collab.docs[req.id] = collab.connect.get \doc, req.id
        # subscribe so doc will be synced to prevent version mismatch error
        collab.docs[req.id].fetch -> collab.docs[req.id].subscribe ->
      # cursor: user join this doc
      if req.agent.stream.ws and req.agent.stream.user =>
        cursors.join req.id, req.agent.stream.user, req.agent
      cb!
    collab.wss = new ws.Server {
      server: server,
      # key data: info.req.session / info.req.session.passport.user
      verifyClient: (info, done) -> session(info.req, {}, -> done({result: true}))
    }
    # key data: req.session
    collab.wss.on \connection, (ws, req) ->
      collab.sharedb.listen wjs = websocket-json-stream(ws)
      if req.session and req.session.passport and req.session.passport.user =>
        wjs.user = req.session.passport.user
      <- ws.on 'close', _
      # wjs.id setup in share.on \doc
      if !wjs.id => return
      doc = collab.docs[wjs.id]
      if !doc or !doc.data => return
      if !req.session or !req.session.passport or !req.session.passport.user => return
      # cursor: join exit this doc
      cursors.exit wjs.id, req.session.passport.user
    @sharedb = {connect: collab.connect, obj: collab.sharedb}
    /* } OT */

    app.disable \x-powered-by
    app.set 'trust proxy', '127.0.0.1'
    app.use (req, res, next) ->
      res.header "Access-Control-Allow-Origin", "#{config.urlschema}#{config.domainIO}"
      res.header "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"
      res.header "Access-Control-Allow-Methods", "PUT"
      next!

    app.use (req, res, next) ->
      res.setHeader \Content-Security-Policy, content-security-policy
      res.setHeader \X-Content-Security-Policy, content-security-policy
      next!
    app.use body-parser.json limit: config.limit
    app.use body-parser.urlencoded extended: true, limit: config.limit
    app.engine \jade, (file-path, options, cb) ~>
      if !/\.jade$/.exec(file-path) => file-path = "#{file-path}.jade"
      fs.read-file file-path, (e, content) ~>
        if e => return cb e
        data = reload "../config/site/#{@config.config}.ls"
        try
          ret = jade.render(content,
            {
              filename: file-path, basedir: path.join(cwd,\src/jade/)
            } <<< {config: data} <<< watch.jade-extapi <<< options
          )
          return cb(null, ret)
        catch e
          return cb e

    app.set 'view engine', 'jade'
    app.engine \ls, (path, options, callback) ->
      opt = {} <<< options
      delete opt.settings
      delete opt.basedir
      try
        source = fs.read-file-sync path .toString!
        result = LiveScript.compile source
        [err,ret] = [null, "(function(){var req = #{JSON.stringify(opt)};#result;}).call(this);"]
      catch e
        [err,ret] = [e,""]
      callback err, ret
    app.set 'views', path.join(__dirname, '../src/jade/')
    app.locals.basedir = app.get \views

    get-user = (u, p, usep, detail, doCreate = false, done) ->
      authio.user.get u, p, usep, detail, doCreate
        .then ->
          done null, it
          return null
        .catch ->
          msg = if usep => "incorrect email or password" else "did you login with social account?"
          done null, false, {message: msg}
          return null


    passport.use new passport-local.Strategy {
      usernameField: \email
      passwordField: \passwd
    },(u,p,done) ~>
      get-user u, p, true, null, false, done


    passport.use new passport-google-oauth2.Strategy(
      do
        clientID: config.google.clientID
        clientSecret: config.google.clientSecret
        callbackURL: "/u/auth/google/callback"
        passReqToCallback: true
        profileFields: ['id', 'displayName', 'link', 'emails']
      , (request, access-token, refresh-token, profile, done) ~>
        if !profile.emails =>
          done null, false, do
            message: "We can't get email address from your Google account. Please try signing up with email."
          return null
        get-user profile.emails.0.value, null, false, profile, true, done
    )

    passport.use new passport-facebook.Strategy(
      do
        clientID: config.facebook.clientID
        clientSecret: config.facebook.clientSecret
        callbackURL: "/u/auth/facebook/callback"
        profileFields: ['id', 'displayName', 'link', 'emails']
      , (access-token, refresh-token, profile, done) ~>
        if !profile.emails =>
          done null, false, do
            message: "We can't get email address from your Facebook account. Please try signing up with email."
          return null
        get-user profile.emails.0.value, null, false, profile, true, done
    )

    if config.usedb =>
      session = express-session do
        secret: config.session.secret
        resave: true
        saveUninitialized: true
        store: new session-store!
        proxy: true
        cookie: do
          path: \/
          httpOnly: true
          maxAge: 86400000 * 30 * 12 #  1 year
          domain: \localhost
      app.use session
      app.use passport.initialize!
      app.use passport.session!

    passport.serializeUser (u,done) ->
      authio.user.serialize u .then (v) ->
        done null, v
        return null
      return null
    passport.deserializeUser (v,done) ->
      authio.user.deserialize v .then (u) ->
        done null, u or {}
        return null
      return null

    router = do
      user: express.Router!
      api: express.Router!

    app.use "/u", router.user
    router.user
      ..post \/signup, (req, res) ->
        {email,displayname, passwd, config} = req.body{email,displayname, passwd, config}
        if !email or !displayname or passwd.length < 4 => return aux.r400 res
        authio.user.create email, passwd, true, {displayname}, (config or {})
          .then (user)->
            req.logIn user, -> res.redirect \/u/200; return null
            return null
          .catch ->
            #console.log "[CREATE USER] Failed due to: ", (it or "").toString!substring(0,220)
            #console.log "        --->  user: ", email, " / ", displayname
            res.redirect \/u/403; return null
      ..post \/login, passport.authenticate \local, do
        successRedirect: \/u/200
        failureRedirect: \/u/403
      ..post \/login/guest, (req, res) ->
        if req.user => res.redirect \/u/400; return null
        # make guest key begin with minus so it won't never collide with a normal user key
        user = {key: 0, username: 'guest', displayname: 'Guest', guestkey: "-#{codeint.uuid!}"}
        req.login user, -> res.redirect \/u/200; return null

    if config.usedb =>
      backend.csrfProtection = csurf!
      app.use backend.csrfProtection
    app.use "/e", extapi!

    app.get \/js/global.js, (backend.csrfProtection or (req,res,next)->next!), (req, res) ->
      res.setHeader \content-type, \application/javascript
      payload = JSON.stringify({
        user: req.user, global: true, production: config.is-production
        csrfToken: (if req.csrfToken => that! else null),
        domain: (config.domain or \localhost), scheme: config.scheme or \http
      })
      res.send """(function() { var req = #payload;
      if(req.user) {
        window.user = req.user;
        if(req.user.key) { window.userkey = req.user.key }
      }
      window.server = {domain: req.domain, scheme: req.scheme};
      if(typeof(angular) != "undefined" && angular) {
      if(window._backend_) { angular.module("backend").factory("global",["context",function(context){
        var own={}.hasOwnProperty,key;
        for (key in req) if (own.call(req, key)) context[key] = req[key];
        return req;
      }]); }else{
        angular.module("backend",[]).factory("global",[function(){return req;}]);
      }}})()"""

    app.use \/, express.static(path.join(__dirname, '../static'))

    app
      ..use "/d", router.api
    #  ..use "/u", router.user
      ..get "/d/health", (req, res) -> res.json {}

    router.user
      ..get \/null, (req, res) -> res.json {}
      ..get \/200, (req,res) -> res.json(req.user)
      ..get \/403, (req,res) -> res.status(403)send!
      ..get \/login, (req, res) -> res.render \auth/index.jade

      ..get \/logout, (req, res) ->
        req.logout!
        res.redirect \/
      ..get \/auth/google, passport.authenticate \google, {scope: ['email']}
      ..get \/auth/google/callback, passport.authenticate \google, do
        successRedirect: \/
        failureRedirect: \/auth/failed/
      ..get \/auth/facebook, passport.authenticate \facebook, {scope: ['email']}
      ..get \/auth/facebook/callback, passport.authenticate \facebook, do
        successRedirect: \/
        failureRedirect: \/auth/failed/

    if oidc =>
      app.get \/openid/i/:grant, (req, res) ->
        oidc.interactionDetails(req).then (details) ->
          if !(req.user and req.user.key) => return res.render \auth/index
          ret = do
            login: account: req.user.key, acr: '1', remember: true, ts: Math.floor(new Date!getTime! * 0.001)
          oidc.interactionFinished(req, res, ret)
      app.get \/openid/i/:grant/login, (req, res) ->
        ret = do
          login: account: req.user.key, acr: '1', remember: true, ts: Math.floor(new Date!getTime! * 0.001)
        oidc.interactionFinished(req, res, ret)
      app.use \/openid/, oidc.callback

    postman = nodemailer.createTransport nodemailer-smtp-transport config.mail

    multi = do
      parser: connect-multiparty limit: config.limit
      clean: (req, res, next) ->
        for k,v of req.files => if fs.exists-sync v.path => fs.unlink v.path
      cleaner: (cb) -> (req, res, next) ~>
        if cb => cb req, res, next
        @clean req, res, next

    @ <<< {config, app, express, router, postman, multi, server}
    res!
  watch: ->
    build = ~>
      console.log "[BUILD] Config 'engine/config/#{@config.config}.ls -> 'static/js/share/config.js'"
      ret = lsc.compile(
        fs.read-file-sync("engine/config/#{@config.config}.ls").toString!,
        {bare: true}
      )
      if !@config.debug => ret = uglify-js.minify(ret,{fromString:true}).code
      fs-extra.mkdirs 'static/js/share'
      fs.write-file-sync 'static/js/share/config.js', ret
    chokidar.watch "engine/config/#{@config.config}.ls", ignored: (~>), persistent: true
      .on \add, ~> build!
      .on \change, ~> build!

  start: (cb) ->
    @watch!
    # Try to handle this:
    # [17/05/08 01:54:30] FacebookTokenError: This authorization code has been used.  /  undefined
    if !@config.debug =>
      (err, req, res, next) <- @app.use
      if !err => return next!
      if err.code == \EBADCSRFTOKEN =>
        aux.r403 res, "be hold!", false
      else
        console.error(
          colors.red.underline("[#{moment!format 'YY/MM/DD HH:mm:ss'}]"),
          colors.yellow(err.toString!)
          " / "
          colors.yellow(err.path)
        )
        console.error colors.grey(err.stack)
        res.status 500 .render 'err/500'
    if @config.watch => watch.start @config
    #server = @app.listen @config.port, -> console.log "listening on port #{server.address!port}"
    server = @server.listen @config.port, -> console.log "listening on port #{server.address!port}"

module.exports = backend
