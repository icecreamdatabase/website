"use strict"

const CSS_COLOR_NAMES = ["aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgrey", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgrey", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"]

class OnScreenMessage {
  /**
   * @param {Main} main
   */
  constructor (main) {
    this.main = main

    // Initialize the parameters.
    this.notify = !!findGetParameter("notifications")
    this.notifyWidth = findGetParameter("width") || "630px"
    this.fontSize = findGetParameter("fontsize") || "13px"
    this.textRedeemerColor = OnScreenMessage.fixColorInput(findGetParameter("redeemercolor")) || "#9147ff"
    this.textContentColor = OnScreenMessage.fixColorInput(findGetParameter("contentcolor")) || "white"

    // Notifications
    this.notifyElement = document.getElementById("notifications")
    this.notifyRedeemer = document.getElementById("notifyRedeemer")
    this.notifyContent = document.getElementById("notifyContent")


    // Notifications styles
    this.notifyElement.style.width = this.notifyWidth
    this.notifyElement.style.fontSize = this.fontSize
    this.notifyElement.style.fontFamily = "Arial, sans-serif"

    this.notifyRedeemer.style.color = this.textRedeemerColor
    this.notifyRedeemer.style.fontWeight = "bold"

    this.notifyContent.style.color = this.textContentColor


    this.main.tts.on(TtsEvents.NEW_CONVERSATION_ELEMENT, this.sendToNotifications.bind(this))
    this.main.tts.on(TtsEvents.ENDED, this.endNotifications.bind(this))
  }


  static fixColorInput (input) {
    if (input != null) {
      if (CSS_COLOR_NAMES.indexOf(input.toLowerCase()) !== -1) {
        return input
      } else {
        return "#" + input
      }
    }
  }

  sendToNotifications (information) {
    if (this.notify) {
      //console.log(JSON.stringify(information));
      this.notifyRedeemer.innerHTML = (information.redeemer)
      this.notifyContent.innerHTML = (": " + information.message)

      this.notifyElement.style.display = "block"
    }

  }

  endNotifications () {
    if (this.notify) {
      this.notifyElement.style.display = "none"
    }
  }
}

