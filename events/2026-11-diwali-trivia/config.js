/* =====================================================================
   Diwali Trivia · November 2026 · game config
   =====================================================================
   Public config for the game-nights quizboard engine. Rendered by
   ../../engine/quizboard.js. Six categories × five clues. An optional private
   category can be spliced in from the gitignored config.local.js overlay
   (see README → "Private content").

   Text conventions in q/a/clue/b/bA (see README for the full reference):
     «word» · <<word>> · *word*   → highlighted key term
     this / these / those / here  → auto-highlighted on the QUESTION side
     inline HTML (<em>, <b>, <br>) works too.

   MEDIA: answer images are Wikimedia Commons files referenced through
   Special:FilePath (a redirect to the real file, so no hashed upload paths).
   YouTube ids were taken from search results, not opened, and the
   start values are best guesses near each song's hook. Before the night:
     python tools/check-media.py --event 2026-11-diwali-trivia
   lists any video that is gone or won't embed, and any broken image. In the
   game a failing video says why, and [ ] nudges an answer video's start
   (Settings → "Copy video starts" turns your nudges into a ytStarts block).
   To build offline mp3s for the music round:
     python tools/yt-download.py --event 2026-11-diwali-trivia
   ===================================================================== */
const COMMONS = "https://commons.wikimedia.org/wiki/Special:FilePath/";

