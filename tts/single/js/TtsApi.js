"use strict"

class TtsApi {
  /**
   * @param {Main} main
   */
  constructor (main) {
    this.main = main
    //let rlLimit = 30
    this.rlRemaining = 30 // Default value of StreamElements
    this.rlReset = Date.now()
    this.rateLimited = false
  }

  /**
   * @param {string} voice
   * @param {string} text
   * @param {number} requestAttemptsBeforeError Min 1.
   * @return {Promise<Blob|undefined>}
   * @throws Api request failed requestAttemptsBeforeError times in a row.
   * @throws HTTP Error 400.
   */
  async getMp3 (voice, text, requestAttemptsBeforeError = 3) {
    //We need to try at least once
    requestAttemptsBeforeError = Math.max(1, requestAttemptsBeforeError)

    while (requestAttemptsBeforeError > 0) {
      let response = await this.request(voice, text)
      if (response.status === 200) {
        // Ok
        return response.blob()
      } else if (response.status === 400) {
        // Bad request
        throw new Error(`HTTP Error 400: ${await response.text()}`)
      } else {
        //Some error (ratelimit, timeout, http error)
        console.warn(await response.text())
      }
      requestAttemptsBeforeError--
    }
    throw new Error(`Api request failed ${requestAttemptsBeforeError} times in a row. Something must be wrong!`)
  }

  /**
   * @param {string} voice
   * @param {string} text
   * @param {number} apiTimeout
   * @return {Promise.<Response>}
   */
  async request (voice, text, apiTimeout = SE_API_TIMEOUT) {
    if (this.rlRemaining <= 1) {
      if (this.rlReset >= Date.now()) {
        this.rateLimited = true
        console.log("Rate limited - waiting!")
        await sleep(Math.max(10, this.rlReset - Date.now()))
        this.rateLimited = false
      }
    }

    console.log(`Starting TTS request: ${voice}: ${encodeURIComponent(text.trim())}`)
    let response = await this.fetchWithTimeout(`https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text.trim())}`, apiTimeout)

    if (response.status !== -1) {
      // Rate limiting headers
      //rlLimit = response.headers.get('x-ratelimit-limit')
      let newRlReset = response.headers.get('x-ratelimit-reset')
      if (newRlReset > rlReset) {
        rlReset = newRlReset
        rlRemaining = 30
      } else {
        rlRemaining = response.headers.get('x-ratelimit-remaining')
      }
    }

    return response
  }

  fetchWithTimeout (url, requestTimeout) {
    const timer = new Promise((resolve) => {
      setTimeout(resolve, requestTimeout, {
        timeout: true,
      })
    })
    return Promise.race([
      fetch(url),
      timer
    ]).then(response => {
      if (response.timeout) {
        let response = new Response()
        response.status = -1
        response.text = () => new Promise(resolve => resolve(`Request took over ${SE_API_TIMEOUT / 1000} seconds. Trying again`))
        return response
      }
      return response
    })
  }

}
