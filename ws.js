const EventEmitter = require('events'),
  WebSocket = require('ws'),
  log = require('./log')

class WS extends EventEmitter {
  constructor(uri, keepAliveSeconds = 10) {
    super()

    this.uri = uri
    this.timer = null
    this.isAlive = false
    this.ws = null
    this.keepAliveSeconds = keepAliveSeconds

    this.setup(uri)
  }

  onopen() {
    log('- WS stream opened')
    this.isAlive = true
    this.emit('wsopen', this.ws)

    this.timer = setInterval(() => {
      if (!this.isAlive) return this.setup(this.uri)
      this.isAlive = false

      // check if WS opened else it will throw an exception
      if (this.ws && this.ws.readyState === this.ws.OPEN) {
        this.ws.pong() // unsoliciated pong permitted and should be used according to Binance docs
        this.ws.ping()
      }
    }, this.keepAliveSeconds * 1000)
  }

  onerror(e) {
    log('- WS err:', e)
    process.exit(0)
  }

  onclose(e) {
    log('- WS disconnect:', e)
    process.exit(0)
  }

  onpong() {
    log('- WS PONG received')
    this.isAlive = true
  }

  onping() {
    log('- WS PING received')
    this.isAlive = true
    try {
      this.ws.pong()
    } catch (e) {
      log('- WS pong err:', e?.toString())
      this.emit('wserror', e)
    }
  }

  onmessage(e) {
    this.emit('wsmessage', e)
  }

  setup(uri) {
    log('- WS setup')
    if (this.ws) { // try to terminate gracefully previous sessions
      try { this.ws.close() } catch (e) { }
      try { this.ws.terminate() } catch (e) { }
    }

    // connect & map events to class functions
    this.ws = new WebSocket(uri)
    this.ws
      .on('open', this.onopen.bind(this))
      .on('error', this.onerror.bind(this))
      .on('close', this.onclose.bind(this))
      .on('pong', this.onpong.bind(this))
      .on('ping', this.onping.bind(this))
      .on('message', this.onmessage.bind(this))

    this.isAlive = true
  }

  terminate() {
    try { this.ws.close() } catch (e) { }
    try { this.ws.terminate() } catch (e) { }
    delete this.ws
  }
}

module.exports = WS