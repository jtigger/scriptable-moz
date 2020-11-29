// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
//

const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

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
  quoteColumn.addSpacer()
  quoteText = quoteColumn.addText(asQuote(moz.quote.text))
  quoteColumn.addSpacer()
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
  quoteColumn.addSpacer(18)
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

function State() {
  let _state
  const STATE_TTL = 20 * 1000  // in ms

  function init() {
    if (!fileMgr.fileExists(mozHomeDir)) {
      fileMgr.createDirectory(mozHomeDir)
    }
    if (!fileMgr.fileExists(mozCatalogDir)) {
      fileMgr.createDirectory(mozCatalogDir)
    }
    if (!fileMgr.fileExists(mozStateDir)) {
      fileMgr.createDirectory(mozStateDir)
    }
  }
  function load() {
    if (fileMgr.fileExists(mozStateFile)) {
      prevState = fileMgr.readString(mozStateFile)
      // TODO: validate
      _state = JSON.parse(prevState)
    } else {
      _state = {
        latestMozId: 0
      }
    }
  }
  function get() {
    return deepCopy(_state)
  }
  function isStale() {
    if (fileMgr.fileExists(mozStateFile)) {
      sinceLastMod = new Date().getTime() - fileMgr.modificationDate(mozStateFile).getTime()
      return sinceLastMod > STATE_TTL 
    }
    return true
  }
  function save(stateUpdate) {
    init()
    if (!isStale()) {
      return false
    }
    // TODO: validate
    _state = Object.assign(_state, stateUpdate)
    fileMgr.writeString(mozStateFile, JSON.stringify(_state))
    load()
    return true
  }
  const fileMgr = FileManager.iCloud()
  const mozHomeDir = fileMgr.joinPath(fileMgr.documentsDirectory(), "scriptable-moz")
  const mozCatalogDir = fileMgr.joinPath(mozHomeDir, "catalog")
  const mozStateDir = fileMgr.joinPath(mozHomeDir, "state")
  const mozStateFile = fileMgr.joinPath(mozStateDir, "current.json")

  load()
  return {
    get: get,
    isStale: isStale,
    save: save
  }
}

mozs = {
  data: [
    {
      id: 0,
      quote: {
        text: "Life is a journey. Time is a river. The door is ajar.",
        author: {
          name: "Jim Butcher",
          bioURL: "http://en.wikipedia.org/wiki/Jim_Butcher"
        }
      },
      art: {
        sourceURL: "yin-yang.png" 
      },
      explore: {
        prompt: "Watch for an intensity"
      }
    },
    {
      id: 1,
      quote: {
        text: "Knowledge is learning something new every day.\nWisdom is letting go of something every day.",
        author: {
          name: "Zen Proverb",
          bioURL: "http://en.wikipedia.org/wiki/Jim_Butcher"
        }
      },
      art: {
        sourceURL: "let-go-or-be-dragged.jpg" 
      },
      explore: {
        prompt: "Pick something you’re hanging on to; ask the most mature version of yourself how to truly let it go."
      }
    },
    {
      id: 2,
      quote: {
        text: "Happiness is simple. Everything we do to find it is complicated.",
        author: {
          name: "Karen Maezen Miller",
          bioURL: "http://karenmaezenmiller.com/about-maezen/"
        }
      },
      art: {
        sourceURL: "rube_napkin.png" 
      },
      explore: {
        prompt: "Finish this sentence: \"I will be happy when _____.\""
      }
    },
    {
      id: 3,
      quote: {
        text: "I have found that among its other benefits, giving liberates the soul of the giver.",
        author: {
          name: "Maya Angelou",
          bioURL: "http://mayaangelou.com/"
        }
      },
      art: {
        sourceURL: "dalai-lama-laughing.jpg" 
      },
      explore: {
        prompt: "Consider your genuine and full presence a present."
      }
    },
    {
      id: 4,
      quote: {
        text: "You can’t live a perfect day without doing something for someone who will never repay you.",
        author: {
          name: "John Wooden",
          bioURL: "http://en.wikipedia.org/wiki/John_Wooden"
        }
      },
      art: {
        sourceURL: "john-wooden.jpg" 
      },
      explore: {
        prompt: "Today, try for a perfect day."
      }
    },
    {
      id: 5,
      quote: {
        text: "The world is so full of possibilities that dogmatism is simply indecent.",
        author: {
          name: "Albert Einstein",
          bioURL: "http://en.wikipedia.org/wiki/Albert_Einstein"
        }
      },
      art: {
        sourceURL: "looking-down-the-road.jpg" 
      },
      explore: {
        prompt: "Today, enjoy the sweetness of possibility."
      }
    },
    {
      id: 6,
      quote: {
        text: "If you expect your life to be up and down, your mind will be much more peaceful.",
        author: {
          name: "Lama Yeshe",
          bioURL: "http://en.wikipedia.org/wiki/Thubten_Yeshe"
        }
      },
      art: {
        sourceURL: "monks-on-coasters.jpg" 
      },
      explore: {
        prompt: "### Explore: What would you lose and what would you gain if you allowed for things to not go “your way?”"
      }
    },
  ],
  get: function(id) {
    return this.data[id]
  },
  nextId: function(id) {
    return (id + 1) % this.data.length
  }
}

state = State()
moz = mozs.get(state.get().latestMozId)

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

state.save({latestMozId: mozs.nextId(state.get().latestMozId)})

Script.complete()
