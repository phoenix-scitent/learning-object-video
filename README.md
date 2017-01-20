### todo
- fix data timing issue for first contact
- add comprehensive universal video api and messages
- firebase driver hookup, tincan driver hookup
- dev dependencies vs dependencies
- get on npm
- vdom, sam pattern
- are takeUntils with <*>Events actually stopping garbage collecting? test this...
- single 'file' with imports of MOSTLY immutable streams... ?
- vidr extras
- fullscreen and standard HTML overlays
- branching

// [DONE] timeevents (cuepoint)
// overlays (timeevents + video overlay) -- use fullscreen api as well...
  // https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=video+overlay+javascript
  // https://www.google.com/search?q=fullscreen+api+javascript+library&oq=fullscreen+api+javascript+library&aqs=chrome..69i57j69i64.13141j0j4&sourceid=chrome&ie=UTF-8
// [DONE] timeline and stream

//TODO: only one video play at time... pauses other videos... what we always want?

// replace pattern:
// function(params){ return params[1] } -> R.nth(1)
// (single) => { oneLiner } -> single => onLiner

### target

#### npm

#### browser

`dist/scijas-video.js` -- export imperative api { config, embed }

### lifecycle

> `watcher` triggers `watcher::transformVideo` (pull, declarative)

> embed (push, imperative)

#### src/setup.js
- `watch` catches message
- registers persisted data listener via `<driver>` through `activity` where it gets decorated with context (actor, activity, section, etc...)
- setup polymorphic to video type based on...

#### <player>/setup.js
- pulls together `video` datatype which includes information about dom elements, identiifiers, stored data etc...
- sets up data listening
- merges options and defaults
- creates and initializes a player
- on player `load` will trigger `<player>/loaded.js`

#### <player>/loaded.js
- registers with universal event protocol
- sets up access api datatype
- sets up addons [stream/cues, overlays, branching logic]
- sets up responsive view logic [dynamic resize]
- registers teardown listener

### addons

#### stream/cues (timeline)

#### overlays

#### branching

