require! <[fs cheerio bluebird colors path]>
require! <[../../engine/io/postgresql/ ../../secret]>
#require! <[../../api/paypal/]>
config = require "../../config/site/#{secret.config}"
is-production = config.is-production

io = new postgresql secret

plans = JSON.parse(fs.read-file-sync \plans.json .toString!)
plans.map (plan) ->
  local = {}
  io.query "select key from bill_plan where slug = $1 and is_production = $2", [plan.slug, is-production]
    .then (r={}) ->
      if r.rows and r.rows.length => return r
      console.log "insert for plan.slug #{plan.slug}..."
      io.query([
        "insert into bill_plan"
        "(slug, name, description, frequency, frequency_interval, cycles, amount, currency, is_production)"
        "values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning key", []
      ].join(" "),
      <[slug name description frequency frequency_interval cycle amount currency]>.map(->plan[it]) ++ [is-production])
    .then (r={}) -> io.query "select key,gwinfo from bill_plan where key = $1", [r.rows.0.key]
    .then (r={}) ->
      ret = r.rows.0
/*
      local <<< ret{key, gwinfo}
      if ret.gwinfo and ret.gwinfo.paypal => return bluebird.resolve!
      payload = {type: \INFINITE} <<< plan{name, description}
      paydef = do
        name: plan.name
        type: \REGULAR
        amount: currency: plan.currency, value: plan.amount
      paydef <<< plan{frequency, frequency_interval, cycles}
      payload.payment_definitions = [paydef]
      payload.merchant_preferences = do
        return_url: "https://loading.io/subscribe/paypal/execute"
        cancel_url: "https://loading.io/subscribe/paypal/cancel"
      console.log "create paypal plan for #{plan.slug}..."
      paypal.plan.create payload
    .then (plan) ->
      if !plan => return bluebird.resolve!
      local.{}gwinfo.paypal = {id: plan.id}
      io.query "update bill_plan set gwinfo = $1 where key = $2", [local.gwinfo, local.key]
    .then -> paypal.plan.active local.gwinfo.paypal.id, true
    .then ->
      console.log "#{plan.name}  ( #{plan.slug} ) done."
*/