window.TRIVIA_CONFIG = {
  meta: {
    slug: "2026-11-diwali-trivia",
    version: 1,
    mode: "quizboard",
    pageTitle: "Diwali Trivia · November 2026",
    title: "DIWALI",
    titleAccent: "TRIVIA",
    logo: "assets/logo.svg",
    subtitle: "Festival of Lights · 11.2026",
    editionLine: "Festival of Lights · November 2026",
    date: "2026-11",
    author: "Praveen Gupta",
  },

  timers: { direct: 60, steal: 20, marker: "🪔" },   // a little diya rides the timer
  scoring: { bonusValue: 100, stealPenaltyRatio: 0.5 },
  theme: { default: "diya" },

  categories: [
    {
      cat: "🪔 Diwali", clues: [
        {
          v: 100, q: "Diwali comes from the Sanskrit «Deepavali», which literally means a «row of» these.", a: "Lamps, or «diyas» (little clay oil lamps)",
          note: "diya → DEE-yah",
          img: COMMONS + "Diya_set_in_a_rangoli.jpg?width=960",
          b: "Name the colourful patterns drawn at the doorstep with powder, rice or flower petals.", bA: "«Rangoli»"
        },
        {
          v: 200, q: "On Diwali's first day it's considered lucky to buy gold, silver, or even just a new steel pot.", a: "«Dhanteras»",
          clue: "«Dhan» = wealth · «teras» = the 13th day of the lunar fortnight.",
          b: "It also honours the physician of the gods, who rose from the churning ocean carrying a pot of nectar. Name him.", bA: "«Dhanvantari», god of Ayurveda"
        },
        {
          v: 300, q: "In a 2006 episode of this NBC sitcom, Kelly Kapoor takes the whole office to a Diwali party, where the boss proposes to his girlfriend in front of everyone.", a: "«The Office» (US), Season 3, «Diwali»",
          yt: { id: "QirCMADtks8", start: 0 },   // Michael's "Diwali Song"
          b: "Who wrote the episode and plays Kelly?", bA: "«Mindy Kaling» (her real parents played Kelly's parents)"
        },
        {
          v: 400, q: "Sikhs celebrate Diwali as «Bandi Chhor Divas», the day this sixth Guru walked out of Gwalior Fort with 52 imprisoned kings holding on to the tassels of his cloak.", a: "«Guru Hargobind»",
          clue: "His cloak was made with 52 tassels, one for each king to hold.",
          img: COMMONS + "Bandi_Chor_Divas.jpg?width=960",
          b: "Which shrine in Amritsar glows with lamps and fireworks for the occasion?", bA: "The «Golden Temple» (Harmandir Sahib)"
        },
        {
          v: 500, q: "Every Diwali evening, India's stock exchanges open for a special one-hour session so investors can make a token trade at an auspicious hour. What's it called?", a: "«Muhurat trading»",
          clue: "«Muhurat» = an auspicious time window.",
          b: "Many traders also hold «Chopda Puja» on Diwali. What do they bless?", bA: "Their new «account books» (ledgers) for the year"
        },
      ]
    },
    {
      cat: "📜 Mythology", clues: [
        {
          v: 100, q: "Diwali celebrates Ram's homecoming to Ayodhya after defeating this ten-headed demon king of Lanka.", a: "«Ravana»",
          img: COMMONS + "Ravana_Effigy_on_Vijayadashami_Dasara_Festival_Jaipur_Rajasthan_India_October_2013.jpg?width=960",
          b: "How many years was Ram in exile?", bA: "«14» years"
        },
        {
          v: 200, q: "Sent to fetch one life-saving herb for the wounded Lakshman, this monkey god couldn't tell which plant it was, so he flew back carrying the entire mountain.", a: "«Hanuman»",
          img: COMMONS + "Hanuman_fetches_the_herb-bearing_mountain,_in_a_print_from_the_Ravi_Varma_Press,_1910%27s.jpg?width=960",
          b: "Name the herb.", bA: "«Sanjeevani» (booti)"
        },
        {
          v: 300, q: "Worshipped on the main night of Diwali, this goddess of wealth and fortune rose from the «churning of the ocean» seated on a lotus.", a: "«Lakshmi»",
          note: "Families leave doors and windows open on Diwali night so she can find her way in.",
          img: COMMONS + "Raja_Ravi_Varma,_Goddess_Lakshmi,_1896.jpg?width=960",
          b: "Her vahana (vehicle) is which nocturnal bird?", bA: "An «owl» (Uluka)"
        },
        {
          v: 400, q: "Choti Diwali is also «Naraka Chaturdashi», the day this god, with his wife Satyabhama, slew the demon Narakasura and freed 16,000 captive women.", a: "«Krishna»",
          img: COMMONS + "Narkasur_effigy_in_Goa.jpg?width=960",
          b: "In Goa, what happens to giant Narakasura effigies before dawn on that day?", bA: "They're «burnt», then the celebrations begin"
        },
        {
          v: 500, q: "The day after Diwali, «Bali Pratipada», remembers the generous demon-king Mahabali. This dwarf avatar of Vishnu measured the universe in three steps and pushed him into the underworld.", a: "«Vamana»",
          img: COMMONS + "Vamana_%E2%80%94_Raja_Ravi_Varma.jpg?width=960",
          b: "Mahabali is allowed one visit home a year. During which Kerala harvest festival?", bA: "«Onam»"
        },
      ]
    },
    {
      cat: "🏛️ History", clues: [
        {
          v: 100, q: "Mughal emperor Shah Jahan built this white-marble mausoleum in Agra for his wife, Mumtaz Mahal.", a: "The «Taj Mahal»",
          img: COMMONS + "Taj_Mahal_(Edited).jpeg?width=960",
          b: "It stands on the banks of which river?", bA: "The «Yamuna»"
        },
        {
          v: 200, q: "In 1930, Gandhi walked for 24 days to the coastal village of Dandi to defy a British tax on this everyday item.", a: "«Salt» (the Salt March, or Dandi March)",
          img: COMMONS + "Gandhi_at_Dandi,_5_April_1930.jpg?width=960",
          b: "Gandhi's birthday, October 2, is marked by the UN as the International Day of what?", bA: "«Non-Violence»"
        },
        {
          v: 300, q: "Around 628 CE, the Indian mathematician Brahmagupta wrote down the first rules for doing arithmetic with this number.", a: "«Zero» (0)",
          note: "Pictured: the oldest «0» carved in stone in India, an 876 CE temple inscription.",
          img: COMMONS + "876_CE_monolithic_rock_Chaturbhuj_Hindu_Temple_Gwalior_Fort,_Zero_Inscription_3.jpg?width=960",
          b: "That 876 CE zero is carved in a temple inside which fort? (The Mughals once held Guru Hargobind in the same fort.)", bA: "«Gwalior Fort»"
        },
        {
          v: 400, q: "Its name means «Mountain of Light», fitting for Diwali. This diamond passed from Mughals to Persians, Afghans and Sikhs before the British took it in 1849.", a: "The «Koh-i-Noor»",
          img: COMMONS + "Koh-i-Noor_new_version_copy.jpg?width=960",
          b: "Under the 1849 treaty it was surrendered by which boy maharaja, Ranjit Singh's youngest son?", bA: "Maharaja «Duleep Singh»"
        },
        {
          v: 500, q: "This 4,500-year-old Indus Valley city, whose name means «Mound of the Dead», had grid streets, covered drains and a 'Great Bath'.", a: "«Mohenjo-daro»",
          img: COMMONS + "Mohenjo-daro.jpg?width=960",
          b: "In which present-day country are its ruins?", bA: "«Pakistan» (Sindh)"
        },
      ]
    },
    {
      cat: "🗺️ Geography", clues: [
        {
          v: 100, q: "Ram's home city lit more than 26 lakh (2.6 million) diyas along its riverfront in October 2025, a Guinness World Record.", a: "«Ayodhya» (Uttar Pradesh)",
          img: COMMONS + "Sarayu_River_night_view,_Ayodhya_001.jpg?width=960",
          b: "Name the river it sits on.", bA: "The «Sarayu» (Saryu)"
        },
        {
          v: 200, q: "In this Himalayan country Diwali is «Tihar», and one whole day, «Kukur Tihar», is for garlanding and feasting dogs.", a: "«Nepal»",
          img: COMMONS + "Kukur_Tihar(_Where_we_worship_Dogs).jpg?width=960",
          b: "Another day of Tihar honours which bird, seen as a messenger of death?", bA: "The «crow» (Kaag Tihar)"
        },
        {
          v: 300, q: "Fifteen days after Diwali, this holy city's ghats on the Ganges glow with over a million diyas for «Dev Deepawali», the 'Diwali of the gods'.", a: "«Varanasi» (Banaras)",
          img: COMMONS + "Dev_Deepavali_at_Varanasi_DSC04305_10.jpg?width=960",
          b: "Its ancient name is often translated as «city of light». What is it?", bA: "«Kashi»"
        },
        {
          v: 400, q: "This English Midlands city's «Golden Mile» hosts what's often billed as one of the biggest Diwali celebrations outside India.", a: "«Leicester»",
          clue: "The Golden Mile is Belgrave Road: saris, sweets and jewellers.",
          img: COMMONS + "Streets_with_festive_lighting,_Diwali_Leicester_-_Belgrave_Road_England_2009.jpg?width=960",
          b: "Name a country (not India or Nepal) where Diwali is a national public holiday.", bA: "e.g. «Fiji» · «Guyana» · «Malaysia» · «Mauritius» · «Singapore» · «Sri Lanka» · «Suriname» · «Trinidad &amp; Tobago»"
        },
        {
          v: 500, q: "This Tamil Nadu town makes the vast majority of India's firecrackers, earning it the nickname «Kutty Japan» (Little Japan).", a: "«Sivakasi»",
          clue: "Also India's capital of safety matches and printing.",
          b: "Firework chemistry: blue is the hardest colour to make. Which metal produces it?", bA: "«Copper»"
        },
      ]
    },
    {
      cat: "🎬 Movies", clues: [
        {
          v: 100, q: "In this 2012 Ang Lee film, a teenager from Pondicherry is shipwrecked on a lifeboat with a Bengal tiger named Richard Parker.", a: "«Life of Pi»",
          yt: { id: "Bhc5g3I2jiQ", start: 0, alts: [{ id: "NP_mQ-PPPmg" }, { id: "3mMN693-F3U" }, { id: "mZEZ35Fhvuc" }] },   // Richard Parker's goodbye; last backups are trailers
          b: "Pi's full name, Piscine Molitor Patel, comes from a famous swimming pool in which city?", bA: "«Paris»"
        },
        {
          v: 200, q: "Opening in theatres this Diwali week, Nitesh Tiwari's two-part epic stars Ranbir Kapoor as Ram and Yash as Ravana. Name the film.", a: "«Ramayana» (Part 1)",
          yt: { id: "jbeTOnCVjIU", start: 0 },   // trailer: the film is new, so no famous scene yet
          b: "A.R. Rahman co-composed its score with which Oscar-winning Hollywood composer?", bA: "«Hans Zimmer»"
        },
        {
          v: 300, q: "This 2001 Karan Johar family saga opens with a lavish Diwali puja, and a mother who just *knows* her son has come home before anyone tells her.", a: "«Kabhi Khushi Kabhie Gham…» (K3G)",
          yt: { id: "ZLWS7aeo3WA", start: 0 },   // Rahul comes home and his mother just knows
          b: "Complete its famous tagline: \"It's all about loving your ___.\"", bA: "«parents»"
        },
        {
          v: 400, q: "Since 1995, this Shah Rukh Khan and Kajol romance has screened almost every day at Mumbai's Maratha Mandir. It's the longest theatrical run in Indian cinema history.", a: "«Dilwale Dulhania Le Jayenge» (DDLJ)",
          yt: { id: "_XYmNvTzT_A", start: 0 },   // the final train scene
          b: "\"Ja Simran, ja!\" In the finale, Simran runs to catch what?", bA: "A moving «train» (Raj's hand reaching out)"
        },
        {
          v: 500, q: "\"Kitne aadmi the?\" (How many men were there?) The bandit Gabbar Singh's line comes from this 1975 'curry Western', which turned 50 in 2025.", a: "«Sholay»",
          yt: { id: "v9o-jJYOkMA", start: 0 },   // the "Kitne aadmi the" scene
          b: "Which actor played Gabbar Singh?", bA: "«Amjad Khan»"
        },
      ]
    },
    {
      cat: "🎶 Songs", clues: [
        // Music clues prefer a local clips/*.mp3 (build them from songs.json with
        // tools/yt-download.py); without one they fall back to the ytAudio snippet.
        {
          v: 100, q: "Name the song and the film it's from.", a: "«Jai Ho» from <em>Slumdog Millionaire</em> (A.R. Rahman)",
          audio: "clips/jai-ho.mp3",
          ytAudio: { id: "ai_2a6hR7Bo", start: 0, duration: 12 },
          yt: { id: "ai_2a6hR7Bo", start: 30 },
          b: "Which American girl group released an English version in 2009?", bA: "The «Pussycat Dolls», with \"Jai Ho! (You Are My Destiny)\""
        },
        {
          v: 200, q: "Name the song and the film it's from.", a: "«Naatu Naatu» from <em>RRR</em> (M.M. Keeravani)",
          clue: "Won the 2023 Oscar for Best Original Song.",
          audio: "clips/naatu-naatu.mp3",
          ytAudio: { id: "4_eEgJhsBMo", start: 55, duration: 12, alts: [{ id: "_vktceH8ZA0", start: 55 }, { id: "xaoVjeACCqQ", start: 55 }, { id: "APPcu7DnYnU", start: 55 }] },
          yt: { id: "4_eEgJhsBMo", start: 120, alts: [{ id: "_vktceH8ZA0", start: 120 }, { id: "xaoVjeACCqQ", start: 120 }, { id: "APPcu7DnYnU", start: 120 }] },
          b: "Its dance was filmed in front of which country's presidential palace?", bA: "«Ukraine» (Mariinskyi Palace, Kyiv, August 2021)"
        },
        {
          v: 300, q: "Name the song and the film it's from.", a: "«Kala Chashma» from <em>Baar Baar Dekho</em> (2016)",
          audio: "clips/kala-chashma.mp3",
          ytAudio: { id: "c6L4NtIfcN0", start: 10, duration: 12 },
          yt: { id: "c6L4NtIfcN0", start: 40 },
          b: "In 2022 a wedding dance video by which country's dance crew, Quick Style, made it go viral all over again?", bA: "«Norway»"
        },
        {
          v: 400, q: "Name the song and the film it's from.", a: "«Chaiyya Chaiyya» from <em>Dil Se</em> (1998, A.R. Rahman)",
          clue: "Shah Rukh Khan dances on the roof of a moving train.",
          audio: "clips/chaiyya-chaiyya.mp3",
          ytAudio: { id: "T8_k-g1NQgA", start: 0, duration: 14 },
          yt: { id: "T8_k-g1NQgA", start: 50 },
          b: "This song plays over the opening credits of which 2006 Spike Lee heist movie?", bA: "«Inside Man»"
        },
        {
          v: 500, q: "Name the song and the artist.", a: "«Mundian To Bach Ke» by Panjabi MC",
          clue: "1998 bhangra that crossed over worldwide, later remixed with Jay-Z.",
          audio: "clips/mundian.mp3",
          ytAudio: { id: "x9WO2ieJMYk", start: 0, duration: 12 },
          yt: { id: "x9WO2ieJMYk", start: 30 },
          b: "Its famous bassline samples the theme of which 1980s American TV show?", bA: "«Knight Rider»"
        },
      ]
    },
  ],

  /* ---- BENCH: swap-in clues for fine-tuning. Paste one over any clue above
     (keep the v). Facts checked Oct 2026.
     { v: 0, q: "In December 2025, at a session held at Delhi's Red Fort, this UN agency added Deepavali to its Intangible Cultural Heritage list.", a: "«UNESCO»",
       b: "Which other Ram-related Indian tradition was inscribed back in 2008?", bA: "«Ramlila»" },
     { v: 0, q: "In 2017 Canada Post issued its first-ever Diwali stamp, a joint issue with the postal service of which country?", a: "«India» (India Post)" },
     { v: 0, q: "In October 2025 California made Diwali a state holiday, the third US state to do so. Which state was first, in 2024?", a: "«Pennsylvania»" },
     { v: 0, q: "Vancouver's «Diwali Fest» grew out of an event first held in this year, under the name 'Vancouver Celebrates Diwali'.", a: "«2004»" },
     { v: 0, q: "To shelter villagers from Indra's storm, young Krishna lifted this entire hill on his little finger. It's remembered the day after Diwali.", a: "«Govardhan»",
       b: "What's the 'mountain of food' offered that day called?", bA: "«Annakut»" },
     { v: 0, q: "For Jains, Diwali marks the «nirvana» of this 24th and last tirthankara.", a: "«Mahavira»" },
     { v: 0, q: "The White House held its first Diwali event in 2003. Which president, in 2009, became the first to celebrate it there in person?", a: "«Barack Obama»" },
  */

  teams: {
    default: "A",
    presets: [
      {
        key: "A", label: "Patakha Party", confirmLabel: "Patakha Party (firecrackers)",
        teams: [
          { name: "Anar Anarchists", color: "#E11D48", logo: "assets/team-anar.svg", tagline: "Calm outside. A fountain of answers inside." },
          { name: "Chakri Chaos", color: "#16A34A", logo: "assets/team-chakri.svg", tagline: "We spin. You lose." },
          { name: "Phuljhadi Phenoms", color: "#4338CA", logo: "assets/team-phuljhadi.svg", tagline: "Short fuse. Bright answers." },
          { name: "Sutli Bombers", color: "#0D9488", logo: "assets/team-sutli.svg", tagline: "Loud. Proud. Slightly illegal." },
          { name: "Rocket Rajas", color: "#7C3AED", logo: "assets/team-rocket.svg", tagline: "Launched from a glass bottle. Aimed at first place." },
          { name: "Saanp Goli Society", color: "#CA8A04", logo: "assets/team-saanp.svg", tagline: "Ugly start. Long, unstoppable finish." },
        ]
      },
      {
        key: "B", label: "Mithai Mafia", confirmLabel: "Mithai Mafia (sweets)",
        teams: [
          { name: "Kaju Katli Cartel", color: "#0F766E", logo: "assets/team-kaju.svg", tagline: "Diamond-cut. Diamond-hard." },
          { name: "Gulab Jamun Gang", color: "#CA8A04", logo: "assets/team-gulab.svg", tagline: "Soaked in syrup and confidence." },
          { name: "Jalebi Junta", color: "#1D4ED8", logo: "assets/team-jalebi.svg", tagline: "Twisted logic. Sweet results." },
          { name: "Ladoo Legion", color: "#DB2777", logo: "assets/team-ladoo.svg", tagline: "Round, rolling, unstoppable." },
          { name: "Rasgulla Rebels", color: "#16A34A", logo: "assets/team-rasgulla.svg", tagline: "Squeeze us. We bounce back." },
          { name: "Soan Papdi Syndicate", color: "#7C3AED", logo: "assets/team-soan.svg", tagline: "Passed around. Never defeated." },
        ]
      },
      {
        key: "C", label: "Diwali Party People", confirmLabel: "Diwali Party People",
        teams: [
          { name: "Teen Patti Sharks", color: "#15803D", logo: "assets/team-teenpatti.svg", tagline: "We never fold." },
          { name: "Aunty Intelligence Agency", color: "#DB2777", logo: "assets/team-aunty.svg", tagline: "We already know the answer. And your salary." },
          { name: "Regifting Ring", color: "#7C3AED", logo: "assets/team-regift.svg", tagline: "This sweet box has seen three Diwalis." },
          { name: "Rangoli Perfectionists", color: "#2563EB", logo: "assets/team-rangoli.svg", tagline: "One grain out of place? Start over." },
          { name: "Uncle's Cracker Stash", color: "#EA580C", logo: "assets/team-uncle.svg", tagline: "Lights the fuse. Walks away. Never looks back." },
          { name: "Leftover Mithai Committee", color: "#0F766E", logo: "assets/team-committee.svg", tagline: "Meeting adjourned when the box is empty." },
        ]
      },
    ],
  },

  /* ---- winner songs (Teams ⚙ → Winner song; start can be nudged live there) ---- */
  celebrations: {
    default: "jaiho",
    songs: [
      { key: "jaiho", label: "Jai Ho", sub: "A.R. Rahman · 'let there be victory'", yt: "ai_2a6hR7Bo", start: 0, emoji: "🏆" },
      { key: "gallan", label: "Gallan Goodiyaan", sub: "Dil Dhadakne Do", yt: "jCEdTq3j-0U", start: 25, emoji: "💃" },
      { key: "naatu", label: "Naatu Naatu", sub: "RRR", yt: "4_eEgJhsBMo", start: 120, alts: [{ id: "_vktceH8ZA0", start: 120 }, { id: "xaoVjeACCqQ", start: 120 }, { id: "APPcu7DnYnU", start: 120 }], emoji: "🕺" },
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
      { num: "4", text: `Some questions carry a <b>bonus</b>: free to guess, <b>no penalty</b>.` },
      { num: "★", text: `Trash-talk? Allowed. Bribing the host with mithai? <b>Strongly encouraged.</b>` },
    ],
  },

  winner: { label: "🪔 Champions!!" },
};
