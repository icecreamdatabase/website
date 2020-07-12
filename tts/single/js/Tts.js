"use strict"

class Tts {
  /**
   * @param {Main} main
   */
  constructor (main) {
    this.main = main
    this.main.ws.on(WsCmds.MESSAGE, this.onMessage.bind(this))

    this.useQueue = true
    this.audioPlaying = false
    this.isPrefetchingAudio = false
    this.volume = 100
    this.maxMessageTime = 0
    /** @type {TtsMessageData[][]} */
    this.redemptionQueue = []
    /** @type {TtsMessageData[]} */
    this.conversationQueue = []
    /** @type {number} */
    this.currentMessageTimeoutId = undefined
    /** @type {number} */
    this.lastMessagEndTimestamp = 0

    /**
     * @type {Object.<string,function(Object)[]>}
     */
    this.eventCallbacks = {}

    document.getElementById("player").addEventListener("ended", this.onPlayerEnded.bind(this))
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

  /**
   * @param {WsTtsMessage} data
   * @return {Promise<void>}
   */
  async onMessage (data) {
    this.volume = data.volume !== undefined ? data.volume : this.volume
    this.maxMessageTime = data.maxMessageTime !== undefined ? data.maxMessageTime : this.maxMessageTime
    this.useQueue = !!data.queue
    this.redemptionQueue.push(data.data)

    await this.run()
  }

  async run () {
    if (this.audioPlaying && this.useQueue || this.isPrefetchingAudio) {
      return
    }

    /* ---- Do we skip due to the queue or do we play the next conversaiontElement in the queue ----- */
    if (this.conversationQueue.length > 0) { // conversations left
      if (this.redemptionQueue.length > 0 && !this.useQueue) { // redemptions left and no queueing allowed
        //clear conversation queue
        this.conversationQueue = []
      } else {
        //play next
        let sleepDuration = this.lastMessagEndTimestamp - Date.now() + TIME_BETWEEN_CONVERSATION_ELEMENT
        console.debug(`Next conversation; Waiting for ${sleepDuration} ms`)
        if (sleepDuration > 0) {
          await sleep(sleepDuration)
        }
        await this.playConversationElement(this.conversationQueue.shift())
        return
      }
    }

    /* ----- process next redemption queue element and start first conversationQueue element ---- */
    if (this.redemptionQueue.length > 0) {
      this.conversationQueue = this.redemptionQueue.shift()
      this.emit(TtsEvents.NEW_REDEMPTION, this.conversationQueue)

      //this might take a while when the API is overloaded
      this.isPrefetchingAudio = true
      let data = await Promise.allSettled(this.conversationQueue.map(conversationElement => this.main.ttsApi.getMp3(conversationElement.voice, conversationElement.message)))
      this.isPrefetchingAudio = false

      // add the blob to the queue elements
      for (let i = 0; i < this.conversationQueue.length; i++) {
        // noinspection JSValidateTypes
        this.conversationQueue[i].blob = data[i].value
      }

      let sleepDuration = this.lastMessagEndTimestamp - Date.now() + TIME_BETWEEN_REDEMPTION_ELEMENTS
      console.debug(`Next redemption; Waiting for ${sleepDuration} ms`)
      if (sleepDuration > 0) {
        await sleep(sleepDuration)
      }

      // Deal with maxMessageTime
      clearTimeout(this.currentMessageTimeoutId)
      if (this.maxMessageTime > 0) {
        this.currentMessageTimeoutId = setTimeout(() => this.skip(), 1000 * this.maxMessageTime)
      }

      // Start first of next queue.
      await this.playConversationElement(this.conversationQueue.shift())
    }
  }

  /**
   * @param {TtsMessageData} conversationElement
   * @return {Promise<void>}
   */
  async playConversationElement (conversationElement) {
    this.audioPlaying = true
    this.emit(TtsEvents.NEW_CONVERSATION_ELEMENT, conversationElement)
    let player = document.getElementById("player")

    // Either use prefetched blob or fetch new one individually
    let mp3Blob = conversationElement.blob
      ? conversationElement.blob
      : await this.main.ttsApi.getMp3(conversationElement.voice, conversationElement.message)

    // if blob still failed something must be wrong. Simply skip that element.
    if (!mp3Blob) {
      player.pause()
      player.dispatchEvent(new Event("ended"))
      return
    }

    // Play blob
    let blobUrl = URL.createObjectURL(mp3Blob)
    document.getElementById("source").setAttribute("src", blobUrl)
    player.volume = this.volume / 100
    player.pause()
    player.load()
    player.play()
    player.playbackRate = conversationElement.playbackrate || 1.0
  }

  async onPlayerEnded () {
    this.lastMessagEndTimestamp = Date.now()
    this.audioPlaying = false
    await this.run()
  }

  skip () {
    console.log("Skipping current message ...")
    this.conversationQueue = []
    let player = document.getElementById("player")
    player.pause()
    this.emit(TtsEvents.SKIP, undefined)
    this.emit(TtsEvents.ENDED, undefined)
    player.dispatchEvent(new Event("ended"))
  }

}
