// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
//

// deepCopy clones `obj` (via JSON serialization/deserialization)
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// imageFor loads and returns an Image instance of the image data pointed to by `url`.
async function imageFor(url) {
  fileMgr = FileManager.iCloud()
  docsDir = fileMgr.documentsDirectory()
  path = fileMgr.joinPath(docsDir, url)
  await fileMgr.downloadFileFromiCloud(path)
  return fileMgr.readImage(path)
}

// State contains persisted state of the MoZ app.
//   stateTTL (optional) = the minimum amount of time (in minutes) since latest refresh before considering state as "stale".
function State(stateTTL) {
  let _state
  stateTTL = ((stateTTL === undefined) ? 0.5 : stateTTL) * 60 * 1000  // convert to milliseconds 

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
      return sinceLastMod > stateTTL 
    }
    return true
  }
  function setNextId(id) {
    if (!isStale()) {
      return false
    }
    save({latestMozId: id})
  }
  function save(stateUpdate) {
    // TODO: validate
    _state = Object.assign(_state, stateUpdate)
    fileMgr.writeString(mozStateFile, JSON.stringify(_state))
    return true
  }
  const fileMgr = FileManager.iCloud()
  const mozHomeDir = fileMgr.joinPath(fileMgr.documentsDirectory(), "scriptable-moz")
  const mozCatalogDir = fileMgr.joinPath(mozHomeDir, "catalog")
  const mozStateDir = fileMgr.joinPath(mozHomeDir, "state")
  const mozStateFile = fileMgr.joinPath(mozStateDir, "current.json")

  init()
  return {
    get: get,
    isStale: isStale,
    setNextId: setNextId
  }
}

