require! <[request bluebird ../secret]>

apikey = secret.currencylayer.apikey

module.exports = currency = do
  defval: 29.5
  cached: null
  expire: null
  get-lower: (force = false)-> @get(force).then -> return it - 0.25
  pending: null
  queue: []
  get: (force = false)->
    bluebird.resolve!
      .then ~> @sinopac.get force
      .catch ~> @apilayer.get force
      .catch ~> return @cached
      .then (value) ~>
        if value > 40 or value < 20 =>
          console.log """
            [WARNING / CHECK] USD -> TWD with strange rate '#ret'
                let's use cached value '#{@cached or @defval}' for now.
          """
          value = ret @cached or @defval
        return value
      .then -> @cached = it

  sinopac: do
    expire: null
    cached: null
    timeout: 1000 * 60
    get: (force = false) -> new bluebird (res, rej) ~>
      if !force and @expire and new Date!getTime! < @expire =>
        if @cached => return res @cached
        return rej!
      (e,r,b) <~ request {
        url: \https://m.sinopac.com/ws/share/rate/ws_exchange.ashx
        headers: do
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"
      }, _
      if e => return rej!
      try
        value = JSON.parse(b).0.SubInfo
          .filter -> /USD/.exec(it.DataValue1)
          .map -> it.DataValue2
          .0
      catch e
        console.log "[WARNING / CHECK] Sinopac USD -> TWD Info Corrupted."
        @expire = new Date!getTime! + @timeout
        @cached = null
        return rej!
      # cache for [timeout] min
      @expire = new Date!getTime! + @timeout
      @cached = value
      return res value

  apilayer: do
    expire: null
    cached: null
    timeout: 1000 * (60 * 60) # apilayer max 1000 / month. 1 hour per request ~= 744 requests.
    get: (force = false) -> new bluebird (res, rej) ~>
      if !force and @expire and new Date!getTime! < @expire =>
        if @cached => return res @cached
        return rej!
      (e,r,b) <~ request {
        url: "http://apilayer.net/api/live?access_key=#{apikey}&currencies=USD,TWD&format=1"
        method: \GET
      }, _
      # cache for [timeout] min
      @expire = new Date!getTime! + @timeout
      try
        b = JSON.parse(b)
      catch
        b = null
      if e or !b or !b.success or !b.quotes or !b.quotes.USDTWD or isNaN(b.quotes.USDTWD) =>
        console.log "[WARNING / CHECK] Currency Layer failed to convert USD to TWD with following:"
        console.log e
        console.log b if b
        return rej!
      else ret = +b.quotes.USDTWD
      @cached = ret
      res ret
