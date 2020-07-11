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
    this.msgQueue = []
    /** @type {TtsMessageData[]} */
    this.currentMessage = []
    /** @type {number} */
    this.currentMessageTimeoutId = undefined


    eventify(this.msgQueue, this.onMsgQueuePush.bind(this))

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
    this.msgQueue.push(data.data)
  }

  async onMsgQueuePush (arr) {
    if (this.audioPlaying && this.useQueue || this.main.ttsApi.rateLimited) {
      return
    }

    this.currentMessage = arr.shift()
    let msgObj = this.currentMessage.shift()
    if (msgObj) {
      this.audioPlaying = true
      clearTimeout(this.currentMessageTimeoutId)
      if (this.maxMessageTime > 0) {
        this.currentMessageTimeoutId = setTimeout(() => {
          this.skip()
        }, 1000 * this.maxMessageTime)
      }
      await this.speak(msgObj.message, msgObj.voice, msgObj.playbackrate)
    }
  }

  async onPlayerEnded () {
    if (this.currentMessage.length > 0) {
      let msgObj = this.currentMessage.shift()
      await this.speak(msgObj.message, msgObj.voice, msgObj.playbackrate)
      return
    }

    // Delay between messages
    await sleep(1000)

    if (this.msgQueue.length > 0) {
      this.currentMessage = this.msgQueue.shift()
      let msgObj = this.currentMessage.shift()
      if (msgObj) {
        await this.speak(msgObj.message, msgObj.voice, msgObj.playbackrate)
        return
      }
    }

    this.audioPlaying = false
  }

  async speak (text, voice = "Brian", playbackrate = 1.0) {
    let player = document.getElementById("player")

    let mp3 = await this.main.ttsApi.getMp3(voice, text)
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
    player.playbackRate = playbackrate
  }

  skip () {
    console.log("Skipping current message ...")
    this.currentMessage = []
    let player = document.getElementById("player")
    player.pause()
    player.dispatchEvent(new Event("ended"))
  }

}
