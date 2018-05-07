require! <[fs fs-extra bluebird crypto moment moment-timezone colors]>
require! <[../engine/aux ../src/ls/config/errcode]>
require! <[./currency ./tappay/ ./util/mail]>
require! <[../secret]>
config = require "../config/site/#{secret.config}"
is-production = config.is-production

log = (req, msg) -> aux.log req, msg, \SUBSCRIBE

(engine,io) <- (->module.exports = it)  _

api = engine.router.api
app = engine.app

pubkey = fs.read-file-sync 'config/key/default.pem.pub' .toString!

# TODO: more deterministic way to do this?
# return null if no date is found
get-next-date = (lastdate, frequency, interval) ->
  start = new Date(lastdate)
  [year,month, day] = [start.getYear! + 1900, start.getMonth!, start.getDate!]
  [hour, minute, second] = [start.getHours!, start.getMinutes!, start.getSeconds!]
  now = new Date!getTime!
  for i from 0 til 1000 =>
    cursor = new Date year, month, day, hour, minute, second
    if cursor.getTime! > now => return cursor
    if frequency == \YEAR => year++
    else if frequency == \MONTH => month++
    else if frequency == \WEEK => day += 7
    else month++
  return null

create-agreement = (req, res, user, plan-slug, gateway, gwinfo, date, invoice = null, state = 'active', lastpay = null) ->
  io.query [
    "insert into bill_agreement"
    "(owner, plan, start_date, gateway, gwinfo, invoice, state, lastpay)"
    "values ($1, $2, $3, $4, $5, $6, $7, $8) returning key"
  ].join(" "), [user.key, plan-slug, (if date => that else new Date!), gateway, gwinfo, invoice, state, lastpay]

paypal-cancel-agreement = (token, do-update-db = false) ->
  promise = paypal.agreement.cancel token
  return if do-update-db =>
    promise
      .then ->
        io.query """
          update bill_agreement set (modifiedtime,state) = (now(),'canceled')
          where (gwinfo->'paypal'->>'token') = $1
        """, [token]
  else promise

