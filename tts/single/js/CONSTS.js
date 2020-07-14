"use strict"

const WS_VERSION = "3.0.3"

const SE_API_TIMEOUT = 10000 // 10 seconds

const TIME_BETWEEN_REDEMPTION_ELEMENTS = 1000 // 1 second
const TIME_BETWEEN_CONVERSATION_ELEMENT = 50 // 0.5 second

const CHANNEL_NAME = (findGetParameter(QueryParameter.CHANNEL) || "").replace('\u{E0000}', '').trim().toLowerCase()

