// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;

function asQuote(text) {
  return '"' + text + '"'
}

function attributeTo(name) {
  return "— " + name
}

// imageFor loads and returns an Image instance of the image data pointed to by `url`.
async function imageFor(url) {
  fileMgr = FileManager.iCloud()
  docsDir = fileMgr.documentsDirectory()
  path = fileMgr.joinPath(docsDir, url)
  await fileMgr.downloadFileFromiCloud(path)
  return fileMgr.readImage(path)
}

async function buildSmallWidget(moz) {
  widget = new ListWidget()
  content = widget.addStack()
  artImage = content.addImage(await imageFor(moz.art.sourceURL))

  content.centerAlignContent()

  return widget
}

async function buildMediumWidget(moz) {
  widget = new ListWidget()
  content = widget.addStack()
  quoteColumn = content.addStack()
  quoteText = quoteColumn.addText(asQuote(moz.quote.text))
  authorRow = quoteColumn.addStack()
  authorLeftPad = authorRow.addSpacer()
  authorText = authorRow.addText(attributeTo(moz.quote.author.name))

  content.centerAlignContent()
  quoteColumn.layoutVertically()
  quoteText.centerAlignText()

  return widget
}

async function buildLargeWidget(moz) {
  widget = new ListWidget()
  content = widget.addStack()
  quoteColumn = content.addStack()
  quoteText = quoteColumn.addText(asQuote(moz.quote.text))
  authorRow = quoteColumn.addStack()
  authorLeftPad = authorRow.addSpacer()
  authorText = authorRow.addText(attributeTo(moz.quote.author.name))
  gutter = content.addSpacer(18)
  artImage = content.addImage(await imageFor(moz.art.sourceURL))

  content.centerAlignContent()
  quoteColumn.layoutVertically()
  quoteText.centerAlignText()

  return widget
}

function NewLinearGradient(lightModeColors, darkModeColors) {
  grad = new LinearGradient()

  if (config.runsInWidget) {
    // detecting light/dark modes is NOT supported in widgets.
    // https://docs.scriptable.app/device/#isusingdarkappearance
    grad.colors = [
      Color.dynamic(lightModeColors[0], darkModeColors[0]),
      Color.dynamic(lightModeColors[1], darkModeColors[1])
    ]
  } else {
    grad.colors = Device.isUsingDarkAppearance() ? darkModeColors : lightModeColors
  }
  grad.locations = [0, 1]

  return grad
}

const PEACH = new Color("#f09f9c")
const LIGHT_PURPLE = new Color("#c76b98")
const PURPLE = new Color("#632b6c")
const DARK_PURPLE = new Color("#270f36")

mozs = [
{
  quote: {
    text: "Life is a journey. Time is a river. The door is ajar.",
    author: {
      name: "Jim Butcher",
      bioURL: "http://en.wikipedia.org/wiki/Jim_Butcher"
    }
  },
  art: {
    sourceURL: "yin-yang.png" 
  }
},
{
  quote: {
    text: "Knowledge is learning something new every day.\nWisdom is letting go of something every day.",
    author: {
      name: "Zen Proverb",
      bioURL: "http://en.wikipedia.org/wiki/Jim_Butcher"
    }
  },
  art: {
    sourceURL: "let-go-or-be-dragged.jpg" 
  }
},
]


moz = mozs[0]

if (config.widgetFamily === "large" || config.widgetFamily == null) {
  widget = await buildLargeWidget(moz)
} else if (config.widgetFamily === "medium") {
  widget = await buildMediumWidget(moz)
} else if (config.widgetFamily === "small") {
  widget = await buildSmallWidget(moz)
}

bgGrad = NewLinearGradient([LIGHT_PURPLE, PEACH], [DARK_PURPLE, PURPLE])
widget.backgroundGradient = bgGrad

Script.setWidget(widget)
widget.presentLarge()
Script.complete()
