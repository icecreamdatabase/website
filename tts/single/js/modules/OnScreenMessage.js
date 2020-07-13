"use strict"

const CSS_COLOR_NAMES = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgrey", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"]

class OnScreenMessage {
  /**
   * @param {Main} main
   */
  constructor (main) {
    this.main = main

    // If no notifcation don't set any settings or add event handlers
    if (!findGetParameter("notifications")) {
      return
    }

    // Set style from query parameter
    document.getElementById("notifications").style.width = findGetParameter("width") || "630px"
    document.getElementById("notifications").style.fontSize = findGetParameter("fontsize") || "13px"

    this.redeemerColorOverwrite = OnScreenMessage.fixColorInput(findGetParameter("redeemercolor")) // || "#9147ff"
    document.getElementById("notifyContent").style.color = OnScreenMessage.fixColorInput(findGetParameter("contentcolor")) || "white"

    this.main.tts.on(TtsEvents.NEW_CONVERSATION_ELEMENT, this.startNotifications.bind(this))
    this.main.tts.on(TtsEvents.ENDED, this.endNotifications.bind(this))
  }

  /**
   * @param {string|number} input
   * @return {string|number|undefined}
   */
  static fixColorInput (input) {
    if (input) {
      return CSS_COLOR_NAMES.indexOf(input.toLowerCase()) !== -1 ? input : "#" + input
    }
  }

  /**
   * Runs on TtsEvent.NEW_CONVERSATION_ELEMENT.
   * @param {TtsMessageData} event
   */
  startNotifications (event) {
    document.getElementById("notifyRedeemer").style.color = this.redeemerColorOverwrite || event.redeemerColor //if overwrite is undefined use parameter colour
    document.getElementById("notifyRedeemer").innerHTML = event.redeemer
    document.getElementById("notifyContent").innerHTML = `: ${event.message}`

    OnScreenMessage.setDivNotifyVisibility(true)

  }

  /**
   * Runs on TtsEvent.ENDED.
   */
  endNotifications () {
    OnScreenMessage.setDivNotifyVisibility(false)
  }

  /**
   * @param {boolean} visible
   * @static
   * @private
   */
  static setDivNotifyVisibility (visible) {
    document.getElementById("notifications").style.display = visible ? "block" : "none"
  }
}

