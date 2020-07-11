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

function findGetParameter (parameterName) {
  let result = null
  let tmp = []
  location.search
    .substr(1)
    .split("&")
    .forEach(item => {
      tmp = item.split("=")
      if (tmp[0].toLowerCase() === parameterName.toLowerCase()) {
        result = decodeURIComponent(tmp[1])
      }
    })
  return result
}
