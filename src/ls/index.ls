angular.module \webedit, <[ldBase backend ldColorPicker ngAnimate]>
  ..config <[$animateProvider]> ++ ($animateProvider) ->
    $animateProvider.classNameFilter /ng-animate-on/
  ..factory \httpRequestInterceptor, <[global]> ++ (global) -> do
    request: (config) ->
      config.headers['X-CSRF-Token'] = global.csrfToken
      config
  ..config <[$compileProvider $httpProvider]> ++ ($compileProvider, $httpProvider) ->
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(blob:|http:\/\/localhost)|https?:\/\/makeweb.(io|local)\//)
    $httpProvider.interceptors.push \httpRequestInterceptor
  ..controller \authPage, <[$scope]> ++ ($scope) ->
    if $scope.user.data and $scope.user.data.key => window.location.href =  $scope.neturl or '/'
  ..controller \site, <[$scope $http $interval global ldBase ldNotify initWrap tappay]> ++
    ($scope, $http, $interval, global, ldBase, ldNotify, initWrap, tappay) ->
    initWrap = initWrap!
    $scope <<< ldBase
    $scope.notifications = ldNotify.queue
    $scope.static-mode = global.static
    $scope.$watch 'user.data', ((n,o) ->
      if !n or !n.key => return
      $scope.track "uv/#{n.key}", "#{new Date!toISOString!substring 0,10}", window.location.pathname
      gtag \config, \GA_TRACKING_ID, {'user_id': n.key}
    ), true
    $scope.user = data: global.user
    if !$scope.user.data =>
      $http { url: \/u/login/guest, method: \POST }
      .then (d) -> $scope.user.data = d.data

    $scope.needlogin = (path, relative, options = {}) ->
      is-guest = !($scope.user.data and $scope.user.data.key)
      if is-guest and options.auth-in-page => return window.location.href = "/u/login/?nexturl=#path"
      (if is-guest => $scope.auth.prompt! else Promise.resolve!)
        .then ->
          window.location.href = ((if relative => "#{window.location.pathname}/" else '') + path)
            .replace(/\/\//g, '/')
        .catch -> # noop
    $scope.auth = initWrap do
      init: ->
        ret = /nexturl=([^&#]+)/.exec(window.location.search)
        if ret => $scope.nexturl = that.1
        $scope.$watch 'auth.ctrl.toggled', ~> @error = {}
      email: '', displayname: '', passwd: ''
      stick: false
      subscribe: true
      config: do
        dismissOnEnter: false
        finish: -> $scope.auth.login!
      sync: ->
        $http do
          url: \/d/me/sync/
          method: \POST
        .then ({data}) -> $scope.user.data <<< data
      verify: ->
        @error = {}
        return if !/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.[a-z]{2,}|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.exec(@email) =>
          @error.email = "this is not an email"
        else if !@isSignIn and (!@displayname or @displayname.length < 3) =>
          @error.displayname = "it's too short"
        else if !@passwd or @passwd.length < 4 =>
          @error.passwd = "it's too weak!"
        else 0
      logout: ->
        console.log \logout..
        $http do
          url: \/u/logout
          method: \GET
        .success (d) ->
          console.log \logouted.
          $scope.user.data = null
          window.location.reload!
        .error (d) ->
          ldNotify.send \danger, 'Failed to Logout. '
      login: ->
        if @verify! => return
        @loading = true
        config = {newsletter: @subscribe}
        $http do
          url: (if @isSignIn => \/u/login else \/u/signup)
          method: \POST
          data: $.param {
            email: @email, passwd: @passwd, displayname: @displayname
          } <<< (if @isSignIn => {} else {config: config})
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        .finally ~> @loading = false
        .then (d) ~>
          $scope.user.data = d.data
          gtag \config, \GA_TRACKING_ID, {'user_id': d.key}
          @ctrl.toggle false
          if $scope.nexturl => window.location.href = $scope.nexturl
          else if window.location.pathname == '/u/login' => window.location.href = '/'
        .catch (d) ~>
          if d.status == 403 =>
            if @isSignIn => @error.passwd = 'wrong password'
            else @error.email = 'this email is used before.'
          else => @error.email = 'system busy, try again later.'
        @passwd = ""
    $scope.nav = initWrap do
      node: null
      init: ->
        node = document.querySelector '#nav-top nav'
        if node and node.classList.contains \do-invert =>
          <~ window.addEventListener \scroll, _
          y = window.pageYOffset
          if y > 60 => node.classList.add \invert
          else => node.classList.remove \invert

    $scope.subscription = do
      modal:
        pay: {}, plan: {}
        cc:
          payinfo: invoice: donate: true
          action: (payinfo) ->
            $scope.subscription.loading = true
            $scope.subscription.tappay {payinfo}
              .then -> $scope.subscription.loading = false
          #action: (payinfo) -> $scope.pay-panels.method.change.via \tappay, payinfo
          config: action: "Subscribe with Credit Card"

      /* Under Construction vvvv */
      cancel: ->
        if $scope.subscription.loading => return
        #[plan-float,warn] = [$scope.pay-panels.plan-float, $scope.pay-panels.warn]
        #if plan-float and plan-float.ctrl and plan-float.ctrl.toggled => plan-float.ctrl.toggle false
        #if warn and warn.ctrl and !warn.ctrl.toggled => warn.ctrl.toggle true
        #else
        $scope.subscription.loading = true
        $http do
          url: \/d/subscribe
          method: \DELETE
        .finally ~>
          $timeout (~>
            $scope.subscription.loading = false
            #warn.ctrl.toggle false
            window.location.reload!
          ), 1000
        .then -> ldNotify.success "subscription cancelled"
        .catch -> ldNotify.danger "failed to cancel. try later?"

      tappay: ({payinfo}) ->
        $scope.subscription.loading = true
        tappay.init!
        tappay.get-prime payinfo
          .finally -> $scope.force$apply -> $scope.subscription.loading = false
          .then (primeinfo) -> $scope.force$apply ->
            config = do
              url: \/d/subscribe/, method: \POST
              data: do
                invoice: payinfo.invoice if payinfo.invoice
                gateway: \tappay
                detail: primeinfo
                plan: $scope.subscription.get-full-plan!
            $http config
          .then ->
            #if $scope.pay-panels.plan and $scope.pay-panels.plan.action =>
            #  $scope.pay-panels.plan.action \done
            $scope.auth.sync!
          .catch (e) -> $scope.force$apply ->
            if e and e.status == 409 =>
              ldNotify.send \warning, "you have subscribed before. try reloading..."
              $timeout (-> window.location.reload! ), 1000
            else ldNotify.send \danger, "can't subscribe now. try later?"

      /* Under Construction ^^^^ */

      get-full-plan: -> return "#{@period}-#{@plan}-#{@modifier or 1}"
      plan: \advanced
      period: \monthly
      price: do
        monthly: advanced: 12, pro: 24
        yearly: advanced: 9, pro: 18
      update: ->
        @pay-modal.config.action = "Subscribe via Credit Card"

      set-plan: -> @plan = it; @update!
      set-period: -> @period = it; @update!
      toggle:
        plan: -> $scope.subscription.modal.plan.ctrl.toggle!
        pay: (plan) ->
          $scope.subscription
            ..plan = plan
            ..modal.plan.ctrl.toggle false
            ..modal.pay.ctrl.toggle!

    initWrap.run!
    console.log 'site script initialized'