// InMemoryMozStore provides a preloaded MozStore all present in memory.
function InMemoryMozStore() {
  let data = [
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
        sourceURL: "yin-yang.png",
        description: "A simple, black and white yin-yang."
      },
      explore: {
        prompt: "Watch for an intense reaction, today; what makes it so certain?"
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
        sourceURL: "let-go-or-be-dragged.jpg",
        description: "Black-and-white photo of a hot-air balloon near the ground, careening forward, basket leading. Dangling behind it, a man dangling by a rope, is nearly scraping the ground."
      },
      explore: {
        prompt: "Pick a little belief you take as a given: what would it be like for the opposite to be true?"
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
        sourceURL: "rube_napkin.png",
        description: "A cartoon of a man sipping a bowl of soup with a mechanical rube-goldberg device mounted to his head. The devices features a spoon, a cracker, a bird, a bucket, a rocket, a hook, a clock, and finally a napkin that wipes his face."
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
        sourceURL: "dalai-lama-laughing.jpg",
        description: "A full color photo of the 11th Dalai Lama overcome with laughter with a friend."
      },
      explore: {
        prompt: "What does it look like to fully accept what has happened? ... to fully accept what will happen?"
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
        sourceURL: "john-wooden.jpg",
        description: "Headshot of famous American college basketball coach, John Wooden. He's silvered with Malcolm X-styled spectacles, relaxed yet fully engaged with the action on the court."
      },
      explore: {
        prompt: "What do _you_ get out of giving with absolutely no strings attached?"
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
        sourceURL: "looking-down-the-road.jpg",
        description: "Full color photo of a desert highway in big sky country with a child, arms akimbo, with her back towards us, looking down the road."
      },
      explore: {
        prompt: "Find a way to make _their_ idea work. Bonus points if it's different than how you'd do it."
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
        sourceURL: "monks-on-coasters.jpg",
        description: "Full color photo of a roller coaster full of buddhist monks, in saffron robes, arms up, all screaming with delight."
      },
      explore: {
        prompt: "What does expecting life to be down feel like?"
      }
    },
    {
      id: 7,
      quote: {
        text: "Security is mostly a superstition. It does not exist in nature... Avoiding danger is no safer in the long run than outright exposure. Life is either a daring adventure, or nothing.",
        author: {
          name: "Helen Keller",
          bioURL: "http://en.wikipedia.org/wiki/Helen_Keller"
        }
      },
      art: {
        sourceURL: "your-comfort-zone.jpg",
        description: "Line drawing of two circles near each other. The larger one, on the left, reads, \"Where the magic happens\"; the smaller one on the right has an arrow pointing at its center and on the tail end of the arrow, \"Your comfort zone.\""
      },
      explore: {
        prompt: "How do you find security?"
      }
    },
    {
      id: 8,
      quote: {
        text: "Common sense is the collection of prejudices acquired by age eighteen.",
        author: {
          name: "Albert Einstein",
          bioURL: "http://einstein.biz"
        }
      },
      art: {
        sourceURL: "einstein-tongue-out.jpg",
        description: "Black-and-white photo of the famous scientist, with the infamous wide-eyed with tongue fully stuck out-and-down look."
      },
      explore: {
        prompt: "What's an example of something you consider \"common sense?\" How do you know it is true?"
      }
    },
    {
      id: 9,
      quote: {
        text: "If they can get you asking the wrong questions, they don't have to worry about answers.",
        author: {
          name: "Thomas Pynchon",
          bioURL: "http://en.wikipedia.org/wiki/Thomas_Pynchon"
        }
      },
      art: {
        sourceURL: "pynchon-simpsons.jpg",
        description: "A frame from a The Simpson's show depicting Thomas Pynchon as a figure with a brown bag over his head."
      },
      explore: {
        prompt: "When you have a moment alone, what kinds of questions are you asking yourself?"
      }
    },
    {
      id: 10,
      quote: {
        text: "Muddy water, let stand - becomes clear.",
        author: {
          name: "Lao Tsu",
          bioURL: "http://www.chebucto.ns.ca/Philosophy/Taichi/lao.html"
        }
      },
      art: {
        sourceURL: "yin-yang.png",
        description: "A simple, black and white yin-yang."
      },
      explore: {
        prompt: "If the mind were like water, what could you do to “let stand?”"
      }
    },
    {
      id: 11,
      quote: {
        text: "Those only are happy who have their minds fixed on some object other than their own happiness… aiming thus at something else, they find happiness by the way.",
        author: {
          name: "John Stuart Mill",
          bioURL: "http://en.wikipedia.org/wiki/John_Stuart_Mill"
        }
      },
      art: {
        sourceURL: "reflective-spheres.jpg",
        description: "Full color photograph of a dozen polished spheres, reflecting each other."
      },
      explore: {
        prompt: "Where do you find your happiness?"
      },
      further: [
        {
          text: "TEDx: “Obliquity” by John Kay",
          url: "https://www.youtube.com/watch?v=_BoAtYL3OWU"
        }
      ],
    },
    {
      id: 12,
      quote: {
        text: "The clearer I perceive that which is True, the less reasoning, judging, arguing I can do.",
        author: {
          name: "Angelus Silesius",
          bioURL: "http://en.wikipedia.org/wiki/Angelus_Silesius"
        }
      },
      art: {
        sourceURL: "silesius.jpg",
        description: "Drawing depicting a bust of Angelus Silesius."
      },
      explore: {
        prompt: "Today, listen for any internal judging or arguing. What hard-to-accept reality is at play?"
      }
    },
    {
      id: 13,
      quote: {
        text: "Wisdom is understanding that you do not have to hold your happiness for ransom, the quality of the journey has to be more important than the destination.",
        author: {
          name: "Sam Harris",
          bioURL: "https://en.wikipedia.org/wiki/Sam_Harris"
        }
      },
      art: {
        sourceURL: "sam-harris-headshot-black-and-white.jpg",
        description: "Black and white headshot of Sam Harris."
      },
      explore: {
        prompt: "When *should* you be happy? When your to-do list is empty? When all your problems are solved? When your desires are gratified? When all the news is good?"
      }
    },
    {
      id: 14,
      quote: {
        text: "It's the ability to experience things prior to concepts ... these are problems that cannot be solved by more thinking.",
        author: {
          name: "Sam Harris",
          bioURL: "https://en.wikipedia.org/wiki/Sam_Harris"
        }
      },
      art: {
        sourceURL: "poison-arrow.png",
        description: "A figure in the foreground struck by a poison error with a figure in the background sweeping cherry blossoms."
      },
      explore: {
        prompt: "Try to experience the sensation directly, rather than the idea of the sensation."
      }
    },
  ]

  return {
    // get returns the full MoZ object identified by `id`
    get: function(id) {
      if (data[id] == null) {
        return null
      }
      return deepCopy(data[id])
    },
    // nextId returns the id of the MoZ that follows `id` 
    //   the "next id" of the last MoZ is the first MoZ
    nextId: function(id) {
      return (id + 1) % data.length
    }
  }
}

