/* =====================================================================
   Diwali Trivia · October 20, 2025 (rounds 1 to 3) · game config
   =====================================================================
   The 2025 Diwali night was hosted from a slide deck in rounds, not as one
   board. This rebuilds rounds 1 to 3 as a quizboard:
     R1 Diwali          → 🪔 Diwali              (all 4 questions from the deck)
     R2 Rapid fire      → 🧩 Rapid Fire 1 and 2   (the 8 picture puzzles)
     R3 Bollywood/songs → 🎬 Bollywood + 🎶 Songs (2 questions + 4 song IDs)
   Round 4, the Vancouver round, is its own board:
   ../2025-10-20-diwali-trivia-vancouver/.

   Sources: the "Trivia @ Diwali 2025" deck (what was hosted) and the
   "Diwali Trivia 2025" planning doc. Clues marked "planning doc" were in the
   doc but not in the deck; the rest of the doc's unused ideas are on the
   BENCH below.

   The picture puzzles are redrawn from their answers (assets/rebus-*.svg),
   because the originals are images embedded in the deck. They sit in the
   QUESTION text as an <img>, since a clue's img field only shows on the
   answer side.

   Team badges are shared with the 2026 board (../2026-11-diwali-trivia/assets).
   ===================================================================== */
const PUZZLE = n => `What phrase is this?<br><img src="assets/rebus-${n}.svg" alt="Picture puzzle ${n}" style="display:block;margin-top:.5em;width:min(100%,560px);height:auto;border-radius:14px">`;
const BADGES = "../2026-11-diwali-trivia/assets/";

