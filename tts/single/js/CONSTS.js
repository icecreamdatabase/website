"use strict"

const WS_VERSION = "3.0.2"

const SE_API_TIMEOUT = 10000 // 10 seconds

const CHANNEL_NAME = (findGetParameter("channel") || "").toLowerCase()

