const db = require('mysql2'),
  log = require('./log')

const initDb = async ({ host, user, password, database }) => {
  p = db.createPool({
    host,
    user,
    password,
    database,
    connectionLimit: 100,
    multipleStatements: true,
    waitForConnections: true,
    queueLimit: 0,
  })

  log('- DB: connect..')
  p.getConnection((err, connection) => {
    if (err) {
      if (err.code === 'PROTOCOL_CONNECTION_LOST') return console.error('Database connection was closed.')
      if (err.code === 'ER_CON_COUNT_ERROR') return console.error('Database has too many connections.')
      if (err.code === 'ECONNREFUSED') return console.error('Database connection was refused.')
      log('- DB connection err ->', err)
    }
    if (connection) connection.release()
  })

  pool = p.promise()

  // await pool.query(`DROP TABLE IF EXISTS ticks`)

  let ret = await pool.query(`CREATE TABLE IF NOT EXISTS ticks(
    t BIGINT unsigned, /* trade Time */
    s VARCHAR(15), /* symbol */
    c BIGINT unsigned, /* tradeId (trades count) */
    p double unsigned, /* price */
    q double unsigned, /* quantity */
    m BOOL, /* buyer maker? */
    b BIGINT unsigned, /* buyer orderId */
    a BIGINT unsigned, /* seller orderId */
    INDEX ts (t, s) /* search by time & symbol */
  ) engine=RocksDB`)
  log('- DB: create table "ticks" ->', ret)

  await pool.query(`DROP TABLE IF EXISTS symbols`)
  ret = await pool.query(`CREATE TABLE IF NOT EXISTS symbols (
    s VARCHAR(15) /* symbol */
  ) engine=RocksDB`)
  log('- DB: create table "symbols" ->', ret)

  return pool
}

module.exports = initDb
