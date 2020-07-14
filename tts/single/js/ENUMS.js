"use strict"
const WsCmds = Object.freeze({
  "CONNECT": "tts_connect",
  "MESSAGE": "tts_message",
  "SKIP": "tts_skip",
  "RELOAD": "tts_reload"
})

const TtsEvents = Object.freeze({
  "NEW_REDEMPTION_ELEMENT": "redemption",
  "NEW_CONVERSATION_ELEMENT": "conversation",
  "SKIP": "skip",
  "ENDED": "ended"
})

const QueryParameter = Object.freeze({
  "CHANNEL": "channel",
  "LOCAL": "local",
  "ON_SCREEN_MESSAGES_ENABLED": "onScreenMessagesEnabled",
  "ON_SCREEN_MESSAGES_WIDTH": "onScreenMessagesWidth",
  "ON_SCREEN_MESSAGES_FONTSIZE": "onScreenMessagesFontsize",
  "ON_SCREEN_MESSAGES_REDEEMER_COLOR_OVERWRITE": "onScreenMessagesRedeemerColorOverwrite",
  "ON_SCREEN_MESSAGES_CONTENT_COLOR": "onScreenMessagesMessageColor"
})
