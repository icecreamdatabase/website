"use strict"

class Main {
  constructor () {
    this.ttsApi = new TtsApi(this)
    this.ws = new Ws(this)
    this.tts = new Tts(this)

    this.ws.connect()
  }
}

new Main()
