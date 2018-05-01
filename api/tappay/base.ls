require! <[fs request bluebird ../../engine/aux ../../secret]>
config = require "../../config/site/#{secret.config}"

is-production = config.is-production
envir = if is-production => \production else \sandbox
partnerkey = secret.tappay[envir]partnerkey
merchantid = secret.tappay[envir]merchantid

domain = if is-production => "https://prod.tappayapis.com" else "https://sandbox.tappayapis.com"

# url 需要換成可切換 sandbox / production 的形式
# payment 都需要有紀錄, 其中還要放是否已 refund 的欄位

# sample info obj:
# {
#   amount: 2
#   currency: \USD
#   details: "An apple and a pen"
#   cardholder: /* 可以為空但必須至少有列入 */
#     phonenumber: "", zip: "", addr: "", nationalid: "", name: "", email: ""

# sample response
# { rectradeid: 'D20170913yvawOC',
#   bankresultmsg: '',
#   authcode: '221004',
#   cardinfo:
#    { countrycode: 'US',
#      level: '',
#      funding: 0,
#      issuer: 'JPMORGAN CHASE BANK NA',
#      bincode: '424242',
#      type: 1,
#      lastfour: '4242',
#      country: 'UNITED STATES' },
#   status: 0,
#   acquirer: 'TW_CTBC',
#   orderid: 'TP20170913yvawOC',
#   bankresultcode: '0',
#   millis: 1505269759568,
#   msg: 'Success',
#   banktransactiontime: { endtimemillis: 1505269759568, starttimemillis: 1505269759568 },
#   cardsecret:
#    { cardkey: 'bff1fa20e4febc359b0c8db6fcc2b7ac7f0bb74decb34a831d713593894ed0d3',
#      cardtoken: '555b1928ebf3239c56e00b7395d04346141c8b358a305b025cb745e3aa54d31d' } }

pay-by-prime = (prime, info) -> new bluebird (res, rej) ->
  console.log "[DEBUG / TAPPAY] - Pay By Prime..."
  payload = {} <<< info <<< do
    prime: prime
    partnerkey: partnerkey
    merchantid: merchantid
    instalment: 0
    remember: true
  if !payload.cardholder =>
    payload.cardholder = phonenumber: "", zip: "", addr: "", nationalid: "", name: "", email: ""
  (e,r,b) <- request {
    url: "#domain/tpc/partner/directpay/paybyprime"
    method: \POST
    headers: "x-api-key": partnerkey
    json: payload
    timeout: 120 * 1000
  }, _
  if e or !b or b.status != 0 =>
    console.log "[DEBUG / TAPPAY] - Pay By Prime Failed. Message: ", e, (if b => b.msg or b else '')
    console.log b
    return rej new Error("pay by prime failed: #{if b => (b.msg or b) else e}")
  return res b

# sample info
# {
#    cardkey: "<user-card-key>"
#    cardtoken: "<user-card-token>"
#    amount: 100
#    currency: "USD"
#    details: "An apple and a pen"

# sample response: 基本上與 get-prime res 一樣, 但少了 cardsecret
# { rectradeid: 'D20170913X2RXXV',
#   bankresultmsg: '',
#   authcode: '663826',
#   cardinfo:
#    { countrycode: 'US',
#      level: '',
#      funding: 0,
#      issuer: 'JPMORGAN CHASE BANK NA',
#      bincode: '424242',
#      type: 1,
#      lastfour: '4242',
#      country: 'UNITED STATES' },
#   status: 0,
#   acquirer: 'TW_CTBC',
#   orderid: 'TP20170913X2RXXV',
#   bankresultcode: '0',
#   millis: 1505270505475,
#   msg: 'Success',
#   banktransactiontime: { endtimemillis: 1505270505475, starttimemillis: 1505270505475 } }
pay-by-token = (token, info) -> new bluebird (res, rej) ->
  console.log "[DEBUG / TAPPAY] - Pay By Token..."
  payload = {} <<< token <<< info <<< do
    partnerkey: partnerkey
    merchantid: merchantid
    instalment: 0
  (e,r,b) <- request {
    url: "#domain/tpc/partner/directpay/paybytoken"
    method: \POST
    headers: "x-api-key": partnerkey
    json: payload
    timeout: 60 * 1000
  }, _
  if e or !b or b.status != 0 =>
    /* sample log
      { status: 10003,
	msg: 'Card Error',
	rectradeid: 'D20180302GecfAI',
	bankresultcode: '05',
	bankresultmsg: '交易失敗，請洽詢發卡銀行' }
    */
    console.log "[DEBUG / TAPPAY] - Pay By Token Failed. Message: ", e, (if b => b.msg or b else '')
    console.log b
    return rej new Error("pay by card token failed")
  return res b

# remove a cardsecret from server
remove-card = (key, token) ->
  console.log "[DEBUG / TAPPAY] - Remove Card ..."
  if !key or !token => return rej new Error("key / token not specified")
  payload = do
    partner_key: partnerkey
    card_key: key
    card_token: token
  (e,r,b) <- request {
    url: "#domain/tpc/card/remove"
    method: \POST
    headers: "x-api-key": partnerkey
    json: payload
    timeout: 60 * 1000
  }, _
  if e or !b or b.status != 0 =>
    console.log "[DEBUG /TAPPAY] - Remove Card failed. Message: ", e, (if b => b.msg or b else '')
    console.log b
    return rej new Error("remove card failed")
  return res b


# id: rectradeid / amount: 退款金額, 0 為全額
refund = (id, amount=0) -> new bluebird (res, rej) ->
  console.log "[DEBUG / TAPPAY] - Refund ..."
  if !id => return rej new Error("call refund api but id not specified")
  payload = do
    partnerkey: partnerkey
    rectradeid: id
    amount: amount if amount > 0
  (e,r,b) <- request {
    url: "#domain/tpc/partner/fastrefund"
    method: \POST
    headers: "x-api-key": partnerkey
    json: payload
    timeout: 60 * 1000
  }, _
  if e or !b or b.status != 0 =>
    console.log "[DEBUG / TAPPAY] - Refund Failed. Message: ", e, (if b => b.msg or b else '')
    console.log b
    return rej new Error("refund failed: #{if b => b.msg else e}")
  return res b

sample-test = (prime) ->
  # expired prime sample: 2a0293964d4f14978c851b81e8298118e1356b8f567cc2aa1551e70cdc21963c
  info = do
    amount: 2,
    currency: \USD
    details: "An apple and a pen."
    cardholder: do
      phonenumber: ""
      name: ""
      email: ""
      zip: ""
      addr: ""
      nationalid: ""
  pay-by-prime prime, info
    .then (ret) ->
      console.log "pay-by-prime return: ", ret.cardsecret
      pay-by-token ret.cardsecret, {amount: 1, currency: "USD", details: "test payment"}
    .then (ret) ->
      console.log "pay-by-token return: ", ret
      refund ret.rectradeid
    .then (ret) -> console.log "refund: ", ret
    .catch -> console.log \failed:, it

module.exports = do
  pay-by-prime: pay-by-prime
  pay-by-token: pay-by-token
  remove-card: remove-card
  refund: refund
