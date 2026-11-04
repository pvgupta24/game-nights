/* =====================================================================
   Diwali Trivia · October 20, 2025 · game config (quizdeck)
   =====================================================================
   The 2025 Diwali night was hosted from a slide deck, round by round, so
   this event uses the quizdeck engine (../../engine/quizdeck.js) instead
   of a single board:
     Round 1  Diwali                4 questions from the deck
     Round 2  Rapid Fire            the 8 picture puzzles, 15 seconds each
     Round 3  Bollywood & Songs     2 film questions + 4 song IDs
     Round 4  Vancouver             the round that was already a quiz board
     Round 5  Extra Time            spares from the planning doc (never hosted)

   Sources: the "Trivia @ Diwali 2025" deck (what was hosted) and the
   "Diwali Trivia 2025" planning doc (the Vancouver round, the spares).

   MEDIA: the deck's own pictures and clips are embedded in Google Slides,
   so these are stand-ins: the picture puzzles are redrawn (assets/rebus-*.svg),
   photos come from Wikimedia Commons (Special:FilePath redirects), and film,
   TV and song clips are YouTube embeds (famous scenes where one exists,
   songs started near the hook). None of the links could be opened from
   where this was written, so before the night:
     python tools/check-media.py --event 2025-10-20-diwali-trivia
   lists any video that is gone or won't embed, and any broken image. In the
   game a failing video says why, and [ ] nudges an answer video's start
   (Settings → "Copy video starts" turns your nudges into a ytStarts block).
   Song clips: local clips/*.mp3 win when present (python tools/yt-download.py
   --event 2025-10-20-diwali-trivia, or drop in the originals from the Drive
   "Assets/Diwali Trivia" folder under the names in songs.json).

   Team badges are shared with the 2026 board (../2026-11-diwali-trivia/assets).
   ===================================================================== */
const COMMONS = "https://commons.wikimedia.org/wiki/Special:FilePath/";
const BADGES = "../2026-11-diwali-trivia/assets/";
const photo = name => COMMONS + name + "?width=960";

