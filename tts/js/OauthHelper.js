"use strict"

/**
 * @typedef {Object} idTokenParsed
 * @property {string} at_hash
 * @property {string} aud
 * @property {string} azp
 * @property {number} exp
 * @property {number} iat
 * @property {string} iss
 * @property {string} preferred_username
 * @property {string} sub
 */

/**
 * @typedef {Object} oauth2Hash
 * @property {string} access_token
 * @property {string} id_token
 * @property {idTokenParsed} id_token_parsed
 * @property {string} scope
 * @property {string} token_type
 */

/**
 * @param {string} token
 * @return {Object}
 */
function parseJwt (token) {
  let base64Url = token.split('.')[1]
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))

  return JSON.parse(jsonPayload)
}

/**
 * @return {oauth2Hash|Object}
 */
function parseHash () {
  let result = {}
  let tmp = []
  location.hash
    .substr(1)
    .split("&")
    .forEach(item => {
      tmp = item.split("=")
      if (tmp[0]) {
        result[tmp[0].toLowerCase()] = decodeURIComponent(tmp[1])
      }
    })
  if (result["id_token"]) {
    result["id_token_parsed"] = parseJwt(result["id_token"])
  }
  return result
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

/**
 * @typedef {Object} ValidationData
 * @property {string} [client_id]
 * @property {string} [login]
 * @property {string[]} [scopes]
 * @property {string} [user_id]
 * @property {number} [expires_in]
 * @property {number} [status]
 * @property {string} [message]
 */

/**
 * @param {string} accessToken
 * @return {Promise<ValidationData>}
 * @throws HTTP fetch exceptions.
 */
async function validate (accessToken) {
  let requestOptions = {
    method: 'GET',
    headers: {"Authorization": `OAuth ${accessToken}`},
    redirect: 'follow'
  }
  let response = await fetch("https://id.twitch.tv/oauth2/validate", requestOptions)
  return JSON.parse(await response.text())
}