# agreement with state = pending means: not executed.
# overlap: this agreement might overlap with previous period
paypal-create-agreement = (req, res, user, gateway, plan, date, option, paypal-start-date = null, overlap = false) ->
  local = {plan}
  log req, "[PAYPAL] Make payment with paypal..."
  paypal.agreement.create local.plan.name, local.plan.gwinfo.paypal.id, (paypal-start-date or date), option
    .then (ret = {}) ->
      local.link = link = ret.[]links.filter(->it.rel == \approval_url).0
      if !(link and link.href) =>
        log req, "[PAYPAL][DEBUG] no approval url. returned object:"
        log req, JSON.stringify(ret)
        return aux.reject 403, "pay failed (via paypal): no approval url returned"
      token = /token=([^&#?]+)/.exec(link.href)
      if !token =>
        log req, "[PAYPAL][DEBUG] pay failed: no token. returned object:"
        log req, JSON.stringify(ret)
        return aux.reject 403, "pay failed (via paypal): no token"
      token = token.1
      gwinfo = do
        paypal: do
          token: token
          detail: ret
        common: do
          ip: aux.ip(req)
          gateway: \paypal
          overlap: true if overlap
      create-agreement req, res, user, local.plan.slug, \paypal, gwinfo, date, null, \pending
    .then -> res.send {gateway: "paypal", approval_url: local.link.href}

# 訂閱付款完成, 接著要修改 user objec
subscribe-update-user = (req, resp, user, plan-slug, send-mail = true) ->
  if !user or !user.key or !plan-slug =>
    return bluebird.reject new Error("subscribe-update-user failed: incorrect parameter")
  plan-part = plan-slug.split(\-)
  plan-obj = do
    slug: plan-slug
    period: plan-part.0 or \monthly
    name: plan-part.1 or \pro
    modifier: plan-part.2 or 1
  io.query "update users set plan = $1 where key = $2", [plan-obj, user.key]
    .then ->
      new Promise (res, rej) ->
        user <<< {plan: plan-obj}
        req.logIn user, -> res!
        return null
    .then -> if send-mail => mail.by-template \subscribed, user.username, {displayname: user.displayname or ''}


app.get \/subscribe/done, (req, res) ->
 res.render(\pricing/done.jade)

# this is referred in plan's cancel url, for users exited in the progress of subscription
app.get \/subscribe/paypal/cancel, (req, res) ->
  if !req.query.token or !req.user => return aux.r400 res, true
  io.query(
    """
      select key, plan from bill_agreement
      where (gwinfo->'paypal'->>'token') = $1 and state = 'pending'
    """
    [req.query.token]
  )
    .then (r={}) ->
      if !(r and r.rows and r.rows.length) => return aux.reject 404
      io.query "update bill_agreement set (modifiedtime,state) = (now(),'invalid') where key = $1", [r.rows.0.key]
    .then -> res.redirect \/pricing/; return null
    .catch aux.error-handler res, true

# use key = 0 to cancel all agreements.
# cancel agreement only set its state to 'cancel'. information will be kept.
cancel-other-agreements = (req, key = 0, deleted = false) ->
  if !(req.user and req.user.key and typeof(key) == \number) => return bluebird.reject!
  bluebird.resolve!
    .then ->
      io.query("""
        select key,gwinfo,state from bill_agreement
        where owner = $1 and key != $2 and state = ANY('{active,pending,suspended}')
        """,[req.user.key, key]
      )
    .then (r={})->
      log req, "cancel all agreements except #key... (total #{r.[]rows.length})"
      promises = r.[]rows
        .map (item) ->
          promise = if (item.gateway == 'paypal' or item.{}gwinfo.{}common.gateway == 'paypal')
          and item.{}gwinfo.paypal and item.gwinfo.paypal.id and item.state == \active =>
            log req, "canceling PayPal Agreement #{item.gwinfo.paypal.id}"
            paypal-cancel-agreement item.gwinfo.paypal.id
          else if item.gwinfo.tappay => bluebird.resolve!
          else => bluebird.resolve!
          # keep it and remove + delete in cronjob
          #if item.gwinfo.tappay => delete item.gwinfo.tappay.cardsecret

          new-state = if item.state == \pending => \invalid
          else if deleted => \deleted
          else \canceled
          promise.then ->
            io.query("""
            update bill_agreement
            set (modifiedtime,gwinfo,state) = (now(),$2,$3)
            where key = $1
            """, [item.key, item.gwinfo, new-state])
      bluebird.all promises

app.get \/subscribe/paypal/execute, (req, res) ->
  if !(req.query.token and req.user and req.user.key) => return aux.r400 res
  local = {}
  log req, "[PAYPAL] Request for executing paypal token #{req.query.token}"
  bluebird.resolve!
    .then ->
      # is there an agreement for this token?
      io.query("""
        select key, plan, gwinfo from bill_agreement
        where (gwinfo->'paypal'->>'token') = $1 and state = 'pending'
        """, [req.query.token]
      )
    .then (r={}) ->
      if !(r and r.rows and r.rows.length) =>
        log req, "[PAYPAL] No local agreement found for paypal token #{req.query.token}, so we have to give up."
        return aux.reject 404
      local.agreement = r.rows.0
      log req, "[PAYPAL] local agreement (#{local.agreement.key}) for #{req.query.token} found."
      log req, "[PAYPAL] proceed to execute paypal agreement #{req.query.token}..."
      paypal.agreement.execute req.query.token
    .then (ret = {}) ->
      log req, "[PAYPAL] paypal token #{req.query.token} executed. try updating local agreement for it.."
      local.paypal = ret
      local.paypal.oldinfo = local.agreement.{}gwinfo.{}paypal
      # 如果下面 cancel 中的有 overlap, 則要帶過來這裡
      local.agreement.gwinfo = do
        paypal: local.paypal
        common: do
          ip: aux.ip(req), gateway: \paypal, id: local.paypal.id
          overlap: true if local.agreement.{}gwinfo.{}common.overlap
      # default suspend plan if there is outstanding balance
      local.state = (
        if +ret.{}agreement_details.{}outstanding_balance.value => 'suspended' else 'active'
      )
      lastpay = if local.state == 'active' =>
        if +ret.{}agreement_details.{}last_payment_amount.value => new Date! else null
      else null
      io.query("""
        update bill_agreement
        set (modifiedtime,gwinfo,gateway,state,lastpay) =
        (now(),$2,$3,$4,$5)
        where key = $1
      """, [local.agreement.key, local.agreement.gwinfo, \paypal, local.state, lastpay]
      ) .catch ->
        log req, """
          [PAYPAL][CHECK] update local agreement failed.
            ba-key #{local.agreement.key} for token #{req.query.token}"
          """.red, it
        return aux.reject 500
    .then -> cancel-other-agreements req, local.agreement.key, true # we need this for method change
    .then ->
      if local.state == 'active' =>
        log req, "[PAYPAL] User #{req.user.key} subscribed #{local.agreement.plan}".green
        return subscribe-update-user req, res, req.user, local.agreement.plan
          .then -> res.redirect(\/subscribe/done); return null
      else
        log req, "[PAYPAL] outstanding subscription (#{req.query.token}) ba-key: #{local.agreement.key}".yellow
        res.redirect(\/pricing/fail/)
        return null

    .catch (e) ->
      log req, "[PAYPAL] /subscribe/paypal/execute/ failed: ", e
      aux.error-handler(res) e

api.put \/subscribe/invoice/, (req, res) ->
  if !req.user or !req.user.key => return aux.r403 res
  if !req.body or !(req.body.donate or req.body.address) => return aux.r400 res

  bluebird.resolve!
    .then -> io.query("""
      select * from bill_agreement
      where owner = $1 and state = ANY('{active,canceled,suspended}')
      order by createdtime desc
      """, [req.user.key])
    .then (r={}) ->
      agreement = r.[]rows.filter(-> it.state == 'active').0 or r.rows.0
      if !agreement => return aux.reject 404 res
      io.query(
        " update bill_agreement set invoice = $1 where key = $3 and owner = $2",
        [req.body{donate, address, vatno}, req.user.key, agreement.key]
      )
    .then -> res.send!
    .catch aux.error-handler res


api.put \/subscribe/method/, (req, res) ->
  if !req.user or !req.user.key => return aux.r403 res
  if !req.body or !req.body.gateway => return aux.r400 res
  [gateway, detail] = [req.body.gateway, req.body.detail]
  if !(gateway in <[paypal tappay]>) => return aux.r400 res
  if gateway == \tappay and !(detail and detail.card and detail.card.prime) => return aux.r400 res
  local = {}
  io.query("""
    select a.key, a.gwinfo, a.plan, a.createdtime, a.state, a.gateway,
    p.frequency, p.frequency_interval
    from bill_agreement as a, bill_plan as p
    where a.owner = $1 and a.state = ANY('{active,suspended}')
    and a.plan = p.slug
  """, [req.user.key])
    .then (r={}) ->
      if !(r.rows and r.rows.length) => return aux.reject 404
      local.agreement = item = r.rows.0
      promise = if (item.gateway == 'paypal' or item.{}gwinfo.{}common.gateway == 'paypal')
      and item.{}gwinfo.paypal and item.gwinfo.paypal.id and item.state == \active =>
        log req, "canceling PayPal Agreement #{item.gwinfo.paypal.id}"
        paypal-cancel-agreement item.gwinfo.paypal.id
      else => bluebird.resolve!
      return promise
    .then ->
      if gateway == \tappay =>
        log req, "[PAY-MENTHOD][TAPPAY] User changing payment method to credit card..."
        info = do
          amount: 1
          currency: "TWD", details: "card verification by loading.io"
          cardholder: {phonenumber: "", zip: "", addr: "", nationalid: "", name: "", email: req.user.username}
        tappay.pay-by-prime detail.card.prime, info # tappay 實際付款
          .catch (e) ->
            log req, "[PAY-METHOD][TAPPAY] pay-by-prime failed in subscribe/method".yellow
            return aux.reject 403, "verify failed. (via tappay)"
          .then (ret) ->
            local.tappay = ret
            if !ret or ret.msg != \Success =>
              return rej new Error("no return value from pay or bad msg code")
            if !ret.rectradeid => return rej new Error("rectrade not available")
            log req, "[PAY-METHOD][TAPPAY] update agreement..."
            if local.agreement.{}gwinfo.tappay =>
              ret.oldinfo = local.agreement.gwinfo.tappay
              # keep it and remove + delete in cronjob
              # delete ret.oldinfo.cardsecret
            gwinfo = (local.agreement.gwinfo or {})
            gwinfo.tappay = ret
            gwinfo.common = {id: ret.orderid, ip: aux.ip(req), gateway: \tappay}
            gwinfo.tappay.cardsecret = crypto.public-encrypt(
              pubkey, new Buffer(JSON.stringify(gwinfo.tappay.cardsecret))
            ).toString \base64
            io.query("""
              update bill_agreement
              set (gateway, gwinfo) = ($1, $2)
              where owner = $3 and key = $4
            """, [\tappay, gwinfo, req.user.key, local.agreement.key]
            )
          .then -> tappay.refund local.tappay.rectradeid, 1
          .then ->
            log req, "[PAY-METHOD][TAPPAY] method changed. ".green
            res.send!; return null;
          .catch (e) ->
            log req, """
              [PAY-METHOD][TAPPAY][CHECK] card verification: possible refund failed for
                 agreement  : #{local.agreement.key}
                 rectradeid : #{if local.tappay => local.tappay.rectradeid else \?}
            """.red
            log req, "[PAY-METHOD][TAPPAY][CHECK] reason: ", e
            return aux.reject 403, "verify failed. (via tappay)"

      else if gateway == \paypal =>
        io.query("""
        select * from bill_plan
        where slug = $1 and is_production = $2""", [local.agreement.plan, is-production])
          .then (r={}) ->
            if !(r.rows and r.rows.0) => return aux.reject 400
            local.plan = r.rows.0
            ag = local.agreement
            next-date = get-next-date ag.createdtime, ag.frequency, ag.frequency_interval
            if !next-date => return aux.reject 500, "cannot determine next date for recurring billing"
            # if suspended: must pay setup_fee at first.
            if ag.state != 'active' =>
              option = do
                override_merchant_preferences: do
                  setup_fee: value: local.plan.amount, currency: \USD
            else option = null
            paypal-create-agreement req, res, req.user, gateway, r.rows.0, null, option, next-date
    .catch aux.error-handler res
  # no more .then since all request should be handled by corresponding handler

# for cancelling future subscription
api.delete \/subscribe, (req, res) ->
  if !req.user or !req.user.key or !req.user.plan or req.user.plan.canceled => return aux.r403 res
  local = {}
  log req, "User #{req.user.username} is going to cancel subscription..."
  cancel-other-agreements req, 0, false
    .then ->
      req.user.plan <<< canceled: true
      io.query("update users set plan = $2 where key = $1", [req.user.key, req.user.plan])
    .then ->
      new bluebird (res, rej) ->
        req.logIn(req.user, -> res!)
        return null
    .then -> res.send!
    .catch aux.error-handler res

api.post \/subscribe, (req, res) ->
  if !req.user or !req.user.key => return aux.r403 res
  if !req.body or !req.body.gateway or !req.body.plan => return aux.r400 res
  [local, user] = [{}, req.user]
  [gateway, plan-slug, detail] = <[gateway plan detail]>map(->req.body[it])
  if !(gateway in <[paypal tappay]>) => return aux.r400 res
  if gateway == \tappay and !(detail.card and detail.card.prime and detail.card.lastfour) => return aux.r400 res
  invoice = req.body.invoice or null
  log req, "User #{user.username} is going to subscribe #{plan-slug}..."
  bluebird.resolve!
    # 先確認對應 slug 的 bill plan 存在
    .then -> io.query "select * from bill_plan where slug = $1 and is_production = $2", [plan-slug, is-production]
    .then (r={}) ->
      if !r.rows or !r.rows.length => return aux.reject 404
      log req, " .. plan for #{plan-slug} found."
      local.plan = r.rows.0
      if !(local.plan.gwinfo and local.plan.gwinfo[gateway]) and gateway != \tappay => return aux.reject 501
      # 確認使用者的訂閱狀況
      io.query "select key,plan from bill_agreement where owner = $1 and state = ANY('{active,canceled}')", [user.key]
    .then (r={}) ->
      if !r.rows or !r.rows.0 => return bluebird.resolve!
      if r.rows.filter(->it.plan == plan-slug).0 =>
        log req, "user already subscribed the same plan before. just update user object and return 409"
        # 使用者已經訂閱了，但 user 未更新. 所以我們就更新, 然後用 409 告訴前端
        return subscribe-update-user req, res, user, plan-slug, false
          .then -> aux.reject 409, "already subscribed"
      log req, "#{r.rows.length} existing agreement found. remove them... "
      local.overlap = true
      # cancel might need to move to after subscribed.
      cancel-other-agreements req, 0, true
    .then ->
      # 透過各種方式, 先要求付款
      if gateway == \tappay =>
        currency.get!
          .then (usd-twd) ->
            log req, "subscribe with credit card through tappay..."
            local.amount = Math.floor(usd-twd * local.plan.amount)
            info = do
              amount: local.amount
              currency: "TWD", details: "loading.io #{local.plan.name}"
              cardholder: {phonenumber: "", zip: "", addr: "", nationalid: "", name: "", email: user.username}
            tappay.pay-by-prime detail.card.prime, info # tappay 實際付款
              .catch (e) ->
                log req, "[PAY-METHOD][TAPPAY] pay-by-prime failed in subscribe".yellow
                return aux.reject 403, "verify failed. (via tappay)"
          .then (ret) ->
            if !ret or ret.msg != \Success => return aux.reject 424, 'payment was not approved'
            log req, "[TAPPAY] User #{user.key} subscribed #{local.plan.name} with #{local.amount} NTD".green
            ret.cardsecret = crypto.public-encrypt(
              pubkey, new Buffer(JSON.stringify(ret.cardsecret))
            ).toString \base64
            gwinfo = do
              tappay: ret
              common: do
                id: ret.orderid, ip: aux.ip(req), gateway: \tappay
                overlap: true if local.overlap
            create-agreement req, res, user, local.plan.slug, gateway, gwinfo, null, invoice, \active, new Date!
              .then (r={}) ->
                return if !r.rows or !r.rows.length => bluebird.resolve!
                else
                  local.agkey = r.rows.0.key
                  io.query """
                    insert into payment (owner, amount, name, type, ref, gateway, gwinfo, currency, invoice, state)
                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                  """, [req.user.key, local.amount, local.plan.name, \subscription,
                  r.rows.0.key, \tappay, gwinfo, \TWD, invoice, \complete]
              .then -> subscribe-update-user req, res, user, local.plan.slug
              .then ->
                mail.by-template \admin-new-subscription, secret.admin.email, do
                  username: req.user.username
                  plan: local.plan.name
                  agkey: local.agkey
                  gateway: \tappay
                  createdtime: new Date!toString!
              .then -> res.send!
              .catch ->
                log req, "[TAPPAY][CHECK] Subscribe FAILED after payment is made, for user: #{user.key}".red
                return aux.reject 403, "pay failed (via tappy) - after paid: #it"
          .catch -> return aux.reject 403, "pay failed (via tappay): #it"
      else if gateway == \paypal =>
        log req, "subscribe with paypal.."
        # PayPal failed sometimes if you set start_date in the near future.
        # They suggest you to use setup_fee for an immediately charge for this.
        # https://stackoverflow.com/questions/25858816/paypal-billing-agreements-rest-api-how-to-start-immediately
        # so we will determine a date for next period to start.

        next-date = get-next-date new Date!, local.plan.frequency, local.plan.frequency_interval
        if !next-date => return aux.reject 500, "cannot determine next date for recurring billing"

        option = do
          override_merchant_preferences: do
            setup_fee: value: local.plan.amount, currency: \USD
        paypal-create-agreement req, res, req.user, gateway, local.plan, null, option, next-date, local.overlap

      else return aux.reject 400
    # no more .then here. should have been handled by corresponding handler
    .catch aux.error-handler res