function App(state, store, appConfig) {
  const PEACH = new Color("#f09f9c")
  const LIGHT_PURPLE = new Color("#c76b98")
  const PURPLE = new Color("#632b6c")
  const DARK_PURPLE = new Color("#270f36")

  function asQuote(text) {
    return '"' + text + '"'
  }

  function attributeTo(name) {
    return "— " + name
  }

  function urlForMoz(mozId) {
    return URLScheme.forRunningScript() + "?" + appConfig.queryParamNames.mozId + "=" + mozId
  }

  async function addArtRow(widget, moz) {
    artRow = widget.addStack()
    artRow.addSpacer()
    artImage = artRow.addImage(await imageFor(moz.art.sourceURL))
    artImage.cornerRadius = 12
    artRow.addSpacer()
  }

  function addQuoteRow(widget, moz) {
    quoteRow = widget.addStack()
    quoteRow.addSpacer()
    quoteText = quoteRow.addText(asQuote(moz.quote.text))
    quoteRow.addSpacer()
    quoteText.centerAlignText()
    quoteText.minimumScaleFactor = widget.apropos(1, 14/20, 16/24)
    quoteText.font = new Font("Noteworthy", widget.apropos(0, 20, 24))
  }

  function addAuthorRow(widget, moz) {
    authorRow = widget.addStack()
    authorRow.addSpacer()
    authorText = authorRow.addText(attributeTo(moz.quote.author.name))
    authorText.font = new Font("Zapfino", widget.apropos(0, 10, 14))
  }

  function zoomToFill(imgSize, containerSize) {
    heightRatio = containerSize.height / imgSize.height 
    widthRatio = containerSize.width / imgSize.width 
    zoom = heightRatio > widthRatio ? heightRatio : widthRatio

    return new Size(imgSize.width * zoom, imgSize.height * zoom)
  }

  // https://developer.apple.com/design/human-interface-guidelines/ios/system-capabilities/widgets/#adapting-to-different-screen-sizes
  const SMALL_WIDGET_SIZE = new Size(169,169)

  async function buildSmallWidget(widget, moz) {
    widget.url = urlForMoz(moz.id)

    art = await imageFor(moz.art.sourceURL)

    artImage = widget.addImage(art)
    artImage.imageSize = zoomToFill(art.size, SMALL_WIDGET_SIZE)

    return widget
  }

  async function buildMediumWidget(widget, moz) {
    widget.url = urlForMoz(moz.id)

    widget.addSpacer()
    addQuoteRow(widget, moz)
    widget.addSpacer()
    addAuthorRow(widget, moz)

    return widget
  }


  async function buildLargeWidget(widget, moz) {
    addArtRow(widget, moz)
    widget.addSpacer(8)
    addQuoteRow(widget, moz)
    widget.addSpacer(4)
    addAuthorRow(widget, moz)

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

  // NewWidget instantiates an enhanced ListWidget, building the layout appropriate for the current widget family.
  //   Instances include the following functions:
  //   - apropos(small,medium,large) = given three values, returns the one appropriate for this widget's family.
  //   - present() = calls the appropriate presentXXX() function appropriate for this widget's family.
  async function NewWidget(widgetFamily, moz) {
    let widget = new ListWidget()
    widget.apropos = function (small, medium, large) {
      if (widgetFamily == "small") {
        return small
      }
      if (widgetFamily == "medium") {
        return medium
      }
      if (widgetFamily == "large") {
        return large
      }
    }
    widget.present = function() {
      if (widgetFamily == "small") {
        widget.presentSmall()
      }
      if (widgetFamily == "medium") {
        widget.presentMedium()
      }
      if (widgetFamily == "large") {
        widget.presentLarge()
      }
    }
    let builder = widget.apropos(buildSmallWidget, buildMediumWidget, buildLargeWidget)
    await builder(widget, moz)
    return widget
  }

  // buildMozWidget produces the appropriately sized MoZ widget.
  //   widgetFamily = (string) one of "small", "medium", "large"
  //   mozId = (int) the id of the MoZ to display.
  //     if `null` displays the next MoZ in the store.
  async function buildMozWidget(widgetFamily, mozId) {
    if (mozId) {
      // (attempt to) fetch the exact MoZ requested
      moz = store.get(mozId)
      if (moz == null) {
        // not present, fallback to latest
        moz = store.get(state.get().latestMozId)
      }
    } else {
      // fetch the "next" MoZ
      state.setNextId(store.nextId(state.get().latestMozId))
      moz = store.get(state.get().latestMozId)
    }

    widget = await NewWidget(widgetFamily, moz)
    widget.backgroundGradient = NewLinearGradient([LIGHT_PURPLE, PEACH], [DARK_PURPLE, PURPLE])

    return widget
  }

  return { buildMozWidget: buildMozWidget }
}

// process arguments
widgetFamily = config.widgetFamily || "large"
const QUERY_PARAM_MOZ_ID = "mozId"
// TODO: validate (verify that parseInt() is safe OR paranoidly trim to a safe size)
mozId = args.queryParameters[QUERY_PARAM_MOZ_ID]
stateTTL = 1  // in minutes

// construct dependencies
state = State(stateTTL)
store = InMemoryMozStore()
appConfig = {
  queryParamNames: {
    mozId: QUERY_PARAM_MOZ_ID
  }
}

widget = await App(state, store, appConfig).buildMozWidget(widgetFamily, mozId)
if (config.runsInWidget) {
  Script.setWidget(widget)
} else if (config.runsInApp) {
  widget.present()
} else {
  throw new Error("Unsupported config: " + JSON.stringify(config))
}

Script.complete()
