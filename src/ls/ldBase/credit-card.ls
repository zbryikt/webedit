angular.module \ldBase
  ..service \tappay, <[$rootScope $http global]> ++ ($rootScope, $http, global) ->
    tappay = do
      init: (app-id, app-key, mode = \sandbox) ->
        if global.production =>
          mode = \production
          app-id = 10305
          app-key = 'app_phc0rcPCtx0hG0hPjPDca4aoKU8JteYO5ewr8wkG0OMCsRTBbPkerBrqM9Cl'
        else
          mode = \sandbox
          app-id = 10305
          app-key = 'r3LA58RcpY6WldR7Oh566JybPvzsN1K1Vf0H6E73'
        TPDirect.setupSDK app-id, app-key, mode
      get-prime: (payinfo) ->
        promise = new Promise (res, rej) ->
          TPDirect.card.createToken(
            payinfo.number,
            payinfo.exp_month,
            (
              if payinfo.exp_year and payinfo.exp_year.length == 2 =>
                payinfo.exp_year
              else "#{payinfo.exp_year}".substring(2,4)
            ),
            payinfo.cvc,
            (result) ->
              if !result or result.status => rej new Error("taypay: create token failed") else res result
          )
    return tappay

  ..directive \ngCreditCard, <[$compile $timeout]> ++ ($compile, $timeout) -> do
    restrict: \A
    scope: do
      model: \=ngModel
    link: (s,e,a,c) ->
      config = {action: "Purchase"} <<< s.model.config
      s.model.loading = false
      s.model.payinfo = payinfo = (s.model.payinfo or {}) <<< do
        cvc: null, exp_month: null, exp_year: null, number: null
      s.model.error = error = {all: true}
      s.model.preact = ->
        s.model.check null, true
        if s.model.error.all => return
        s.model.loading = true
        promise = s.model.action(s.model.payinfo)
        if promise =>
          promise
            .then -> s.$apply -> s.model.loading = false
            .catch (e) ->
              s.$apply -> s.model.loading = false
              return Promise.reject new Error(e)
        else s.model.loading = false
      s.model.check = (target, now) ->
        if !s.model.check.targets => s.model.check.targets = {}
        targets = s.model.check.targets
        targets[target] = true
        if s.model.check.handler => $timeout.cancel s.model.check.handler
        _check = ->
          isAll = ![k for k of targets].length
          if isAll or targets.exp_month =>
            error.exp_month = !!!(/^0[1-9]|1[0-2]$/.exec(payinfo.exp_month))
          if isAll or targets.exp_year =>
            year = payinfo.exp_year or ""
            if year.length < 4 => year = "20#year"
            error.exp_year = !!!(/^2[01][0-9]{2}$/.exec(year)) or (new Date!getYear! + 1900) > +year
          if isAll or targets.cvc =>
            error.cvc = !!!(/^[0-9][0-9][0-9]$/.exec(payinfo.cvc))
          if isAll or targets.name => error.name = !payinfo.name
          if isAll or targets.number =>
            payinfo.number = (payinfo.number or "").replace(/-/g, '').trim!
            error.number = !!!(/^[0-9]{16}$/.exec(payinfo.number))
            d6 = +(payinfo.number or "").substring(0,6)
            d4 = +(payinfo.number or "").substring(0,4)
            if /^4/.exec(payinfo.number) => cardtype = \Visa
            else if /^3[47]/.exec(payinfo.number) => cardtype = 'American Express'
            else if d4 >= 3528 and d4 <= 3589 => cardtype= \JCB
            else if (d6 >= 510000 and d6 <= 559999) or (d6 >= 222100 and d6 <= 272099) => cardtype = \MasterCard
            else cardtype = ''
            # or, with stripe way:
            # error.number = !Stripe.card.validateCardNumber(payinfo.number)
            # cardtype = Stripe.card.cardType payinfo.number
          error.all = false
          error.all = (
            [v for k,v of error].filter(->it).length or
            [v for k,v of payinfo].filter(->!it).length
          )
          s.model.check.targets = []
        if !now => s.model.check.handler = $timeout (-> _check!), 500
        else _check!

# get-prime sample response
# {
#   status: 0,
#   msg: 'Success',
#   card: {
#      prime: 'cbe05b1bd89db6bb56cb96620464f9776c3eeff23dedece5469fda31608b1b01',
#      issuer: 'JPMORGAN CHASE BANK NA',
#      lastfour: '4242',
#      bincode: '424242',
#      funding: 0,
#      type: 1,
#      level: '',
#      country: 'UNITED STATES',
#      countrycode: 'US'
#   },
#   clientip: '111.111.111.111'
# }
