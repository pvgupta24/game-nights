/* =====================================================================
   game-nights · DEMO board  —  the copy-me template
   =====================================================================
   MAKE YOUR OWN GAME IN 3 STEPS:
     1. Copy this whole folder:   events/demo  →  events/<your-slug>
     2. Edit meta.slug + the content below (questions, teams, media…).
     3. Add one line to ../../events.js so it shows on the gallery.
   Then open events/<your-slug>/index.html — no build step, no server
   required (works on file://, `python -m http.server`, and GitHub Pages).

   This file is the kitchen sink: EVERY config field is present, each with
   a comment and its default value, and every per-clue field is exercised.
   Delete what you don't need — only meta.slug, categories, and teams are
   required; everything else has a sensible default (shown in [brackets]).

   TEXT FORMATTING (works in q / a / clue / b / bA) — see the ✍️ category:
     «word»   <<word>>   *word*   → highlight a key term
     this / these / those / here  → auto-highlighted on the QUESTION side
     inline HTML: <em>italic</em>  <b>bold</b>  <br> line break
   ===================================================================== */
window.TRIVIA_CONFIG = {

  /* ---- meta: identity, branding, storage ---- */
  meta: {
    slug: "demo",                         // REQUIRED · unique · localStorage namespace + gallery link
    version: 1,                           // [1] bump to reset everyone's saved scores for this event
    mode: "jeopardy",                     // ["jeopardy"] the game type (more modes planned)
    pageTitle: "Game Nights · Demo Board",// [<title> <titleAccent>] browser tab text
    title: "GAME",                        // brand — plain part (header) / "GAME <b>NIGHTS</b>" (rules + winner)
    titleAccent: "NIGHTS",                // brand — bold/accent part
    logo: "assets/logo.svg",              // [dot] top-left brand mark — drop in your own logo (local path or URL); omit for a plain accent dot
    subtitle: "The copy-me template · edit config.js",  // [""] small line under the brand, top-left
    editionLine: "Demo Edition · the kitchen sink",     // [""] shown on the rules + winner cards
    date: "2026-01-01",                   // [""] free-form; also handy on the gallery
    avTestUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  // [rickroll] the "AV Test 🔊" button target
    // legacyStorageKey: "old-key-here",  // optional · one-time migrate scores from a previous storage key
  },

  /* ---- timers (seconds) · scoring · default palette ---- */
  timers: { direct: 45, steal: 15, marker: "clock" },  // [60/20/"clock"] clocks + timer marker ("clock" & "car" SVGs, or any emoji e.g. "🏁" — pickable in-game)
  scoring: { bonusValue: 100, stealPenaltyRatio: 0.5 },  // [100 / 0.5] bonus points; wrong-steal costs half
  theme: { default: "dusk" },             // ["noir"] noir | dusk | day — press Y to cycle live

  /* ---- the board · categories = columns, clues = rows (values low→high) ---- */
  categories: [

    /* ============ ✍️  a category that teaches the text conventions ============ */
    {
      cat: "✍️ Formatting", clues: [
        {
          v: 100,
          q: "Wrap a term in «guillemets» and it renders as a «highlight» on the board.",
          a: "«Guillemets» → highlight",
        },
        {
          v: 200,
          q: "No guillemets on your keyboard? <<double angle brackets>> highlight too.",
          a: "<<Angle brackets>> → highlight",
        },
        {
          v: 300,
          q: "Or just *wrap it in asterisks* — same highlight, easiest to type.",
          a: "*Asterisks* → highlight",
        },
        {
          v: 400,
          q: "Inline HTML works: <em>italics</em>, <b>bold</b>,<br>and even a line break.",
          a: "<em>em</em> · <b>b</b> · <br> all render",
        },
        {
          v: 500,
          q: "Jeopardy pointer words like this, these, those and here are highlighted automatically — but only on this question side.",
          a: "Pointer words auto-highlight (question side only)",
          note: "Notice the answer side leaves 'this/these' plain — auto-highlight is question-only.",
        },
      ]
    },

    /* ============ 🎬  media on the answer reveal ============ */
    {
      cat: "🎬 Media", clues: [
        {
          v: 100,
          q: "Add img:\"assets/…\" and a LOCAL image shows on the answer reveal.",
          a: "Local asset image",
          img: "assets/badge-star.svg",              // a file in this event's assets/ folder
        },
        {
          v: 200,
          q: "img can also be any REMOTE url — if it fails to load, the answer just shows text.",
          a: "Remote image URL (graceful fallback)",
          img: "https://picsum.photos/seed/gamenights/480/320",
        },
        {
          v: 300,
          q: "Add audio:\"clips/…\" for a music round — press ▶ or M to play the local clip.",
          a: "Local audio clip (clips/demo-tone.mp3)",
          audio: "clips/demo-tone.mp3",              // committed demo tone (offline-friendly)
        },
        {
          v: 400,
          q: "No local file? ytAudio streams a snippet from YouTube; yt embeds a video on the answer.",
          a: "YouTube snippet + answer embed",
          ytAudio: { id: "syFZfO_wfMQ", start: 0, duration: 7 },  // question-side snippet (auto-stops after `duration`s)
          yt: { id: "syFZfO_wfMQ", start: 40 },                    // answer-side video embed
        },
        {
          v: 500,
          q: "Point audio at a missing file and the clip control degrades gracefully — no crash.",
          a: "Missing clip → 'file missing' label",
          audio: "clips/does-not-exist.mp3",         // intentionally absent → shows a soft 'file missing' note
        },
      ]
    },

    /* ============ 🎁  host hints, notes, bonuses & the kitchen-sink clue ============ */
    {
      cat: "🎁 Extras", clues: [
        {
          v: 100,
          q: "clue:\"…\" is a host-only hint. Press C to reveal it if a team is stuck.",
          a: "Host-only hint (press C)",
          clue: "This only appears when the host presses C.",
        },
        {
          v: 200,
          q: "note:\"…\" prints a host-only italic note under the question (never a hint button).",
          a: "Host-only note",
          note: "Read this aloud, or don't — it's just for the host.",
        },
        {
          v: 300,
          q: "Add b + bA for a bonus. Bonuses are free to attempt — a wrong bonus never deducts.",
          a: "Bonus question",
          b: "Is a passed bonus ever penalised?",
          bA: "No — the bonus row is «positive-only».",
        },
        {
          // THE KITCHEN-SINK CLUE — every per-clue field at once, labelled.
          v: 400,
          q: "The kitchen-sink clue carries every field at once — this one has them all.",  // question (auto-keywords on)
          a: "One clue, all fields",                                                          // answer (required)
          clue: "Press C — the host-only hint.",                                              // host hint (C)
          note: "Host-only italic note.",                                                     // host note
          img: "assets/badge-diamond.svg",                                                    // answer image — but yt wins if present
          audio: "clips/demo-tone.mp3",                                                       // local clip (preferred over ytAudio)
          ytAudio: { id: "syFZfO_wfMQ", start: 0, duration: 7 },                              // YouTube snippet fallback
          yt: { id: "syFZfO_wfMQ", start: 40 },                                                // answer video (supersedes img)
          b: "With yt set, does the answer show the image or the video?",                     // bonus question (B)
          bA: "The video — yt supersedes img on the reveal.",                                 // bonus answer (N)
        },
        {
          v: 500,
          q: "To remove a bonus, just delete (or // comment out) its b and bA lines.",
          a: "No bonus here",
          // b: "This bonus is commented out, so no Bonus button appears.",
          // bA: "Right — the engine only shows a bonus when b is present.",
        },
      ]
    },

    /* ============ 🧩  the simplest possible clues: just v, q, a ============ */
    {
      cat: "🧩 Basics", clues: [
        { v: 100, q: "The minimum clue is just this: a value, a question, and an answer.", a: "v + q + a" },
        { v: 200, q: "How many players are on a soccer pitch per team?", a: "Eleven" },
        { v: 300, q: "This planet is the Red Planet.", a: "Mars" },
        { v: 400, q: "The chemical symbol Au stands for this metal.", a: "Gold" },
        { v: 500, q: "This ocean is the largest on Earth.", a: "The Pacific" },
      ]
    },

  ],

  /* ---- teams: a SINGLE roster shared by the board AND the printable cards ----
     Each team = { name, color, logo, tagline }. The board uses name/color/logo;
     the team-cards page adds the tagline. Press G in-game to switch presets.
     logo can be a LOCAL path ("assets/logo.png") or any REMOTE url — these demo
     teams use remote avatars (dicebear.com); missing/broken logos fall back to
     the team's initials. */
  teams: {
    default: "A",                         // [first preset] which preset loads first
    presets: [
      {
        key: "A", label: "Explorers",       // label = button text (board shows "Preset: Explorers")
        confirmLabel: "Explorers",          // [label] wording in the "replace teams?" confirm
        teams: [
          { name: "Team Comet", color: "#E23E57", logo: "https://api.dicebear.com/9.x/adventurer/svg?seed=Comet", tagline: "Blazing in, burning out." },
          { name: "Team Nova", color: "#3A86FF", logo: "https://api.dicebear.com/9.x/adventurer/svg?seed=Nova", tagline: "We go supernova on buzzers." },
          { name: "Team Vortex", color: "#2EC4B6", logo: "https://api.dicebear.com/9.x/adventurer/svg?seed=Vortex", tagline: "Everything gets pulled in." },
          { name: "Team Pulsar", color: "#F4A259", logo: "https://api.dicebear.com/9.x/adventurer/svg?seed=Pulsar", tagline: "Right answers, on the beat." },
          { name: "Team Echo", color: "#8367C7", logo: "https://api.dicebear.com/9.x/adventurer/svg?seed=Echo", tagline: "You'll hear us again." },
        ]
      },
      {
        key: "B", label: "Toon Squad",
        confirmLabel: "Toon Squad",
        teams: [
          { name: "Team Arcade", color: "#F72585", logo: "https://api.dicebear.com/9.x/micah/svg?seed=Arcade", tagline: "Insert coin to lose." },
          { name: "Team Synth", color: "#7209B7", logo: "https://api.dicebear.com/9.x/micah/svg?seed=Synth", tagline: "All the right notes." },
          { name: "Team Neon", color: "#06D6A0", logo: "https://api.dicebear.com/9.x/micah/svg?seed=Neon", tagline: "Bright answers only." },
          { name: "Team Cassette", color: "#FFD166", logo: "https://api.dicebear.com/9.x/micah/svg?seed=Cassette", tagline: "We rewind and win." },
          { name: "Team Vinyl", color: "#118AB2", logo: "https://api.dicebear.com/9.x/micah/svg?seed=Vinyl", tagline: "Smooth, deep, uncut." },
        ]
      },
    ],
  },

  /* ---- winner celebration songs (Teams ⚙ → Winner song; plays on 🏆) ---- */
  celebrations: {
    default: "party",                     // [first song] which song is selected by default
    songs: [
      { key: "party", label: "Happy", sub: "demo clip", yt: "ZbZSe6N_BXs", start: 30, emoji: "🎉" },
      { key: "victory", label: "Fly High", sub: "demo clip", yt: "7aNg8cV65Os", start: 43, emoji: "🪶" },
    ],
  },

  /* ---- rules card (shown on load; ? reopens) ----
     Omit answerNote / items entirely and the engine generates sensible
     defaults from your timers + scoring. Provided here so you can see the shape. */
  rules: {
    openOnLoad: true,                     // [true] show the rules splash when the board loads
    answerNote: {
      heading: "Answer in the form of a question",
      body: `It's Jeopardy! Phrase every answer as a question — <b>"What is…?"</b> or <b>"Who is…?"</b>`,
      example: `e.g. "The Red Planet" → "What is Mars?"`,
    },
    items: [
      { num: "1", text: `On your turn, pick a category and a value. <small>Higher value = harder.</small>` },
      { num: "2", text: `Answer within <b>45</b> seconds. A wrong direct answer costs nothing.` },
      { num: "3", text: `Miss it and it bounces to steal — a wrong first steal costs <b>half</b> the value.` },
      { num: "4", text: `Some clues carry a <b>bonus</b> — free to try, no penalty.` },
      { num: "★", text: `Have fun. Trash-talk encouraged.` },
    ],
  },

  /* ---- winner popup ---- */
  winner: { label: "🏆 Winner!" },        // ["🏆 Champions!!"] the big label on the celebration card
};
