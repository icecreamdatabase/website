"use strict"

class Main {
  constructor () {
    /* ----- BASE ----- */
    this.ttsApi = new TtsApi(this)
    this.ws = new Ws(this)
    this.tts = new Tts(this)

    /* ----- MODULES ----- */
    this.onScreenMessage = new OnScreenMessage(this)

    /* ----- SETUP ----- */
    this.ws.connect()
  }
}

const main = new Main()
