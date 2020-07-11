"use strict"

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const eventify = (arr, callback) => {
  arr.push = e => {
    Array.prototype.push.call(arr, e)
    callback(arr)
  }
}
