/* =====================================================================
   Diwali Trivia · October 20, 2025 · round 4, the Vancouver round
   =====================================================================
   Round 4 of the 2025 Diwali night was already a quiz board ("PG Vancouver
   Jeopardy" in the deck), played off the slides. Its clues come from the
   "Diwali Trivia 2025" planning doc; values follow the doc's 200 to 1000
   ladder. Rounds 1 to 3 are ../2025-10-20-diwali-trivia/.

   Transit had ten routes in the doc; five are on the board and the rest
   are on the BENCH below. Team badges are shared with the 2026 board.
   ===================================================================== */
const BADGES = "../2026-11-diwali-trivia/assets/";

window.TRIVIA_CONFIG = {
  meta: {
    slug: "2025-10-20-diwali-trivia-vancouver",
    version: 1,
    mode: "quizboard",
    pageTitle: "Diwali Trivia · October 2025 · Vancouver Round",
    title: "DIWALI",
    titleAccent: "TRIVIA",
    logo: BADGES + "logo.svg",
    subtitle: "Round 4 · Vancouver",
    editionLine: "Diwali Special · October 20, 2025 · Round 4: Vancouver",
    date: "2025-10-20",
    author: "Praveen Gupta",
  },

  timers: { direct: 60, steal: 20, marker: "car" },
  scoring: { bonusValue: 100, stealPenaltyRatio: 0.5 },
  theme: { default: "diya" },

  categories: [
    {
      cat: "🚦 Intersections", clues: [
        { v: 200, q: "Name the intersection: Pacific Centre, the Hudson's Bay building, London Drugs and Vancouver City Centre Station.", a: "«Granville» & «Georgia»" },
        { v: 400, q: "Name the intersection: Best Buy, Old Navy, Pacific Centre and the Ox Pub.", a: "«Granville» & «Robson»" },
        { v: 600, q: "Name the intersection: Lululemon, L'Occitane en Provence, Roots and the former Victoria's Secret store.", a: "«Robson» & «Burrard»" },
        { v: 800, q: "Name the intersection: Bentall One, the Pod (Scotiabank), the Douglas Jung Building and Commerce Place.", a: "«Burrard» & «Pender»" },
        { v: 1000, q: "Name the intersection: Safeway, Chungchun, Starbucks and Holy Guacamole Mexican Restaurant.", a: "«Robson» & «Denman»" },
      ]
    },
    {
      cat: "🚌 Transit", clues: [
        { v: 200, q: "Which bus route runs from Joyce-Collingwood Station to UBC?", a: "The «R4»" },
        { v: 400, q: "Which bus route runs from VCC-Clark Station to UBC?", a: "The «84»" },
        { v: 600, q: "Which bus route runs from Powell to UBC?", a: "The «4»" },
        { v: 800, q: "Which bus route runs from Metrotown to SFU Exchange?", a: "The «144»" },
        { v: 1000, q: "Which bus route runs from Kootenay Loop to Port Coquitlam Station?", a: "The «160»" },
      ]
    },
    {
      cat: "🏒 Sports", clues: [
        {
          v: 200, q: "How many top-tier professional sports teams play in Vancouver?", a: "«3»: the Canucks, the Whitecaps and the Warriors",
          note: "Debatable: the BC Lions (CFL) also play at BC Place.",
        },
        { v: 400, q: "Rogers Arena sits on this street.", a: "«Griffiths Way»" },
        { v: 600, q: "How many times have the Canucks reached the Stanley Cup Final?", a: "«3» (1982, 1994 and 2011)" },
        { v: 800, q: "Give the full name of the Vancouver Canadians' home stadium and field.", a: "«Scotiabank Field at Nat Bailey Stadium»" },
        { v: 1000, q: "Where did the Whitecaps play their first MLS home game?", a: "«Empire Field», right beside Playland" },
      ]
    },
    {
      cat: "🎬 Filmed Here", clues: [
        { v: 200, q: "Filmed in Vancouver: an invincible, burnt man seeks his revenge on a twisted experimenter.", a: "«Deadpool»" },
        { v: 400, q: "Filmed in Vancouver: a crocodile, a coach and a Sandler collide in this comedy.", a: "«Happy Gilmore»" },
        { v: 600, q: "Filmed in Vancouver: the strongest man alive comes to Earth in this DC film.", a: "«Man of Steel»" },
        { v: 800, q: "Filmed in Vancouver: Dwayne Johnson stars in this high-flying action movie.", a: "«Skyscraper»" },
        { v: 1000, q: "Filmed in Vancouver: Ethan Hunt and his colleagues go rogue in this action film, the fourth in its series.", a: "«Mission: Impossible, Ghost Protocol»" },
      ]
    },
    {
      cat: "📺 TV Filmed Here", clues: [
        { v: 200, q: "John Cena stars as a peace-obsessed antihero in this HBO Max series, which filmed its action-packed scenes in Vancouver, including fights in abandoned warehouses.", a: "«Peacemaker»" },
        { v: 400, q: "Grant Gustin sped through Vancouver's streets as Barry Allen in this CW series about a forensic scientist who gains super speed after a particle accelerator explosion.", a: "«The Flash»" },
        { v: 600, q: "Tom Ellis played the charming devil who leaves Hell for Los Angeles in this series, which was shot in Vancouver, using local soundstages for the nightclub scenes.", a: "«Lucifer»" },
        { v: 800, q: "Fairy tale characters like Snow White and Rumplestiltskin live in the modern world in this ABC show, with Vancouver's Steveston village doubling as Storybrooke.", a: "«Once Upon a Time»" },
        { v: 1000, q: "Walker Scobell stars as a young demigod in this Disney+ adaptation of Rick Riordan's books, whose third season was filming in Vancouver's studios and forests in October 2025.", a: "«Percy Jackson and the Olympians»" },
      ]
    },
  ],

  /* ---- BENCH: from the planning doc, not on the board.
     Transit: Park Royal to Phibbs Exchange → R2 · Phibbs Exchange to Metrotown (Willingdon Express) → 222 ·
              Scott Road to Newton Exchange → R6 · Dunbar to Nanaimo Station → 7 · 22nd Street Station to Marpole Loop → 100
     Filmed here: The Last of Us (no clue written yet)
  */

  teams: {
    default: "B",
    presets: [
      {
        key: "A", label: "Patakha Party", confirmLabel: "Patakha Party (firecrackers)",
        teams: [
          { name: "Anar Anarchists", color: "#E11D48", logo: BADGES + "team-anar.svg" },
          { name: "Chakri Chaos", color: "#16A34A", logo: BADGES + "team-chakri.svg" },
          { name: "Phuljhadi Phenoms", color: "#4338CA", logo: BADGES + "team-phuljhadi.svg" },
          { name: "Sutli Bombers", color: "#0D9488", logo: BADGES + "team-sutli.svg" },
          { name: "Rocket Rajas", color: "#7C3AED", logo: BADGES + "team-rocket.svg" },
        ]
      },
      {
        key: "B", label: "Mithai Mafia", confirmLabel: "Mithai Mafia (sweets)",
        teams: [
          { name: "Kaju Katli Cartel", color: "#0F766E", logo: BADGES + "team-kaju.svg" },
          { name: "Gulab Jamun Gang", color: "#CA8A04", logo: BADGES + "team-gulab.svg" },
          { name: "Jalebi Junta", color: "#1D4ED8", logo: BADGES + "team-jalebi.svg" },
          { name: "Ladoo Legion", color: "#DB2777", logo: BADGES + "team-ladoo.svg" },
          { name: "Soan Papdi Syndicate", color: "#7C3AED", logo: BADGES + "team-soan.svg" },
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
      body: `Classic quiz-show rules: phrase every answer as a question, like <b>"What is…?"</b> or <b>"Where is…?"</b>`,
      example: `e.g. "Home of the Canucks" → "What is Rogers Arena?" 🏒`,
    },
    items: [
      { num: "1", text: `Teams on their turn pick a question (a category and a points value). <small>Higher value = tougher question.</small>` },
      { num: "2", text: `Direct question: answer in <b>60</b> seconds. No penalty for getting it wrong.` },
      { num: "3", text: `Missed questions bounce to the other teams in order to steal. A wrong steal <b>costs</b> that team <b>half</b> the points. <small>First steal has the penalty; none after that.</small>` },
      { num: "★", text: `Locals have no excuse.` },
    ],
  },

  winner: { label: "🪔 Champions!!" },
};
