"use strict"

/**
 * @param {string} key
 * @param {string} value
 * @param {number} secUntilExpiration Seconds until expiration Set to -1 to delete a cookie.
 */
function setCookie (key, value, secUntilExpiration) {
  document.cookie = secUntilExpiration
    ? `${key}=${value}; expires=${new Date(Date.now() + secUntilExpiration * 1000).toUTCString()}`
    : `${key}=${value}`
}

/**
 * @param {string} key
 * @return {string} value
 */
function getCookieValue (key) {
  let b = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)')
  return b ? b.pop() : ''
}