window.TRIVIA_CONFIG = {
  meta: {
    slug: "2025-10-20-diwali-trivia",
    version: 3,
    mode: "quizdeck",
    pageTitle: "Diwali Trivia · October 2025",
    title: "DIWALI",
    titleAccent: "TRIVIA",
    logo: BADGES + "logo.svg",
    subtitle: "Diwali Special · 10.2025",
    editionLine: "Diwali Special · October 20, 2025",
    date: "2025-10-20",
    author: "Praveen Gupta",
  },

  timers: { question: 60, steal: 0, marker: "🪔" },
  scoring: { points: 100, stealPenaltyRatio: 0.5 },
  theme: { default: "diya" },

  rounds: [
    {
      title: "Diwali",
      blurb: "Legends, faiths and Diwali around the world.",
      points: 100,
      questions: [
        {
          q: "In South India, Diwali mainly celebrates the defeat of demon king X by Lord Y, which freed 16,000 people held captive. Identify X and Y.",
          a: "X: «Narakasura» · Y: Lord «Krishna»",
          img: photo("Krishna_Cleaves_the_Demon_Narakasura_with_his_Discus.jpg"),
        },
        {
          q: "For Sikhs, Diwali coincides with a historical event involving Guru Hargobind Ji. What is the event, and what is it celebrated as?",
          a: "The release of the sixth Sikh Guru, Guru Hargobind, and 52 Hindu princes from prison in 1619, celebrated as «Bandi Chhor Divas»",
          img: photo("Bandi_Chor_Divas.jpg"),
        },
        {
          q: "Which 3 US states officially recognize Diwali as a holiday?",
          a: "«California» · «Connecticut» · «Pennsylvania»",
          note: "As hosted in October 2025.",
          img: [photo("Flag_of_California.svg"), photo("Flag_of_Connecticut.svg"), photo("Flag_of_Pennsylvania.svg")],
        },
        {
          q: "Diwali marks the day Rama, Sita and Lakshmana return to Ayodhya after 14 years in exile. How many days did it take them to walk from Sri Lanka to Ayodhya?",
          a: "«21 days»",
          clue: "Count the days from Dussehra to Diwali.",
          note: "The popular explanation: a walking route from Sri Lanka to Ayodhya takes about 21 days, the same as the gap between Dussehra and Diwali. In Valmiki's Ramayana they actually fly home in the Pushpaka Vimana.",
          img: photo("Rama_and_Sita,_with_Lakshmana_returning_to_Ayodhya.jpg"),
        },
      ]
    },
    {
      title: "Rapid Fire",
      kind: "rapid",
      blurb: "Eight picture puzzles. Say the phrase each picture shows.",
      points: 50, timer: 15,
      questions: [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
        q: "What phrase is this?",
        qImg: `assets/rebus-${n}.svg`,
        a: ["«Think outside the box»", "«Read between the lines»", "«Top secret»", "«Once upon a time»",
          "«Downtown»", "«Try to understand»", "«Two peas in a pod»", "«Once in a blue moon»"][n - 1],
        clue: n === 6 ? "Where is TRY TO sitting?" : undefined,
      })),
    },
    {
      title: "Bollywood & Songs",
      blurb: "Two film questions, then name that tune: song and artist for full marks, one of them for half.",
      points: 100,
      questions: [
        {
          q: "The Hindi film X is a remake of the 1989 Malayalam film <em>Ramji Rao Speaking</em>, about a popular trio. Who was originally cast as one of the trio but dropped out because of court hearings?",
          a: "<em>«Hera Pheri»</em>: «Sanjay Dutt», as Shyam",
          yt: { id: "obPAvceI8FM", start: 0 },   // "Utha le re baba", Baburao's famous scene
        },
        {
          q: "\"12th Fail\" was a popular 2023 Hindi movie based on the real-life story of IPS officer Manoj Kumar Sharma. What was the a) occupation and b) name of Manoj's wife?",
          a: "a) «IRS officer» · b) «Shraddha Joshi»",
          note: "Both right: full marks. One right: half (Alt).",
          yt: { id: "EK0PkJZAiSc", start: 30 },   // "Restart", the film's anthem
        },
        {
          q: "Identify the song and the artist.", a: "«Khairiyat» by «Arijit Singh» (<em>Chhichhore</em>, 2019)",
          audio: "clips/khairiyat.mp3",
          ytAudio: { id: "hoNb6HuNmU0", start: 15, duration: 12 },   // 0:15, where the Drive clip started
          yt: { id: "hoNb6HuNmU0", start: 15 },
        },
        {
          q: "Identify the song and the artist.", a: "«Kya Khoob Lagti Ho» by «Mukesh» (with Kanchan), <em>Dharmatma</em> (1975)",
          audio: "clips/kya-khoob-lagti-ho.mp3",
          ytAudio: { id: "A_vcoAPoprg", start: 0, duration: 12 },
          yt: { id: "A_vcoAPoprg", start: 12 },
        },
        {
          q: "Identify the song and the artist.", a: "«Lamha Lamha» (<em>Gangster</em>, 2006): music by «Pritam», sung by «Abhijeet» and «Sunidhi Chauhan»",
          audio: "clips/lamha-lamha.mp3",
          ytAudio: { id: "CApsy8SR3k0", start: 20, duration: 12 },
          yt: { id: "CApsy8SR3k0", start: 20 },
        },
        {
          q: "Identify the song and the artist.", a: "«Pretty Woman» by «Shankar Mahadevan» (<em>Kal Ho Naa Ho</em>, 2003)",
          audio: "clips/pretty-woman.mp3",
          ytAudio: { id: "70QpN7DvaK4", start: 0, duration: 12 },
          yt: { id: "70QpN7DvaK4", start: 15 },
        },
      ]
    },
    {
      // "PG Vancouver Jeopardy" in the deck: it was already a board, so it stays one
      title: "Vancouver",
      kind: "board",
      blurb: "Pick a category and a value. A wrong steal costs half.",
      timer: 60, steal: 20,
      categories: [
        {
          cat: "🚦 Intersections", clues: [
            { v: 200, q: "Name the intersection: Pacific Centre, the Hudson's Bay building, London Drugs and Vancouver City Centre Station.", a: "«Granville» & «Georgia»", img: photo("Former_Hudson%27s_Bay_Company_department_store_674_Granville_Street_Vancouver_BC_V6C_3J3_Canada.jpg") },
            { v: 400, q: "Name the intersection: Best Buy, Old Navy, Pacific Centre and the Ox Pub.", a: "«Granville» & «Robson»" },
            { v: 600, q: "Name the intersection: Lululemon, L'Occitane en Provence, Roots and the former Victoria's Secret store.", a: "«Robson» & «Burrard»", img: photo("Vancouver_-_Robson_street_sign.jpg") },
            { v: 800, q: "Name the intersection: Bentall One, the Pod (Scotiabank), the Douglas Jung Building and Commerce Place.", a: "«Burrard» & «Pender»", img: photo("3_Bentall_Centre_(Vancouver_2010).jpg") },
            { v: 1000, q: "Name the intersection: Safeway, Chungchun, Starbucks and Holy Guacamole Mexican Restaurant.", a: "«Robson» & «Denman»" },
          ]
        },
        {
          cat: "🚌 Transit", clues: [
            { v: 200, q: "Which bus route runs from Joyce-Collingwood Station to UBC?", a: "The «R4»", img: photo("Translink_B18006_R4.jpg") },
            { v: 400, q: "Which bus route runs from VCC-Clark Station to UBC?", a: "The «84»" },
            { v: 600, q: "Which bus route runs from Powell to UBC?", a: "The «4»" },
            { v: 800, q: "Which bus route runs from Metrotown to SFU Exchange?", a: "The «144»" },
            { v: 1000, q: "Which bus route runs from Kootenay Loop to Port Coquitlam Station?", a: "The «160»" },
          ]
        },
        {
          cat: "🏒 Sports", clues: [
            { v: 200, q: "How many top-tier professional sports teams play in Vancouver?", a: "«3»: the Canucks, the Whitecaps and the Warriors", note: "Debatable: the BC Lions (CFL) also play at BC Place.", img: photo("BC_Place_(Vancouver).jpg") },
            { v: 400, q: "Rogers Arena sits on this street.", a: "«Griffiths Way»", img: photo("Rogers_Arena_(Vancouver).jpg") },
            { v: 600, q: "How many times have the Canucks reached the Stanley Cup Final?", a: "«3» (1982, 1994 and 2011)" },
            { v: 800, q: "Give the full name of the Vancouver Canadians' home stadium and field.", a: "«Scotiabank Field at Nat Bailey Stadium»", img: photo("Natbailey.jpg") },
            { v: 1000, q: "Where did the Whitecaps play their first MLS home game?", a: "«Empire Field», right beside Playland", img: photo("Empire_Field_with_Whitecaps_fans.jpg") },
          ]
        },
        {
          cat: "🎬 Filmed Here", clues: [
            { v: 200, q: "Filmed in Vancouver: an invincible, burnt man seeks his revenge on a twisted experimenter.", a: "«Deadpool»", yt: { id: "Sy8nPI85Ih4", start: 0 } },   // the "Maximum Effort" highway fight, shot on the Georgia Viaduct
            { v: 400, q: "Filmed in Vancouver: a crocodile, a coach and a Sandler collide in this comedy.", a: "«Happy Gilmore»", yt: { id: "idrFvuj7__w", start: 0 } },   // the Bob Barker fight
            { v: 600, q: "Filmed in Vancouver: the strongest man alive comes to Earth in this DC film.", a: "«Man of Steel»", yt: { id: "4KoMJ0gC4Vc", start: 0 } },   // first flight
            { v: 800, q: "Filmed in Vancouver: Dwayne Johnson stars in this high-flying action movie.", a: "«Skyscraper»", yt: { id: "KMkdp0Uy8t0", start: 0 } },   // the crane jump
            { v: 1000, q: "Filmed in Vancouver: Ethan Hunt and his colleagues go rogue in this action film, the fourth in its series.", a: "«Mission: Impossible, Ghost Protocol»", yt: { id: "vw93e76Vkgo", start: 0, alts: [{ id: "3isre2fpZog" }, { id: "gqocrvv26eo" }, { id: "8g8ssPKaSkk" }] } },   // the Burj Khalifa climb, with backup uploads
          ]
        },
        {
          cat: "📺 TV Filmed Here", clues: [
            { v: 200, q: "John Cena stars as a peace-obsessed antihero in this HBO Max series, which filmed its action-packed scenes in Vancouver, including fights in abandoned warehouses.", a: "«Peacemaker»", yt: { id: "Fl3JJPVVH4Y", start: 0 } },   // the opening-credits dance
            { v: 400, q: "Grant Gustin sped through Vancouver's streets as Barry Allen in this CW series about a forensic scientist who gains super speed after a particle accelerator explosion.", a: "«The Flash»", yt: { id: "WLuO21gwdQI", start: 0 } },   // "my name is Barry Allen…"
            { v: 600, q: "Tom Ellis played the charming devil who leaves Hell for Los Angeles in this series, which was shot in Vancouver, using local soundstages for the nightclub scenes.", a: "«Lucifer»", yt: { id: "sOYaLWVF-54", start: 0 } },   // "what do you desire?"
            { v: 800, q: "Fairy tale characters like Snow White and Rumplestiltskin live in the modern world in this ABC show, with Vancouver's Steveston village doubling as Storybrooke.", a: "«Once Upon a Time»", yt: { id: "3cP5LGVzXWA", start: 0 } },   // the clock starts ticking in Storybrooke
            { v: 1000, q: "Walker Scobell stars as a young demigod in this Disney+ adaptation of Rick Riordan's books, whose third season was filming in Vancouver's studios and forests in October 2025.", a: "«Percy Jackson and the Olympians»", yt: { id: "9-V2JRBeSDg", start: 0 } },   // trailer
          ]
        },
      ]
    },
    {
      title: "Extra Time",
      blurb: "Spares from the planning doc that didn't make the 2025 deck. Play them for a tie-breaker, or skip to the standings.",
      points: 100,
      questions: [
        {
          q: "In which Southeast Asian country with a large Indian diaspora is Diwali a public holiday, celebrated with open houses, cultural shows and local touches like dragon dances?",
          a: "«Malaysia»",
          note: "Others with a Diwali public holiday: Fiji, Guyana, Mauritius, Myanmar, Nepal, Pakistan, Singapore, Sri Lanka, Suriname, Trinidad and Tobago.",
        },
        {
          // the doc listed only "Bahubali ne Katappa ko kyu maara", read here as a fix-the-quote question
          q: "Fix this famous line: \"Baahubali ne Kattappa ko kyun maara?\"",
          a: "\"«Kattappa» ne «Baahubali» ko kyun maara?\" (Why did Kattappa kill Baahubali?)",
          yt: { id: "25GC3g6EOL0", start: 0, alts: [{ id: "Go42qkt5m5A" }, { id: "phEsT7FecDE" }, { id: "8uw0vW_eolo" }] },   // the moment Kattappa strikes; last backup is the trailer
        },
        {
          q: "X is a fictional film about the 1999 Kargil War, directed by Farhan Akhtar. Near the end, the battalion is sent to capture Y Hill, also called Point Z. Name X, Y and Z.",
          a: "«Lakshya» · «Tiger» Hill · Point «5179»",
          yt: { id: "8DMF0U6xV78", start: 50 },   // Lakshya title track, near the hook
        },
      ]
    },
  ],

  /* ---- BENCH: more from the planning doc, never hosted.
     Transit: Park Royal to Phibbs Exchange → R2 · Phibbs Exchange to Metrotown (Willingdon Express) → 222 ·
              Scott Road to Newton Exchange → R6 · Dunbar to Nanaimo Station → 7 · 22nd Street Station to Marpole Loop → 100
     Filmed here: The Last of Us (no clue written yet)
     Songs the doc listed but the deck didn't use: Dil Hai Ki Maanta Nahin · Kiliye Kiliye ·
     Didi Tera Devar Deewana · Jab Koi Baat Bigad Jaaye · Navrai Majhi.
     The doc also linked a ready-made "guess the old song in 5 seconds" round:
     https://www.youtube.com/watch?v=pbNqG2mcMvg
     Crossed out in the doc: Chopda Pujan (Gujarati ledger worship) and Leicester's Golden Mile.
  */

  teams: {
    default: "B",
    presets: [
      {
        key: "A", label: "Patakha Party", confirmLabel: "Patakha Party (firecrackers)",
        teams: [
          { name: "Anar Anarchists", color: "#E11D48", logo: BADGES + "team-anar.svg", tagline: "Calm outside. A fountain of answers inside." },
          { name: "Chakri Chaos", color: "#16A34A", logo: BADGES + "team-chakri.svg", tagline: "We spin. You lose." },
          { name: "Phuljhadi Phenoms", color: "#4338CA", logo: BADGES + "team-phuljhadi.svg", tagline: "Short fuse. Bright answers." },
          { name: "Sutli Bombers", color: "#0D9488", logo: BADGES + "team-sutli.svg", tagline: "Loud. Proud. Slightly illegal." },
          { name: "Rocket Rajas", color: "#7C3AED", logo: BADGES + "team-rocket.svg", tagline: "Launched from a glass bottle. Aimed at first place." },
        ]
      },
      {
        key: "B", label: "Mithai Mafia", confirmLabel: "Mithai Mafia (sweets)",
        teams: [
          { name: "Kaju Katli Cartel", color: "#0F766E", logo: BADGES + "team-kaju.svg", tagline: "Diamond-cut. Diamond-hard." },
          { name: "Gulab Jamun Gang", color: "#CA8A04", logo: BADGES + "team-gulab.svg", tagline: "Soaked in syrup and confidence." },
          { name: "Jalebi Junta", color: "#1D4ED8", logo: BADGES + "team-jalebi.svg", tagline: "Twisted logic. Sweet results." },
          { name: "Ladoo Legion", color: "#DB2777", logo: BADGES + "team-ladoo.svg", tagline: "Round, rolling, unstoppable." },
          { name: "Soan Papdi Syndicate", color: "#7C3AED", logo: BADGES + "team-soan.svg", tagline: "Passed around. Never defeated." },
        ]
      },
    ],
  },

  celebrations: {
    default: "jaiho",
    songs: [
      { key: "jaiho", label: "Jai Ho", sub: "A.R. Rahman · 'let there be victory'", yt: "ai_2a6hR7Bo", start: 0, emoji: "🏆" },
      { key: "gallan", label: "Gallan Goodiyaan", sub: "Dil Dhadakne Do", yt: "jCEdTq3j-0U", start: 25, emoji: "💃" },
    ],
  },

  rules: {
    openOnLoad: true,
    answerNote: {
      heading: "Five rounds, one scoreboard",
      body: `Diwali · Rapid Fire · Bollywood & Songs · a Vancouver quiz board · and Extra Time if we need a tie-breaker.`,
      example: `Half an answer right? Half marks. Song and artist both? Full marks 🎶`,
    },
    items: [
      { num: "1", text: `Questions go to each team in turn. <b>60</b> seconds to answer; rapid fire gets <b>15</b>.` },
      { num: "2", text: `Miss it and it passes to the next team.` },
      { num: "3", text: `The Vancouver round is a quiz board: pick a category and a value. A wrong steal there costs <b>half</b> the points.` },
      { num: "★", text: `Trash-talk? Allowed. Bribing the host with mithai? <b>Strongly encouraged.</b>` },
    ],
  },

  winner: { label: "🪔 Champions!!" },
};
