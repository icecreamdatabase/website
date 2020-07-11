"use strict"


class Ws {
  /**
   * @typedef {object} WsData
   * @property {string} cmd
   * @property {WsTtsMessage|object} data
   * @property {string} version
   */

  /**
   * @typedef {object} WsTtsMessage
   * @property {string} channel
   * @property {string} redeemer
   * @property {TtsMessageData[]} data
   * @property {boolean} queue
   * @property {number} volume
   * @property {number} maxMessageTime
   */

  /**
   * @typedef {object} TtsMessageData
   * @property {string} message
   * @property {string} voice
   * @property {number} [playbackrate]
   */

  constructor () {
    /**
     * @type {WebSocket}
     */
    this.socket = undefined
    /**
     * @type {Object.<string,function(Object)[]>}
     */
    this.eventCallbacks = {}
  }

  /**
   * @param {string} event
   * @param {function(Object)} cb
   */
  on (event, cb) {
    if (!Object.prototype.hasOwnProperty.call(this.eventCallbacks, event)) {
      this.eventCallbacks[event] = []
    }
    this.eventCallbacks[event].push(cb)
  }

  /**
   * @param {string} event
   * @param {Object} data
   * @private
   */
  emit (event, data) {
    if (Object.prototype.hasOwnProperty.call(this.eventCallbacks, event)) {
      for (const cb of this.eventCallbacks[event]) {
        cb(data)
      }
    }
  }

  connect () {
    this.socket = new WebSocket(findGetParameter('local') ? 'ws://localhost:4700' : 'wss://ws.icecreamdatabase.com')

    this.socket.addEventListener('open', this.onOpen.bind(this))
    this.socket.addEventListener('message', this.onMessage.bind(this))
    this.socket.addEventListener('close', this.onClose.bind(this))
    this.socket.addEventListener('error', this.onError.bind(this))
  }

  /**
   * @param {MessageEvent} event
   * @return {Promise<void>}
   */
  async onOpen (event) {
    console.log("Connected")
    /** @type {WsData} */
    let data = {
      cmd: WsCmds.CONNECT,
      data: {
        channel: (findGetParameter("channel") || "").replace('\u{E0000}', '').trim().toLowerCase()
      },
      version: WS_VERSION
    }
    this.socket.send(JSON.stringify(data))
  }

  /**
   * @param {MessageEvent} event
   * @return {Promise<void>}
   */
  async onMessage (event) {
    /** @type {WsData} */
    let obj = JSON.parse(event.data)
    console.log(obj)
    if (!obj.cmd) {
      return
    }

    switch (obj.cmd) {
      case WsCmds.RELOAD:
        location.reload()
        break
      case WsCmds.SKIP:
        skip() //TODO
        break
      case WsCmds.MESSAGE:
        // noinspection JSValidateTypes <-- Yes it's only WsTtsMessage. That is what we check in the else if above
        /** @type {WsTtsMessage} */
        if (!obj.data) {
          return
        }
        if (!obj.data.channel
          || obj.data.channel.toLowerCase() !== CHANNEL_NAME) {
          return
        }
        this.emit(WsCmds.MESSAGE, obj.data)
        //volume = obj.data.volume || volume
        //maxMessageTime = obj.data.maxMessageTime || maxMessageTime
        //msgQueue.push(obj.data.data)
        //useQueue = !!obj.data.queue
        break
      default:
        console.error(`Unkown obj.cmd type: ${obj.cmd}`)
    }
  }

  /**
   * @param {MessageEvent} event
   * @return {Promise<void>}
   */
  async onClose (event) {
    this.socket = null
    this.connect()
  }

  /**
   * @param {MessageEvent} event
   * @return {Promise<void>}
   */
  async onError (event) {
    //this.socket = null
    //this.connect()
  }

}
