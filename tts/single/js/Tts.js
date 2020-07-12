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
    this.volume = 100
    this.maxMessageTime = 0
    /** @type {TtsMessageData[][]} */
    this.redemptionQueue = []
    /** @type {TtsMessageData[]} */
    this.conversationQueue = []
    /** @type {number} */
    this.currentMessageTimeoutId = undefined

    document.getElementById("player").addEventListener("ended", this.onPlayerEnded.bind(this))
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

    await this.playRedemptionElement()
  }

  async playRedemptionElement () {
    if (this.audioPlaying && this.useQueue || this.main.ttsApi.rateLimited) {
      return
    }

    this.conversationQueue = this.redemptionQueue.shift()
    let conversationElement = this.conversationQueue.shift()
    if (conversationElement) {
      this.audioPlaying = true
      clearTimeout(this.currentMessageTimeoutId)
      if (this.maxMessageTime > 0) {
        this.currentMessageTimeoutId = setTimeout(() => {
          this.skip()
        }, 1000 * this.maxMessageTime)
      }
      await this.playConversationElement(conversationElement)
    }
  }

  /**
   * @param {TtsMessageData} conversationElement
   * @return {Promise<void>}
   */
  async playConversationElement (conversationElement) {
    let player = document.getElementById("player")

    let mp3 = await this.main.ttsApi.getMp3(conversationElement.voice, conversationElement.message)
    if (!mp3) {
      player.pause()
      player.dispatchEvent(new Event("ended"))
      return
    }

    let blobUrl = URL.createObjectURL(mp3)
    document.getElementById("source").setAttribute("src", blobUrl)
    player.volume = this.volume / 100
    player.pause()
    player.load()
    player.play()
    player.playbackRate = conversationElement.playbackrate || 1.0
  }

  async onPlayerEnded () {
    if (this.conversationQueue.length > 0) {
      let conversationElement = this.conversationQueue.shift()
      await this.playConversationElement(conversationElement)
      return
    }

    // Delay between messages
    await sleep(1000)

    if (this.redemptionQueue.length > 0) {
      this.conversationQueue = this.redemptionQueue.shift()
      let conversationElement = this.conversationQueue.shift()
      if (conversationElement) {
        await this.playConversationElement(conversationElement)
        return
      }
    }

    this.audioPlaying = false
  }

  skip () {
    console.log("Skipping current message ...")
    this.conversationQueue = []
    let player = document.getElementById("player")
    player.pause()
    player.dispatchEvent(new Event("ended"))
  }

}
