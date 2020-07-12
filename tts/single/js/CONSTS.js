"use strict"

const WS_VERSION = "3.0.2"

const SE_API_TIMEOUT = 10000 // 10 seconds

const TIME_BETWEEN_REDEMPTION_ELEMENTS = 1000 // 1 second
const TIME_BETWEEN_CONVERSATION_ELEMENT = 500 // 0.5 second

const CHANNEL_NAME = (findGetParameter("channel") || "").toLowerCase()

