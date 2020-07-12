"use strict"
const WsCmds = Object.freeze({
  "CONNECT": "tts_connect",
  "MESSAGE": "tts_message",
  "SKIP": "tts_skip",
  "RELOAD": "tts_reload"
})

const TtsEvents = Object.freeze({
  "NEW_REDEMPTION": "redemption",
  "NEW_CONVERSATION_ELEMENT": "conversation",
  "SKIP": "skip",
  "ENDED": "ended"
})
