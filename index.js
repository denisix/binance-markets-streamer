const https = require('https'),
  WS = require('./ws'),
  initDb = require('./db'),
  log = require('./log'),
  {
    MYSQL_HOST = '127.0.0.1',
    MYSQL_USER = 'root',
    MYSQL_PW = '',
    MYSQL_DB = 'trade',
    BULK_RECORDS = 1000, // how much to insert at once
  } = process.env

let pool, cnt = 0, prev = 0, t0 = Date.now(), tprev = Date.now(), values = [], symbols = [], symbols_used = [], isSaving = false, dumps = 0

const fl = x => Math.round(x * 100) / 100

const sql = 'INSERT INTO ticks VALUES ?'

const saveValues = async () => {
  if (isSaving) return

  isSaving = true

  if (values.length > BULK_RECORDS) {

    // for stats
    const t1 = Date.now()
    const rate = (cnt - prev) / ((t1 - tprev) / 1000)
    const avg = cnt / ((t1 - t0) / 1000)

    try {

      // shapshot array to new variable with new reference:
      const bulk = [...values]
      values = []

      // okay, now we can save the values to db:
      await pool.query(sql, [bulk])

      // let's show some stats every 10 dumps:
      if (dumps % 10 === 0) {
        log('- rcvd:', cnt, 'rate:', Math.round((1000 * cnt) / (Date.now() - t0)), 'op/s, symbols:', symbols_used.length, '/', symbols.length, 'recs:', cnt, 'rate:', fl(rate), 'rps, avg:', fl(avg), 'rps, tick interval:', fl(1000 / avg), 'ms, dumptime:', Date.now() - t1, 'ms, buf new:', values.length)
      }
      dumps++

      // for stats
      prev = cnt
      tprev = t1

    } catch (e) {
      log('- error save:', e)
    }
  }
  isSaving = false
}

const onTick = async (e) => {
  const { T, s, t, p, q, m, b, a } = JSON.parse(e)

  // for analytics
  if (!symbols_used.includes(s)) symbols_used.push(s)

  // actually there are more vars available: values.push({ t: T, s, c: t, p: +p, q: +q, m, b, a })
  // but we use only significant:
  values.push([T, s, t, p, q, m, b, a])
  cnt++

  saveValues()
}

const getSymbols = () => new Promise(r => {
  log('- get symbols..')
  https.get('https://api.binance.com/api/v3/ticker/24hr', (res) => {
    let data = ''
    res.on('data', (d) => data += d.toString())
    res.on('end', () => {
      const arr = JSON.parse(data)
      log(arr[0])

      // filter markets by the following params:
      r(arr.filter(i =>
        i.lowPrice > 0.000001 &&
        i.count > 2001 &&
        i.quoteVolume > 10 &&
        !i.symbol.match(/UP|DOWN|BULL|BEAR|PERP|BTCUSDT|ETHUSDT|ETHBTC|BTCBUSD|USTUSDT|BNBUSDT|BNBBTC|ETHBUSD|USDT/)
      ).map(i => i.symbol))
    })
  }).on('error', (e) => {
    console.error(e)
    r([])
  })
})

const run = async () => {
  log('- starting run()..')
  pool = await initDb({
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PW,
    database: MYSQL_DB
  })

  const symbols = await getSymbols()
  log('- found symbols ->', symbols)

  await pool.query('INSERT INTO symbols VALUES ?', [symbols.map(i => ([i]))])

  const pairs = symbols.map(s => s.toLowerCase() + '@trade').join('/')
  const ws = new WS('wss://stream.binance.com:9443/ws/' + pairs)

  // ws.on('wsopen', () => log('- opened stream'))
  // ws.on('wsclose', () => log('- closed stream'))
  ws.on('wsmessage', onTick)
}

run()
