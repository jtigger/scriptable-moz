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
  line1Row = quoteColumn.addStack()
  quoteText1 = line1Row.addText('"' + "Knowledge is learning something new every day.")
  line1Row.addSpacer()

  line2Row = quoteColumn.addStack()
  line2Row.addSpacer()
  quoteText2 = line2Row.addText("Wisdom is letting go of something every day." + '"')
  authorRow = quoteColumn.addStack()
  authorLeftPad = authorRow.addSpacer()
  authorText = authorRow.addText(attributeTo(moz.quote.author.name))

  content.centerAlignContent()
  quoteColumn.layoutVertically()
  quoteText1.leftAlignText()
  quoteText2.rightAlignText()

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

const SEPIA = new Color("#5E2612")
const TURQUOISE = new Color("#30d5c8")
const PURLE = new Color("#632b6c")
const DARK_PURPLE = new Color("#270f36")
bgGrad = new LinearGradient()
bgGrad.colors = [DARK_PURPLE, PURLE]
bgGrad.locations = [0, 1]

moz = {
  quote: {
    text: "Knowledge is learning something new every day.\nWisdom is letting go of something every day.",
    author: {
      name: "Jim Butcher",
      bioURL: "http://en.wikipedia.org/wiki/Jim_Butcher"
    }
  },
  art: {
    sourceURL: "let-go-or-be-dragged.jpg" 
  }
}

if (config.widgetFamily === "large" || config.widgetFamily == null) {
  widget = await buildLargeWidget(moz)
} else if (config.widgetFamily === "medium") {
  widget = await buildMediumWidget(moz)
} else if (config.widgetFamily === "small") {
  widget = await buildSmallWidget(moz)
}

widget.backgroundGradient = bgGrad

Script.setWidget(widget)
widget.presentLarge()
Script.complete()
