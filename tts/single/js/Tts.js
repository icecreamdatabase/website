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
    this.msgQueue = []
    this.currentMessage = []
    /** @type {number} */
    this.currentMessageTimeoutId = undefined


    eventify(msgQueue, this.onMsgQueuePush.bind(this))

    document.getElementById("player").addEventListener("ended", this.onPlayerEnded.bind(this))

  }

  /**
   * @param {WsTtsMessage} data
   * @return {Promise<void>}
   */
  async onMessage (data) {

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
      await speak(msgObj.message, msgObj.voice, msgObj.playbackrate)
    }
  }

  async onPlayerEnded () {
    if (currentMessage.length > 0) {
      let msgObj = currentMessage.shift()
      await speak(msgObj.message, msgObj.voice, msgObj.playbackrate)
      return
    }

    // Delay between messages
    await sleep(1000)

    if (msgQueue.length > 0) {
      currentMessage = msgQueue.shift()
      let msgObj = currentMessage.shift()
      if (msgObj) {
        await speak(msgObj.message, msgObj.voice, msgObj.playbackrate)
        return
      }
    }

    audioPlaying = false
  }

  async speak (text, voice = "Brian", playbackrate = 1.0) {

    let mp3 = await this.main.ttsApi.getMp3(voice, text).blob()

    let blobUrl = URL.createObjectURL(mp3)
    document.getElementById("source").setAttribute("src", blobUrl)
    let player = document.getElementById("player")
    player.volume = this.volume / 100
    player.pause()
    player.load()
    player.play()
    player.playbackRate = playbackrate
  }

  skip () {
    console.log("Skipping current message ...")
    currentMessage = []
    let player = document.getElementById("player")
    player.pause()
    player.dispatchEvent(new Event("ended"))
  }

}
