/* =====================================================================
   RVT Trivia · June 2026 · World Cup Edition  —  game config
   =====================================================================
   Public config for the game-nights jeopardy engine. Rendered by
   ../../engine/jeopardy.js. This is the PUBLIC board (4 categories); the
   host's private 5th category (Rivian/VWG) lives in the gitignored
   config.local.js overlay, which the engine loads after this file.

   Text conventions in q/a/clue/b/bA (see README for the full reference):
     «word» · <<word>> · *word*   → highlighted key term
     this / these / those / here  → auto-highlighted on the QUESTION side
     inline HTML (<em>, <b>, <br>) works too.
   To start your own game, copy events/demo/ (the commented template).
   ===================================================================== */
window.TRIVIA_CONFIG = {
  meta: {
    slug: "2026-06-15-rvt-trivia",
    version: 1,
    mode: "jeopardy",
    pageTitle: "RVT Trivia · June 2026 · World Cup Edition",
    title: "RVT",
    titleAccent: "TRIVIA",
    subtitle: "World Cup Edition · 06.2026",
    editionLine: "World Cup Edition · June 2026",
    date: "2026-06-15",
    legacyStorageKey: "rvt-trivia-2026-06-v3",   // one-time migration of saved scores
  },

  timers: { direct: 60, steal: 20, marker: "car" },   // the car suits an RVT/vehicles night
  scoring: { bonusValue: 100, stealPenaltyRatio: 0.5 },
  theme: { default: "noir" },

  categories: [
    {
      cat: "⚽ Football", clues: [
        {
          v: 100, q: "This Bayern Munich winger — who got his start with the Vancouver Whitecaps — scored Canada's first goal at a men's World Cup, in 2022.", a: "Alphonso Davies",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Alphonso_Davies_in_2022.jpg/960px-Alphonso_Davies_in_2022.jpg",
          // b: "He was born in a refugee camp in which country?", bA: "Ghana"
        },
        {
          v: 200, q: "In one of the biggest upsets in sports history, this club won the 2016 Premier League title as a 5,000-to-1 outsider.", a: "Leicester City",
          clue: "English; «The Foxes»; managed then by Claudio Ranieri.",
          b: "Which key player for them scored in 11 consecutive games?", bA: "Jamie Vardy"
        },
        {
          v: 300, q: "At the 1986 World Cup in Mexico, Diego Maradona scored what FIFA later voted the «Goal of the Century» — a 60-yard solo run that knocked this country out in the quarterfinal.", a: "England",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Maradona_vs_england.jpg/960px-Maradona_vs_england.jpg",
          b: "Four minutes earlier in that same match, he scored a far more controversial goal — by what name is it known?", bA: "The «Hand of God»"
        },
        {
          v: 400, q: "The 2026 World Cup has three official mascots — one animal for each host nation. Which animals.", a: "Moose (Canada) · Jaguar (Mexico) · Bald eagle (USA)",
          img: "https://platform.starsandstripesfc.com/wp-content/uploads/sites/151/2025/09/DGM_048_Mascot-PNG-Crops-and-Website-Pop-Up-Graphics-v2-with-Logo-2_Group-3-1200x900-1.png?quality=90&strip=all",
          b: "What are their names? (100 each)", bA: "Maple (moose) · Zayu (jaguar) · Clutch (eagle)"
        },
        {
          v: 500, q: "With 16 goals across four tournaments, this striker is the all-time leading scorer in men's World Cup history.", a: "Miroslav Klose (16 goals over 4 world cups)",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2016209185719_2016-07-27_Champions_for_Charity_-_Sven_-_1D_X_-_0149_-_DV3P4742_mod.jpg/960px-2016209185719_2016-07-27_Champions_for_Charity_-_Sven_-_1D_X_-_0149_-_DV3P4742_mod.jpg",
          clue: "German; played 2002–2014",
          b: "He broke the 15-goal record of which player?", bA: "Ronaldo «R9» Nazário"
        },
      ]
    },
    {
      cat: "🍁 Canada", clues: [
        {
          v: 100, q: "Address a letter to Santa from anywhere in Canada — his name plus this postal code is all you need, and Canada Post writes back.", a: "H0H 0H0  ·  (it spells «ho-ho-ho»)",
          img: "https://www.canadapost-postescanada.ca/cpc/assets/cpc/uploads/corporate_news/news_releases/2016/2016_WritetoSanta_Facebook_en.jpg"
        },
        {
          v: 200, q: "Before his name ended up on a popular chain across Canada, this man won four Stanley Cups as a hard-nosed Maple Leafs defenceman.", a: "Tim Horton",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Tim_Hortons%2C_Kingsville%2C_Ontario%2C_2025-06-29.jpg/960px-Tim_Hortons%2C_Kingsville%2C_Ontario%2C_2025-06-29.jpg",
          b: "Who was the other co-founder for this chain?", bA: "Ron Joyce"
        },
        {
          v: 300, q: "North of Mexico, it's the only city in North America still wrapped in its original fortified stone walls.", a: "Quebec City",
          clue: "«La Vieille Capitale» — its old town is a UNESCO site.",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Quebec_City%2C_Canada.jpg/960px-Quebec_City%2C_Canada.jpg"
        },
        {
          v: 400, q: "Polar bears can outnumber people some seasons in this remote town on Hudson Bay — also known as the «Polar Bear Capital of the World».", a: "Churchill, Manitoba",
          clue: "Tundra buggies; far north Manitoba.",
          img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg/960px-Polar_Bear_-_Alaska_%28cropped%29.jpg"
        },
        {
          v: 500, q: "When Ontario born James Naismith invented basketball in 1891, the first hoops were a pair of these, nailed to the gym balcony.", a: "Peach baskets",
          img: "https://springfield.edu/sites/default/files/styles/feature_smaller/public/2017-02/Early_outdoor_basketball_game.jpg?h=78f3ca2a&itok=_ZkZfxBj"
        }
      ]
    },
    {
      cat: "🎵 Music", clues: [
        // Music clues prefer the local clips/*.mp3 at a live event; the public deploy
        // (mp3s gitignored) falls back to the ytAudio YouTube snippet automatically.
        {
          v: 100, q: "Name the song and artist.", a: "Seven Nation Army — The White Stripes", audio: "clips/M2.mp3",
          ytAudio: { id: "0J2QdDbelmY", start: 0, duration: 11 },
          yt: { id: "0J2QdDbelmY", start: 18 },
          // b: "Italian fans took this riff global when they won the world cup in year ____?", bA: "The 2006 World Cup"
        },
        {
          v: 200, q: "Name the song and artist of this chant.", a: "Wanna Be Startin' Somethin' — Michael Jackson", audio: "clips/M1.mp3",
          clue: "1983. Album: Thriller. The chant arrives at the very end.",
          ytAudio: { id: "1XMvPTFzgVU", start: 288, duration: 12 },
          yt: { id: "1XMvPTFzgVU", start: 25 },
          b: "Which 2007 smash hit from an upcoming pop artist sampled it?", bA: "«Don't Stop the Music» — Rihanna ·<br> MJ borrowed from the 1972 Cameroonian classic «Soul Makossa» — Manu Dibango"
        },
        {
          v: 300, q: "Name the song and artist.", a: "Eye of the Tiger — Survivor", audio: "clips/M10.mp3",
          clue: "It scores a training montage in a 1982 boxing sequel.",
          ytAudio: { id: "btPJPFnesV4", start: 0, duration: 9 },
          yt: { id: "btPJPFnesV4", start: 84 },
          b: "It was written for Rocky III after Stallone couldn't license <<this>> Queen song?", bA: "«Another One Bites the Dust»"
        },
        {
          v: 400, q: "Name the song and artist.", a: "Freed From Desire — Gala",
          clue: "(A '90s Eurodance hit turned «na-na-na» terrace chant.)",
          // b:"Which world cup-winning French striker had his name chanted to this tune in the 1998 World Cup?", bA: "Zinedine Zidane",
          audio: "clips/freed.mp3",
          ytAudio: { id: "p3l7fgvrEKM", start: 59, duration: 12 },
          yt: { id: "p3l7fgvrEKM", start: 54 }
        },
        {
          v: 500, q: "Name the song and artist.", a: "Kids — MGMT", audio: "clips/kids.mp3",
          ytAudio: { id: "fe4EK4HSPkI", start: 70, duration: 15 },
          yt: { id: "fe4EK4HSPkI", start: 117 },
          b: "Which edition of FIFA first put this song on its soundtrack?", bA: "FIFA 09 (and again in FIFA 23)"
        },
      ]
    },
    {
      cat: "🍿 Entertainment", clues: [
        {
          v: 100, q: "This R-rated 2016 Marvel hit shut down Vancouver's Georgia Viaduct to film its opening freeway-shootout.", a: "Deadpool",
          img: "https://upload.wikimedia.org/wikipedia/en/2/23/Deadpool_%282016_poster%29.png",
          // b: "Which Vancouver high school did its Vancouver-born star, Ryan Reynolds, attend?", bA: "Kitsilano Secondary"
        },
        {
          v: 200, q: "Ladysmith, BC stood in for the town of «Green Hills» in this 2020 movie based on a Sega video-game icon.", a: "Sonic the Hedgehog",
          b: "Who hammed it up as the villain, Dr. Robotnik?", bA: "Jim Carrey",
          img: "https://tourismladysmith.ca/wp-content/uploads/2020/02/Jim-Carrey-Sonic.jpg"
        },
        {
          v: 300, q: "In 2020 this made-in-Canada comedy swept all four main acting-category Emmys in a single night — a first for any comedy/drama series.", a: "Schitt's Creek",
          img: "https://chscommunicator.com/wp-content/uploads/2022/03/Screen-Shot-2022-04-01-at-9.56.47-AM-e1648821500577.png"
        },
        {
          v: 400, q: "In <em>Ted Lasso</em>, journalist Trent Crimm writes a book about the team — first titled \"The Lasso Way.\" He <<renames it>> after Ted tells him, \"It's not about me. It never was.\" What's the new title?", a: "The Richmond Way",
          img: "https://preview.redd.it/the-richmond-way-book-v0-8ao9chb9trzb1.jpg?width=640&crop=smart&auto=webp&s=fdcc19c8c415c05715e4032dd30c0ab724f10359"
        },
        {
          v: 500, q: "In Disney's <em>Zootopia</em>, Shakira voices this glamorous pop-star character.", a: "Gazelle",
          b: "What's Shakira's hit anthem from the first Zootopia?", bA: "«Try Everything»",
          img: "https://variety.com/wp-content/uploads/2024/11/MixCollage-08-Nov-2024-03-35-PM-9270.jpg?w=1000&h=667&crop=1"
        },
      ]
    },
  ],

  teams: {
    default: "A",
    presets: [
      {
        key: "A", label: "Garage", confirmLabel: "Iconic Garage",
        teams: [
          { name: "Team R1T", color: "#F5C518", logo: "assets/r1t.png", tagline: "Four motors. Zero mercy." },
          { name: "Team R2", color: "#2F6B4F", logo: "assets/r2.png", tagline: "Rookie of the year. Deal with it." },
          { name: "Team Beetle", color: "#6FB7E8", logo: "assets/beetle.png", tagline: "Don't let the cute fool you." },
          { name: "Team Microbus", color: "#E8762C", logo: "assets/microbus.png", tagline: "Slow van. Sharp minds." },
          { name: "Team Boxster", color: "#C9CDD3", logo: "assets/boxster.png", tagline: "Quick corners, quicker buzzers." },
          { name: "Team Quattro", color: "#BB0A30", logo: "assets/quattro.png", tagline: "Grip the buzzer. Win the rally." },
        ]
      },
      {
        key: "B", label: "Gear Guard", confirmLabel: "Gear Guard Squad",
        teams: [
          { name: "Striker Gear Guard", color: "#2E8B57", logo: "assets/gg-striker.png", tagline: "Here to score. Obviously." },
          { name: "Mountie Gear Guard", color: "#C8102E", logo: "assets/gg-mountie.png", tagline: "We'll take those points. Sorry." },
          { name: "DJ Gear Guard", color: "#7B4FBF", logo: "assets/gg-dj.png", tagline: "We drop beats and answers." },
          { name: "Director Gear Guard", color: "#D4A017", logo: "assets/gg-director.png", tagline: "Quiet — geniuses working." },
          { name: "Wrench Gear Guard", color: "#F5C518", logo: "assets/gg-wrench.png", tagline: "We debug in prod and in trivia." },
          { name: "Mission Control Gear Guard", color: "#1FA8A0", logo: "assets/gg-mission.png", tagline: "We have the answers, Houston." },
        ]
      },
    ],
  },

  celebrations: {
    default: "daidai",
    songs: [
      { key: "daidai", label: "Dai Dai · 2026", sub: "Shakira & Burna Boy", yt: "fcnDmrtj6Sk", start: 155, emoji: "🎉" },
      { key: "waka", label: "Waka Waka · 2010", sub: "Shakira", yt: "pRpeEdMmmQ0", start: 48, emoji: "⚽" },
    ],
  },

  rules: {
    openOnLoad: true,
    answerNote: {
      heading: "Answer in the form of a question",
      body: `It's Jeopardy! Phrase every answer as a question — <b>"What is…?"</b> or <b>"Who is…?"</b>`,
      example: `e.g. "The GOAT of football" → "Who is Messi?" 🐐`,
    },
    items: [
      { num: "1", text: `Teams on their turn pick a question (a category and a points value). <small>Higher value = tougher question.</small>` },
      { num: "2", text: `Direct question: Answer in <b>60</b> seconds. No penalty for getting it wrong.` },
      { num: "3", text: `Questions bounces to teams in order to steal. </b>But a wrong steal <b>costs</b> that team <b>half</b> the points of the question. <small>First steal has penalty; none after that.</small>` },
      { num: "4", text: `Random questions can have bonus questions <b> no penalty to guess</b>.</small>` },
      { num: "★", text: `Trash-talk? <b>Totally allowed.</b>` },
    ],
  },

  winner: { label: "🏆 Champions!!" },
};