window.TRIVIA_CONFIG = {
  meta: {
    slug: "2025-10-20-diwali-trivia",
    version: 1,
    mode: "quizboard",
    pageTitle: "Diwali Trivia · October 2025",
    title: "DIWALI",
    titleAccent: "TRIVIA",
    logo: BADGES + "logo.svg",
    subtitle: "Diwali Special · 10.2025",
    editionLine: "Diwali Special · October 20, 2025",
    date: "2025-10-20",
    author: "Praveen Gupta",
  },

  timers: { direct: 60, steal: 20, marker: "🪔" },
  scoring: { bonusValue: 100, stealPenaltyRatio: 0.5 },
  theme: { default: "diya" },

  categories: [
    {
      cat: "🪔 Diwali", clues: [
        {
          v: 100, q: "In South India, Diwali mainly celebrates the defeat of demon king X by Lord Y, which freed 16,000 people held captive. Identify X and Y.", a: "X: «Narakasura» · Y: Lord «Krishna»",
        },
        {
          v: 200, q: "For Sikhs, Diwali coincides with a historical event involving Guru Hargobind Ji. What is the event, and what is it celebrated as?", a: "The release of the sixth Sikh Guru, Guru Hargobind, and 52 Hindu princes from prison in 1619, celebrated as «Bandi Chhor Divas»",
        },
        {
          v: 300, q: "Which 3 US states officially recognize Diwali as a holiday?", a: "«California» · «Connecticut» · «Pennsylvania»",
          note: "As hosted in October 2025.",
        },
        {
          v: 400, q: "Diwali marks the day Rama, Sita and Lakshmana return to Ayodhya after 14 years in exile. How many days did it take them to walk from Sri Lanka to Ayodhya?", a: "«21 days»",
          clue: "Count the days from Dussehra to Diwali.",
        },
      ]
    },
    {
      cat: "🧩 Rapid Fire", clues: [
        { v: 100, q: PUZZLE(1), a: "«Think outside the box»" },
        { v: 200, q: PUZZLE(2), a: "«Read between the lines»" },
        { v: 300, q: PUZZLE(3), a: "«Top secret»" },
        { v: 400, q: PUZZLE(4), a: "«Once upon a time»" },
      ]
    },
    {
      cat: "🧩 Rapid Fire 2", clues: [
        { v: 100, q: PUZZLE(5), a: "«Downtown»" },
        { v: 200, q: PUZZLE(6), a: "«Try to understand»", clue: "Where is TRY TO sitting?" },
        { v: 300, q: PUZZLE(7), a: "«Two peas in a pod»" },
        { v: 400, q: PUZZLE(8), a: "«Once in a blue moon»" },
      ]
    },
    {
      cat: "🎬 Bollywood", clues: [
        {
          // planning doc: listed as "Bahubali ne Katappa ko kyu maara", read here as a fix-the-quote clue
          v: 100, q: "Fix this famous line: \"Baahubali ne Kattappa ko kyun maara?\"", a: "\"«Kattappa» ne «Baahubali» ko kyun maara?\" (Why did Kattappa kill Baahubali?)",
          note: "From the planning doc, not the deck.",
        },
        {
          v: 200, q: "\"12th Fail\" was a popular 2023 Hindi movie based on the real-life story of IPS officer Manoj Kumar Sharma. What was the a) occupation and b) name of Manoj's wife?", a: "a) «IRS officer» · b) «Shraddha Joshi»",
        },
        {
          v: 300, q: "The Hindi film X is a remake of the 1989 Malayalam film <em>Ramji Rao Speaking</em>, about a popular trio. Who was originally cast as one of the trio but dropped out because of court hearings?", a: "<em>«Hera Pheri»</em>: «Sanjay Dutt», as Shyam",
        },
        {
          // planning doc
          v: 400, q: "X is a fictional film about the 1999 Kargil War, directed by Farhan Akhtar. Near the end, the battalion is sent to capture Y Hill, also called Point Z. Name X, Y and Z.", a: "«Lakshya» · «Tiger» Hill · Point «5179»",
          note: "From the planning doc, not the deck.",
        },
      ]
    },
    {
      cat: "🎶 Songs", clues: [
        // Local clips/*.mp3 win when present (build them from songs.json, or drop
        // in the original clips from the Drive "Assets/Diwali Trivia" folder);
        // otherwise the ytAudio snippet plays. YouTube starts are best guesses.
        {
          v: 100, q: "Identify the song and the artist.", a: "«Khairiyat» by «Arijit Singh» (<em>Chhichhore</em>, 2019)",
          audio: "clips/khairiyat.mp3",
          ytAudio: { id: "hoNb6HuNmU0", start: 15, duration: 12 },
          yt: { id: "hoNb6HuNmU0", start: 15 },
        },
        {
          v: 200, q: "Identify the song and the artist.", a: "«Pretty Woman» by «Shankar Mahadevan» (<em>Kal Ho Naa Ho</em>, 2003)",
          audio: "clips/pretty-woman.mp3",
          ytAudio: { id: "70QpN7DvaK4", start: 0, duration: 12 },
          yt: { id: "70QpN7DvaK4", start: 0 },
        },
        {
          v: 300, q: "Identify the song and the artist.", a: "«Lamha Lamha» (<em>Gangster</em>, 2006): music by «Pritam», sung by «Abhijeet» and «Sunidhi Chauhan»",
          audio: "clips/lamha-lamha.mp3",
          ytAudio: { id: "CApsy8SR3k0", start: 20, duration: 12 },
          yt: { id: "CApsy8SR3k0", start: 20 },
        },
        {
          v: 400, q: "Identify the song and the artist.", a: "«Kya Khoob Lagti Ho» by «Mukesh» (with Kanchan), <em>Dharmatma</em> (1975)",
          note: "In 2025 this one scored 5 for the song and 2 for the artist.",
          audio: "clips/kya-khoob-lagti-ho.mp3",
          ytAudio: { id: "A_vcoAPoprg", start: 0, duration: 12 },
          yt: { id: "A_vcoAPoprg", start: 0 },
        },
      ]
    },
  ],

  /* ---- BENCH: from the planning doc, never hosted. Paste one over a clue above.
     { v: 0, q: "In which Southeast Asian country with a large Indian diaspora is Diwali a public holiday, celebrated with open houses, cultural shows and local touches like dragon dances?", a: "«Malaysia»",
       b: "Name another country where Diwali is a public holiday.", bA: "Fiji · Guyana · Mauritius · Myanmar · Nepal · Pakistan · Singapore · Sri Lanka · Suriname · Trinidad and Tobago" },
     { v: 0, q: "In Gujarat, Diwali signals the start of the New Year. What ritual with ledger books do many Gujarati families perform?", a: "«Chopda Pujan» (worship of the account books)" },
     { v: 0, q: "Which UK city hosts the largest Diwali celebrations outside India, lighting up its Golden Mile?", a: "«Leicester»" },
     Songs the doc listed but the deck didn't use: Dil Hai Ki Maanta Nahin · Kiliye Kiliye ·
     Didi Tera Devar Deewana · Jab Koi Baat Bigad Jaaye · Navrai Majhi.
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
      heading: "Answer in the form of a question",
      body: `Classic quiz-show rules: phrase every answer as a question, like <b>"What is…?"</b> or <b>"Who is…?"</b>`,
      example: `e.g. "The Festival of Lights" → "What is Diwali?" 🪔`,
    },
    items: [
      { num: "1", text: `Teams on their turn pick a question (a category and a points value). <small>Higher value = tougher question.</small>` },
      { num: "2", text: `Direct question: answer in <b>60</b> seconds. No penalty for getting it wrong.` },
      { num: "3", text: `Missed questions bounce to the other teams in order to steal. A wrong steal <b>costs</b> that team <b>half</b> the points. <small>First steal has the penalty; none after that.</small>` },
      { num: "4", text: `Rapid fire puzzles: say the phrase the picture shows.` },
      { num: "★", text: `Trash-talk? Allowed. Bribing the host with mithai? <b>Strongly encouraged.</b>` },
    ],
  },

  winner: { label: "🪔 Champions!!" },
};
