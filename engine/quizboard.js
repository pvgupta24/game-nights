/* =====================================================================
   game-nights · quizboard engine
   =====================================================================
   This file is the whole app. An event never edits it — an event ships a
   `config.js` that sets `window.TRIVIA_CONFIG`, and the engine builds the
   board, overlays, scoring, timer and celebration UI from that config.

   Load order in an event's index.html (classic scripts, no modules/fetch →
   works on file://, `python -m http.server`, and GitHub Pages):

       <link rel="stylesheet" href="../../engine/quizboard.css">
       <script src="config.js"></script>        <!-- window.TRIVIA_CONFIG -->
       <script src="config.local.js"></script>  <!-- optional private overlay -->
       <script src="../../engine/quizboard.js"></script>

   Config reference + fmt() conventions live in the repo README and in
   events/demo/config.js (the fully-commented kitchen-sink template).
   ===================================================================== */

/* ============ engine constants ============ */
/* The three palettes are baked into quizboard.css (data-theme=noir|dusk|day).
   A config only chooses which one is the default (meta/theme.default). */
const THEME_LIST = [
  { key: "noir", label: "Stadium Noir", sw: ["#060c18", "#4ade80", "#f5c542"] },
  { key: "dusk", label: "Dusk Stadium", sw: ["#12091e", "#f87171", "#f5c542"] },
  { key: "day", label: "Day Game", sw: ["#f2f5f9", "#16a34a", "#b8860b"] },
];
const THEME_KEYS = THEME_LIST.map(t => t.key);

/* The timer marker that rides the track. "car" is the built-in SVG; any other
   value is rendered as a text glyph (emoji), so events can pick a generic one. */
const CAR_SVG = `<svg viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2 21 L2 13 Q2 9 8 9 L24 9 L29 3.5 Q30 2 32.5 2 L43 2 Q45.5 2 46.5 4 L49.5 9 L57 9 Q62 9 62 13 L62 21 Z"
          fill="#f4b340" />
        <ellipse cx="59.5" cy="13.5" rx="1.6" ry="3.1" fill="#15191e" />
        <circle cx="15" cy="22" r="5.4" fill="#15191e" stroke="#f4b340" stroke-width="2.4" />
        <circle cx="49" cy="22" r="5.4" fill="#15191e" stroke="#f4b340" stroke-width="2.4" />
      </svg>`;
const CLOCK_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke-width="2" />
        <line x1="12" y1="12" x2="12" y2="6.8" stroke-width="2" stroke-linecap="round" />
        <line x1="12" y1="12" x2="15.6" y2="13.2" stroke-width="2" stroke-linecap="round" />
      </svg>`;
// options avoid left-facing emoji (racer/runner point the wrong way on most platforms)
const MARKER_OPTIONS = [
  { val: "clock", label: "Clock" },
  { val: "car", label: "Car" },
  { val: "🏁", label: "Flag" },
  { val: "🚀", label: "Rocket" },
  { val: "⚡", label: "Bolt" },
  { val: "●", label: "Dot" },
];

const DEFAULTS = {
  meta: {
    slug: null,             // REQUIRED — localStorage namespace + gallery link
    version: 1,
    mode: "quizboard",
    pageTitle: null,        // browser tab; defaults to "<title> <titleAccent>"
    title: "GAME",          // brand — plain part
    titleAccent: "NIGHT",   // brand — bold part (rules/winner render <b>…</b>)
    logo: null,             // optional brand mark (path/URL) shown top-left; omit → a small accent dot
    author: null,           // who made this board — credited on the rules card (and on the gallery via events.js)
    subtitle: "",           // header line under the brand
    editionLine: "",        // shown on the rules + winner cards
    date: "",
    legacyStorageKey: null, // one-time migration from an older localStorage key
    avTestUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  timers: { direct: 60, steal: 20, marker: "clock" },
  scoring: { bonusValue: 100, stealPenaltyRatio: 0.5 },
  theme: { default: "noir" },
  categories: [],
  teams: { default: null, presets: [] },
  celebrations: { default: null, songs: [] },
  rules: { openOnLoad: true, answerNote: null, items: null },
  winner: { label: "🏆 Champions!!" },
};

/* ============ module state (assigned in boot) ============ */
let CFG, KEY, ROWS, BONUS_VALUE, STEAL_RATIO;
let PRESET_LIST, PRESETS, DEFAULT_PRESET;
let CELEBS, DEFAULT_CELEB;
let state, current = null, awards = {}, bonusAwards = {};
let audioEl, audioMode = null, ytClip = null, ytAudioFrame = null, ytAudioTimer = null;
let timer = { phase: null, total: 0, elapsed: 0, last: 0, int: null, paused: false };
let winnerTeam = null, confettiRAF = null;

const $ = id => document.getElementById(id);
function esc(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }

/* ============ config normalisation ============ */
function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
function deepMerge(base, over) {
  const out = Array.isArray(base) ? base.slice() : { ...base };
  if (!isObj(over)) return over === undefined ? out : over;
  Object.keys(over).forEach(k => {
    out[k] = isObj(base[k]) && isObj(over[k]) ? deepMerge(base[k], over[k]) : over[k];
  });
  return out;
}

function defaultAnswerNote() {
  return {
    heading: "Answer in the form of a question",
    body: `Classic quiz-show rules: phrase every answer as a question — <b>"What is…?"</b> or <b>"Who is…?"</b>`,
    example: `e.g. "The 16th U.S. President" → "Who is Lincoln?"`,
  };
}
function defaultRuleItems(cfg) {
  const d = cfg.timers.direct, pct = Math.round(cfg.scoring.stealPenaltyRatio * 100);
  return [
    { num: "1", text: `Teams on their turn pick a category and a points value. <small>Higher value = tougher question.</small>` },
    { num: "2", text: `Direct question: answer within <b>${d}</b> seconds. No penalty for a wrong guess.` },
    { num: "3", text: `Miss it and it bounces to the other teams in order to steal. A wrong first steal <b>costs</b> that team <b>${pct}%</b> of the value; steals after that carry no penalty.` },
    { num: "4", text: `Some questions carry a <b>bonus</b> — free to attempt, no penalty.` },
    { num: "★", text: `Trash-talk? <b>Totally allowed.</b>` },
  ];
}

function normalizeConfig(raw) {
  const cfg = deepMerge(DEFAULTS, raw);
  cfg.meta.pageTitle = cfg.meta.pageTitle || `${cfg.meta.title} ${cfg.meta.titleAccent}`.trim();
  cfg.rules.answerNote = cfg.rules.answerNote || defaultAnswerNote();
  cfg.rules.items = cfg.rules.items || defaultRuleItems(cfg);
  cfg.teams.presets = cfg.teams.presets || [];
  cfg.celebrations.songs = cfg.celebrations.songs || [];
  return cfg;
}

/* ============ shell markup — the whole body, built from config ============ */
function buildShell(cfg) {
  const m = cfg.meta;
  const brand = `${m.title} ${m.titleAccent}`;
  const brandRich = `${m.title} <b>${m.titleAccent}</b>`;
  const brandIcon = m.logo
    ? `<img class="brandlogo" src="${esc(m.logo)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'dot'}))">`
    : `<span class="dot"></span>`;
  const rulesSub = [m.editionLine, m.author ? `<span class="rby">board by ${esc(m.author)}</span>` : ""]
    .filter(Boolean).join(" · ");
  const an = cfg.rules.answerNote;
  const rulesLis = cfg.rules.items.map(it =>
    `<li class="rule"><span class="num">${it.num}</span><span class="txt">${it.text}</span></li>`).join("\n        ");
  const presetBtns = (cfg.teams.presets || []).map(p =>
    `<button class="abtn" data-preset="${esc(p.key)}">Preset: ${p.label || p.key}</button>`).join("\n      ");

  return `
  <div id="app">
    <header>
      <div class="brand">
        <span class="mark">${brandIcon}${brand}</span>
        <span class="sub">${m.subtitle}</span>
      </div>
      <div class="spacer"></div>
      <button class="hbtn" onclick="toggleRules(); this.blur()">Rules · ?</button>
      <button class="hbtn" id="avBtn">AV Test 🔊</button>
      <button class="hbtn" onclick="toggleSettings()">⚙ Settings · G</button>
      <button class="hbtn" onclick="openWinner(); this.blur()">🏆 Winner · W</button>
      <button class="hbtn warn" onclick="resetGame()">Reset</button>
    </header>

    <div id="board"></div>
    <div id="rail"></div>
  </div>

  <!-- ============ question overlay ============ -->
  <div id="overlay">
    <div class="ohead" id="oHead">
      <span class="ocat" id="oCat"></span>
      <span class="opts" id="oPts"></span>
      <span class="reviewTag">↺ already played · scores stay in sync</span>
      <span class="thud" id="tHud"><span class="ctl" id="tPaused">Space ⏯</span><span
          id="timerMode">direct</span><span id="timeLeft">–</span></span>
      <button class="hbtn oclose" onclick="closeOverlay()" title="Close (Esc)">✕</button>
    </div>

    <div id="ttrack">
      <div class="rail"></div>
      <div id="tfill"></div>
      <div id="car"></div>
    </div>

    <div class="osplit" id="oSplit">
      <div class="pane">
        <span class="plab">Question</span>
        <div class="center">
          <div class="oq" id="oQ"></div>
          <div class="clue" id="oClue"><b>Clue · </b><span id="oClueVal"></span></div>
          <div class="hostnote" id="oNote"></div>
          <div class="oaudio" id="oAudio">
            <button id="audioBtn" onclick="toggleAudio()">▶</button>
            <span class="meta" id="audioMeta">clip</span>
            <audio id="audioEl"></audio>
          </div>
        </div>
      </div>
      <div class="pane apane" id="aPane">
        <span class="plab">Answer</span>
        <div class="awaiting" id="aWait"><span class="glyph">?</span><span class="k">press A to reveal</span></div>
        <div class="arev" id="aRev">
          <div class="amedia">
            <div class="ytwrap" id="aYt"></div>
            <img id="aImg" class="hidden" alt="">
          </div>
          <div class="aval" id="aVal"></div>
        </div>
      </div>
      <div class="pane bpane" id="bqPane">
        <span class="plab">Bonus · +${cfg.scoring.bonusValue}</span>
        <div class="bwait" id="bqWait">hidden · press B</div>
        <div class="brev" id="bqRev">
          <div class="bq" id="oBQ"></div>
        </div>
      </div>
      <div class="pane bpane" id="baPane">
        <span class="plab">Bonus Answer</span>
        <div class="bwait" id="baWait">hidden · press N</div>
        <div class="brev" id="baRev">
          <div class="bval" id="oBA"></div>
        </div>
      </div>
    </div>

    <div class="ofoot">
      <div class="actions">
        <button class="abtn primary" onclick="revealAnswer()">Answer · A</button>
        <button class="abtn" id="btnClue" onclick="revealClue()">Clue · C</button>
        <button class="abtn" id="btnBonus" onclick="revealBonusQ()">Bonus · B</button>
        <button class="abtn" id="btnBonusA" onclick="revealBonusA()">Bonus Ans · N</button>
        <button class="abtn" id="btnClip" onclick="toggleAudio()">▶ Clip · M</button>
        <span class="legend"><b>Space</b> pause&nbsp;·&nbsp;<b>1–6</b> award&nbsp;·&nbsp;<b>⇧1–6</b>
          deduct&nbsp;·&nbsp;<b>M</b> clip</span>
      </div>
      <div class="award" id="awardMain"></div>
      <div class="award" id="awardBonus" style="display:none"></div>
    </div>
  </div>

  <!-- ============ rules modal ============ -->
  <div id="rules">
    <div class="rcard">
      <button class="hbtn mclose" onclick="closeRules()" title="Close (Esc)">✕</button>
      <h1>${brandRich}</h1>
      <div class="rsub">${rulesSub}</div>

      <div class="answer-note">
        <div class="h">${an.heading}</div>
        <p>${an.body}
          <span class="eg">${an.example}</span>
        </p>
      </div>

      <ul class="rules-list">
        ${rulesLis}
      </ul>

      <div class="rteams" id="rteamsWrap">
        <div class="rtrack" id="rteams"></div>
      </div>
    </div>
  </div>

  <!-- ============ winner celebration ============ -->
  <div id="winner" onclick="if(event.target===this) closeWinner()">
    <canvas id="confetti"></canvas>
    <div class="wcard">
      <div class="whead">${brandRich}</div>
      <div class="wsub">${m.editionLine}</div>
      <div class="wlabel">${cfg.winner.label}</div>
      <div class="wtop">
        <div class="wimgwrap" id="wImgWrap">
          <img id="wImg" alt="">
          <div id="wIni" class="wini" style="display:none"></div>
        </div>
        <div class="wmeta">
          <div class="wname" id="wName"></div>
          <div class="wscore" id="wScore"></div>
        </div>
      </div>
      <div class="wvideo" id="wVideo"></div>
    </div>
  </div>

  <!-- ============ settings drawer ============ -->
  <div id="settings">
    <button class="hbtn mclose" onclick="toggleSettings()" title="Close (Esc)">✕</button>
    <h2>Theme</h2>
    <div class="themePick" id="themePick"></div>
    <h2>Teams</h2>
    <div id="teamRows"></div>
    <div class="srow">
      <button class="abtn" onclick="addTeam()">+ Add team</button>
      ${presetBtns}
      <button class="abtn primary" onclick="toggleSettings()">Done</button>
    </div>
    <h2>Timers (seconds)</h2>
    <div class="numrow">direct <input type="number" id="cfgDirect" min="5" max="300"> &nbsp; steal <input
        type="number" id="cfgPass" min="5" max="300"></div>
    <h2>Timer marker</h2>
    <div class="markerPick" id="markerPick"></div>
    <h2>Winner song</h2>
    <div class="themePick" id="celebPick"></div>
    <div class="numrow">start <input type="number" id="cfgCelebStart" min="0" max="6000"> <span
        class="nrhint">seconds into the song</span></div>
    <h2>Notes</h2>
    <div style="font-size:.76rem; color:var(--ink-dim); line-height:1.6">
      Team logos load from <b>assets/</b>. Everything — scores, played squares, teams, theme, timers, winner song —
      auto-saves in this browser. Questions load from <b>config.js</b>; music clips load from <b>clips/</b>.
    </div>
  </div>`;
}

function showConfigError() {
  document.title = "game-nights — no config";
  document.body.innerHTML = `
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;
              font-family:system-ui,sans-serif; background:#060c18; color:#eef2f8; padding:2rem">
    <div style="max-width:32rem; text-align:center; line-height:1.6">
      <div style="font-size:2.4rem; margin-bottom:.6rem">🎲</div>
      <h1 style="font-size:1.4rem; margin:0 0 .6rem">No game config found</h1>
      <p style="color:#a0aec0; margin:0 0 1rem">
        This event has no <code>config.js</code> that sets
        <code>window.TRIVIA_CONFIG</code> with at least one category.
      </p>
      <p style="color:#596478; font-size:.85rem; margin:0">
        Copy <code>events/demo/</code> to start a new game — see the README.
      </p>
    </div>
  </div>`;
}

/* ============ persistence ============ */
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function load() {
  try {
    let raw = localStorage.getItem(KEY);
    // one-time migration from a pre-game-nights storage key
    if (raw == null && CFG.meta.legacyStorageKey) {
      const legacy = localStorage.getItem(CFG.meta.legacyStorageKey);
      if (legacy != null) { raw = legacy; localStorage.setItem(KEY, legacy); }
    }
    return raw == null ? null : JSON.parse(raw);
  } catch (e) { return null; }
}

/* ============ theme ============ */
function setTheme(key) { state.theme = key; document.body.dataset.theme = key; save(); renderThemePick(); }
function cycleTheme() {
  const i = THEME_LIST.findIndex(t => t.key === state.theme);
  setTheme(THEME_LIST[(i + 1) % THEME_LIST.length].key);
}
function renderThemePick() {
  const wrap = $("themePick"); wrap.innerHTML = "";
  THEME_LIST.forEach(t => {
    const b = document.createElement("button");
    b.className = state.theme === t.key ? "active" : "";
    b.innerHTML = `<span class="sw">${t.sw.map(c => `<i style="background:${c}"></i>`).join("")}</span>${t.label}`;
    b.onclick = () => setTheme(t.key);
    wrap.appendChild(b);
  });
}

/* ============ timer marker ============ */
function currentMarker() { return state.marker || (CFG.timers.marker) || "car"; }
function markerGlyph(m) {
  return m === "car" ? CAR_SVG : m === "clock" ? CLOCK_SVG : `<span class="memoji">${m}</span>`;
}
function renderMarker() {
  const el = $("car"); if (!el) return;
  const m = currentMarker();
  el.className = m === "car" ? "" : m === "clock" ? "asClock" : "asGlyph";
  el.innerHTML = markerGlyph(m);
}
function setMarker(m) { state.marker = m; save(); renderMarker(); renderMarkerPick(); }
function renderMarkerPick() {
  const wrap = $("markerPick"); if (!wrap) return; wrap.innerHTML = "";
  const cur = currentMarker();
  MARKER_OPTIONS.forEach(o => {
    const b = document.createElement("button");
    b.className = "mk" + (o.val === cur ? " active" : "") + (o.val === "clock" ? " asClock" : "");
    b.innerHTML = `<span class="g">${markerGlyph(o.val)}</span><span>${o.label}</span>`;
    b.onclick = () => setMarker(o.val);
    wrap.appendChild(b);
  });
}

/* ============ board ============ */
function renderBoard() {
  const board = $("board");
  board.style.gridTemplateColumns = `repeat(${CFG.categories.length}, 1fr)`;
  board.style.gridTemplateRows = `auto repeat(${ROWS}, minmax(0, 1fr))`;   // the stylesheet default assumes 5 rows
  board.innerHTML = "";
  CFG.categories.forEach((c, ci) => {
    const el = document.createElement("div");
    el.className = "cat"; el.style.animationDelay = `${ci * 55}ms`; el.textContent = c.cat;
    board.appendChild(el);
  });
  for (let qi = 0; qi < ROWS; qi++) {
    CFG.categories.forEach((c, ci) => {
      const clue = c.clues[qi];
      const el = document.createElement("div");
      if (!clue) {                                   // uneven categories → blank spacer keeps the grid aligned
        el.className = "cell"; el.style.visibility = "hidden"; el.style.pointerEvents = "none";
        board.appendChild(el); return;
      }
      const used = state.used[`${ci}-${qi}`];
      el.className = "cell" + (used ? " used" : "");
      el.style.animationDelay = `${(qi + 1) * 75 + ci * 55}ms`;
      el.innerHTML = `<span class="val">${clue.v}</span>`;
      el.title = used ? "Click: review · Shift-click: reopen as unplayed" : "";
      el.onclick = (e) => {
        if (e.shiftKey && state.used[`${ci}-${qi}`]) { delete state.used[`${ci}-${qi}`]; save(); }  // reopen a done square as fresh/active
        openClue(ci, qi);
      };
      board.appendChild(el);
    });
  }
}

/* ============ score rail ============ */
function renderRail() {
  const rail = $("rail"); rail.innerHTML = "";
  state.teams.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "team"; el.style.setProperty("--tc", t.color);
    const initials = (t.name.match(/\b\w/g) || ["?"]).slice(0, 2).join("").toUpperCase();
    el.innerHTML = `
      <img class="tlogo" src="${esc(t.logo || "")}" alt="" data-ini="${initials}"
           onerror="this.classList.add('hidden'); this.replaceWith(Object.assign(document.createElement('div'),{className:'tlogo hidden',style:this.style.cssText,textContent:'${initials}'}))">
      <div class="tinfo">
        <span class="tname">${esc(t.name)}</span>
        <div class="row">
          <span class="score${t.score < 0 ? " neg" : ""}" title="Click to type an exact score" onclick="editScore(${i})">${t.score}</span>
          <button class="adj" title="-100" onclick="bump(${i},-100)">−</button>
          <button class="adj" title="+100" onclick="bump(${i},100)">+</button>
        </div>
      </div>`;
    el.querySelector(".tlogo").style.setProperty("--tc", t.color);
    rail.appendChild(el);
  });
}
function bump(i, d) { state.teams[i].score += d; save(); renderRail(); }
// Click a team's score to set it to any exact value (e.g. +100 per mascot named).
function editScore(i) {
  const card = $("rail").children[i];
  const sc = card.querySelector(".score");
  if (!sc) return;
  const inp = document.createElement("input");
  inp.type = "number"; inp.className = "scoreEdit"; inp.value = state.teams[i].score;
  inp.style.setProperty("--tc", state.teams[i].color);
  sc.replaceWith(inp); inp.focus(); inp.select();
  const commit = () => { const v = parseInt(inp.value, 10); if (!isNaN(v)) state.teams[i].score = v; save(); renderRail(); };
  inp.addEventListener("blur", commit);
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "Escape") { renderRail(); }
  });
}

/* ============ overlay ============ */
function openClue(ci, qi) {
  const key = `${ci}-${qi}`;
  const clue = CFG.categories[ci].clues[qi];
  const review = !!state.used[key];
  current = { ci, qi, clue, key, review, revealed: false };

  state.awarded[key] = state.awarded[key] || { main: {}, bonus: {} };
  awards = state.awarded[key].main;
  bonusAwards = state.awarded[key].bonus;

  $("oHead").classList.toggle("review", review);
  $("oCat").textContent = CFG.categories[ci].cat;
  $("oPts").textContent = clue.v + " PTS";
  $("oQ").innerHTML = fmt(clue.q, true);
  $("oNote").textContent = clue.note || "";

  $("oClue").classList.remove("shown");
  $("oClueVal").innerHTML = fmt(clue.clue || "", true);
  $("btnClue").style.display = clue.clue ? "" : "none";

  // answer pane
  $("aPane").classList.remove("revealed");
  $("aWait").style.display = "";
  $("aRev").classList.remove("shown");
  $("aVal").innerHTML = fmt(clue.a, false);
  const yt = $("aYt"); yt.innerHTML = ""; yt.classList.remove("on");
  const img = $("aImg"); img.classList.add("hidden"); img.removeAttribute("src");
  $("aRev").classList.toggle("noMedia", !(clue.img || clue.yt));
  if (clue.img && !clue.yt) {
    img.onerror = () => img.classList.add("hidden");
    img.onload = () => img.classList.remove("hidden");
    img.src = clue.img;
  }

  // bonus
  const hasBonus = !!clue.b;
  $("oSplit").classList.toggle("hasBonus", hasBonus);
  $("bqPane").style.display = hasBonus ? "" : "none";
  $("baPane").style.display = hasBonus ? "" : "none";
  $("btnBonus").style.display = hasBonus ? "" : "none";
  $("btnBonusA").style.display = "none";
  if (hasBonus) {
    $("bqWait").style.display = ""; $("bqRev").classList.remove("shown"); $("oBQ").innerHTML = fmt(clue.b, true);
    $("baWait").style.display = ""; $("baRev").classList.remove("shown"); $("oBA").innerHTML = fmt(clue.bA || "", false);
  }
  $("awardBonus").style.display = "none";

  setupAudio(clue);
  $("btnClip").style.display = (clue.audio || (clue.ytAudio && clue.ytAudio.id)) ? "" : "none";
  renderAwards();
  $("overlay").classList.add("open");
  if (review) stopTimer(); else startPhase("direct");
}

function revealAnswer() {
  if (current) current.revealed = true;   // revealing the answer (A) is what marks the square done on close
  $("aWait").style.display = "none";
  $("aRev").classList.add("shown");
  $("aPane").classList.add("revealed");
  const yt = $("aYt");
  if (current?.clue.yt && !yt.firstChild) {
    stopAudio();
    const { id, start } = current.clue.yt;
    yt.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?start=${start || 0}&autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    yt.classList.add("on");
  }
}
function revealClue() { if (current?.clue.clue) $("oClue").classList.add("shown"); }
function revealBonusQ() {
  if (!current?.clue.b) return;
  $("bqWait").style.display = "none"; $("bqRev").classList.add("shown");
  $("btnBonusA").style.display = ""; $("awardBonus").style.display = ""; renderAwards();
}
function revealBonusA() {
  if (!current?.clue.b) return;
  if (!$("bqRev").classList.contains("shown")) revealBonusQ();
  $("baWait").style.display = "none"; $("baRev").classList.add("shown");
}
function closeOverlay() {
  if (!current) return;
  stopAudio(); stopTimer();
  $("aYt").innerHTML = "";
  if (current.revealed) state.used[current.key] = true;   // closing without revealing the answer leaves the square OPEN
  save();
  current = null;
  $("overlay").classList.remove("open");
  renderBoard();
}

/* Auto-format clue/answer text:
   • «word», <<word>> or *word*  → highlighted key term  (so you never see raw « » again)
   • this / these / those / here  → auto-highlighted quiz-show pointer (only when kw=true)
   • plain text & inline HTML (<em>…</em>, <b>…</b>, <br>) also work. */
function fmt(s, kw) {
  s = String(s ?? "")
    .replace(/«([^»]+)»/g, '<span class="hl">$1</span>')
    .replace(/<<([^<>]+)>>/g, '<span class="hl">$1</span>')
    .replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
  if (kw) s = s.replace(/\b(this|these|those|here)\b/gi, '<span class="kw">$1</span>');
  return s;
}

/* ============ awards (± marking, persisted per square) ============ */
function renderAwards() {
  if (!current) return;
  const v = current.clue.v;
  buildAwardRow($("awardMain"), awards, v, `+${v} / −${Math.round(v * STEAL_RATIO)} →`, true);
  buildAwardRow($("awardBonus"), bonusAwards, BONUS_VALUE, `bonus +${BONUS_VALUE} →`, false);
}
// allowNeg=false → this row is positive-only (used for the bonus: a passed bonus carries no penalty)
function buildAwardRow(rowEl, map, val, label, allowNeg) {
  rowEl.innerHTML = `<span class="alab">${label}</span>`;
  state.teams.forEach((t, i) => {
    const b = document.createElement("button");
    const s = map[i] || 0;
    b.className = "chip" + (s > 0 ? " plus" : s < 0 ? " minus" : "");
    b.style.setProperty("--tc", t.color);
    b.textContent = (s > 0 ? "+" : s < 0 ? "−" : "") + t.name;
    b.onclick = (e) => toggleAward(map, i, val, (allowNeg && e.shiftKey) ? -1 : 1);
    rowEl.appendChild(b);
  });
}
// award the full value, but a deduction (wrong steal) is only stealPenaltyRatio of the value
function awardDelta(dir, val) { return dir > 0 ? val : -Math.round(val * STEAL_RATIO); }
function toggleAward(map, i, val, dir) {
  const prev = map[i] || 0;
  if (prev) state.teams[i].score -= awardDelta(prev, val);
  map[i] = (prev === dir) ? 0 : dir;
  if (map[i]) state.teams[i].score += awardDelta(map[i], val);
  else delete map[i];
  save(); renderRail(); renderAwards();
}

/* ============ audio — local mp3 preferred, YouTube snippet fallback ============ */
function setupAudio(clue) {
  // hard reset any prior playback (mp3 + yt snippet)
  if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
  if (ytAudioTimer) { clearTimeout(ytAudioTimer); ytAudioTimer = null; }
  if (ytAudioFrame) { ytAudioFrame.remove(); ytAudioFrame = null; }
  audioMode = null; ytClip = null;

  const box = $("oAudio"), meta = $("audioMeta"), btn = $("audioBtn");
  const hasFile = !!clue.audio;
  const hasYt = !!(clue.ytAudio && clue.ytAudio.id);
  if (!hasFile && !hasYt) { box.classList.remove("shown"); return; }

  box.classList.add("shown");
  meta.className = "meta"; btn.textContent = "▶";
  ytClip = hasYt ? clue.ytAudio : null;

  if (hasFile) {
    audioMode = "file";
    meta.textContent = "clip";                       // generic label — never leak the filename (it names the song)
    audioEl.src = clue.audio;
    audioEl.onerror = () => {                         // local file absent (e.g. public deploy) → fall back to YouTube snippet
      if (hasYt) { audioMode = "yt"; meta.className = "meta"; meta.textContent = "clip · YouTube"; }
      else { meta.className = "meta missing"; meta.textContent = "clip · file missing"; }
    };
    audioEl.onended = () => { btn.textContent = "▶"; };
  } else {
    audioMode = "yt";
    meta.textContent = "clip · YouTube";
    audioEl.removeAttribute("src");
  }
}
function toggleAudio() {
  if (audioMode === "yt") { toggleYtAudio(); return; }
  if (!audioEl || !audioEl.src) { if (ytClip) toggleYtAudio(); return; }
  const btn = $("audioBtn");
  if (audioEl.paused) { audioEl.play().catch(() => { }); btn.textContent = "⏸"; }
  else { audioEl.pause(); btn.textContent = "▶"; }
}
function toggleYtAudio() {
  if (!ytClip) return;
  if (ytAudioFrame) { stopYtAudio(); return; }
  const btn = $("audioBtn"), meta = $("audioMeta");
  const { id, start, duration } = ytClip;
  const holder = document.createElement("div");
  // present + audible but visually out of the way (a covered snippet player)
  holder.style.cssText = "position:fixed; left:8px; bottom:8px; width:180px; height:101px; opacity:.02; pointer-events:none; z-index:60; overflow:hidden; border-radius:8px";
  holder.innerHTML = `<iframe width="180" height="101"
      src="https://www.youtube-nocookie.com/embed/${id}?start=${start || 0}&autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1"
      allow="autoplay; encrypted-media" frameborder="0"></iframe>`;
  document.body.appendChild(holder);
  ytAudioFrame = holder;
  btn.textContent = "⏸"; meta.className = "meta playing"; meta.textContent = "🎵 playing…";
  if (duration) ytAudioTimer = setTimeout(stopYtAudio, duration * 1000);
}
function stopYtAudio() {
  if (ytAudioTimer) { clearTimeout(ytAudioTimer); ytAudioTimer = null; }
  if (ytAudioFrame) { ytAudioFrame.remove(); ytAudioFrame = null; }
  const btn = $("audioBtn"), meta = $("audioMeta");
  if (btn) btn.textContent = "▶";
  if (meta && audioMode === "yt") { meta.className = "meta"; meta.textContent = "clip · YouTube"; }
}
function stopAudio() {
  if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
  const b = $("audioBtn"); if (b) b.textContent = "▶";
  stopYtAudio();
}

/* ============ timer — automatic: direct → steal ============ */
function startPhase(phase) {
  if (timer.int) clearInterval(timer.int);
  const secs = phase === "direct" ? state.cfg.direct : state.cfg.pass;
  timer = { phase, total: secs * 1000, elapsed: 0, last: performance.now(), int: null, paused: false };
  const track = $("ttrack"), hud = $("tHud");
  track.classList.remove("expired"); track.classList.add("running");
  track.classList.toggle("pass", phase === "pass");
  hud.classList.toggle("pass", phase === "pass");
  hud.classList.remove("urgent", "paused", "expired");
  $("timerMode").textContent = phase === "direct" ? "direct" : "steal";
  paintTimer();
  timer.int = setInterval(tickTimer, 100);
}
function tickTimer() {
  const now = performance.now();
  if (!timer.paused) timer.elapsed += now - timer.last;
  timer.last = now;
  if (timer.elapsed >= timer.total) { phaseEnd(); return; }
  paintTimer();
}
function paintTimer() {
  const p = Math.min(1, timer.elapsed / timer.total);
  const track = $("ttrack"), car = $("car");
  const dist = Math.max(0, track.clientWidth - car.getBoundingClientRect().width);
  car.style.transform = `translateX(${p * dist}px)`;
  $("tfill").style.width = (p * 100) + "%";
  const left = Math.max(0, Math.ceil((timer.total - timer.elapsed) / 1000));
  $("timeLeft").textContent = left;
  $("tHud").classList.toggle("urgent", left <= 5);
}
function phaseEnd() {
  clearInterval(timer.int); timer.int = null;
  $("tfill").style.width = "100%"; $("timeLeft").textContent = 0;
  $("ttrack").classList.add("expired"); $("tHud").classList.add("expired");
  beep();
  if (timer.phase === "direct") {
    $("timerMode").textContent = "time! → steal";
    const token = current;
    timer.phase = "gap";
    setTimeout(() => { if (current && current === token && timer.phase === "gap") startPhase("pass"); }, 1400);
  } else {
    $("timerMode").textContent = "time!";
    timer.phase = null;
    $("ttrack").classList.remove("running");
  }
}
function pauseTimer() {
  if (!timer.int) return;
  timer.paused = !timer.paused;
  $("tHud").classList.toggle("paused", timer.paused);
}
function stopTimer() {
  if (timer.int) { clearInterval(timer.int); timer.int = null; }
  timer.phase = null;
  $("ttrack").classList.remove("running", "pass", "expired");
  $("tHud").classList.remove("pass", "urgent", "paused", "expired");
  $("car").style.transform = "translateX(0)"; $("tfill").style.width = "0%";
  $("timerMode").textContent = "direct"; $("timeLeft").textContent = "–";
}
function beep() {
  try {
    const ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
    [0, .22].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square"; o.frequency.value = 660;
      g.gain.setValueAtTime(.1, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + t + .18);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + .2);
    });
  } catch (e) { }
}

/* ============ rules ============ */
function openRules() { $("rules").classList.add("open"); requestAnimationFrame(renderRulesTeams); }
function closeRules() { $("rules").classList.remove("open"); }
function toggleRules() { $("rules").classList.contains("open") ? closeRules() : openRules(); }
function teamTile(t) {
  const el = document.createElement("div");
  el.className = "rteam"; el.style.setProperty("--tc", t.color);
  el.innerHTML = `<img src="${esc(t.logo || "")}" alt="${esc(t.name)}"
      onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'rini',textContent:'${esc(t.name)}'}))">`;
  return el;
}
function renderRulesTeams() {
  const track = $("rteams"), wrap = $("rteamsWrap"); if (!track || !wrap) return;
  track.innerHTML = ""; wrap.classList.remove("marquee");
  state.teams.forEach(t => track.appendChild(teamTile(t)));
  // one row; if it overflows the card, duplicate the set and auto-scroll it as a seamless carousel
  if (track.scrollWidth > wrap.clientWidth + 2) {
    state.teams.forEach(t => track.appendChild(teamTile(t)));
    wrap.classList.add("marquee");
  }
}

/* ============ winner celebration ============ */
function openWinner() {
  if (!state.teams.length) return;
  // auto-pick the highest score
  let top = 0;
  state.teams.forEach((t, i) => { if (t.score > state.teams[top].score) top = i; });
  const t = state.teams[top];
  document.querySelector(".wcard").style.setProperty("--tc", t.color);
  const img = $("wImg"), ini = $("wIni");
  const initials = (t.name.match(/\b\w/g) || ["?"]).slice(0, 2).join("").toUpperCase();
  ini.textContent = initials; ini.style.setProperty("--tc", t.color);
  if (t.logo) {
    img.classList.remove("hidden"); ini.style.display = "none";
    img.onerror = () => { img.classList.add("hidden"); ini.style.display = ""; };
    img.src = t.logo;
  } else { img.classList.add("hidden"); ini.style.display = ""; }
  $("wName").textContent = t.name;
  $("wScore").textContent = t.score + " pts";
  const key = CELEBS[state.celebration] ? state.celebration : DEFAULT_CELEB;
  const c = CELEBS[key];
  $("wVideo").innerHTML = c
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${c.yt}?start=${celebStartFor(key) || 0}&autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
    : "";
  $("winner").classList.add("open");
  startConfetti();
}
function closeWinner() { $("winner").classList.remove("open"); $("wVideo").innerHTML = ""; stopConfetti(); }
function startConfetti() {
  const cv = $("confetti"), ctx = cv.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  const colors = state.teams.map(t => t.color).concat(["#f5c542", "#4ade80", "#ffffff"]);
  const ps = Array.from({ length: 170 }, (_, i) => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height - cv.height,
    w: (6 + Math.random() * 6) * dpr, h: (8 + Math.random() * 9) * dpr, c: colors[i % colors.length],
    vy: (2 + Math.random() * 4) * dpr, vx: (-1 + Math.random() * 2) * dpr, rot: Math.random() * 6, vr: (-.2 + Math.random() * .4)
  }));
  (function frame() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) {
      p.y += p.vy; p.x += p.vx; p.rot += p.vr;
      if (p.y > cv.height + 20) { p.y = -20; p.x = Math.random() * cv.width; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    confettiRAF = requestAnimationFrame(frame);
  })();
}
function stopConfetti() {
  if (confettiRAF) cancelAnimationFrame(confettiRAF); confettiRAF = null;
  const cv = $("confetti"); cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
}

/* ============ settings ============ */
function toggleSettings() {
  const s = $("settings");
  if (!s.classList.contains("open")) { renderThemePick(); renderMarkerPick(); renderCelebPick(); renderTeamRows(); $("cfgDirect").value = state.cfg.direct; $("cfgPass").value = state.cfg.pass; syncCelebStart(); }
  s.classList.toggle("open");
}
function renderCelebPick() {
  const wrap = $("celebPick"); if (!wrap) return; wrap.innerHTML = "";
  Object.entries(CELEBS).forEach(([key, c]) => {
    const b = document.createElement("button");
    b.className = state.celebration === key ? "active" : "";
    b.innerHTML = `<span style="font-size:1.1rem">${c.emoji || "🎵"}</span><span>${c.label}</span><span style="font-size:.62rem;color:var(--ink-dim)">${c.sub || ""}</span>`;
    b.onclick = () => { state.celebration = key; save(); renderCelebPick(); syncCelebStart(); };
    wrap.appendChild(b);
  });
}
// the winner song plays from this start time; editable in Settings, persisted per song
function celebStartFor(key) {
  return (state.celebStart && state.celebStart[key] != null) ? state.celebStart[key] : (CELEBS[key] ? (CELEBS[key].start || 0) : 0);
}
function syncCelebStart() {
  const inp = $("cfgCelebStart"); if (!inp) return;
  inp.value = celebStartFor(state.celebration);
}
function renderTeamRows() {
  const wrap = $("teamRows"); wrap.innerHTML = "";
  state.teams.forEach((t, i) => {
    const row = document.createElement("div"); row.className = "trow";
    row.innerHTML = `
      <input type="color" value="${t.color}">
      <input type="text" value="${esc(t.name)}">
      <input type="text" class="logoIn" value="${esc(t.logo || "")}" placeholder="logo path">
      <button class="adj del" title="remove">✕</button>`;
    const [color, name, logo, del] = row.children;
    color.oninput = e => { t.color = e.target.value; save(); renderRail(); };
    name.oninput = e => { t.name = e.target.value; save(); renderRail(); };
    logo.oninput = e => { t.logo = e.target.value; save(); renderRail(); };
    del.onclick = () => { if (state.teams.length <= 2) return; state.teams.splice(i, 1); save(); renderRail(); renderTeamRows(); };
    wrap.appendChild(row);
  });
}
function addTeam() {
  if (state.teams.length >= 8) return;
  state.teams.push({ name: `Team ${state.teams.length + 1}`, color: "#f4b340", logo: "", score: 0 });
  save(); renderRail(); renderTeamRows();
}
function applyPreset(key) {
  const preset = PRESET_LIST.find(p => p.key === key);
  if (!preset) return;
  if (!confirm(`Replace team names/colors/logos with the ${preset.confirmLabel || preset.label || preset.key} preset? (Scores kept by position.)`)) return;
  state.teams = PRESETS[key].map((t, i) => ({ ...t, score: state.teams[i]?.score ?? 0 }));
  save(); renderRail(); renderTeamRows();
}
function resetGame() {
  if (!confirm("Reset ALL scores, played squares and award history?")) return;
  state.used = {}; state.awarded = {};
  state.teams.forEach(t => t.score = 0);
  save(); renderBoard(); renderRail();
}

/* ============ boot ============ */
function boot() {
  CFG = normalizeConfig(window.TRIVIA_CONFIG);

  // derived engine values
  KEY = `gamenights:${CFG.meta.slug}:v${CFG.meta.version}`;
  ROWS = CFG.categories.reduce((n, c) => Math.max(n, c.clues.length), 0);
  BONUS_VALUE = CFG.scoring.bonusValue;
  STEAL_RATIO = CFG.scoring.stealPenaltyRatio;

  PRESET_LIST = CFG.teams.presets;
  PRESETS = {};
  PRESET_LIST.forEach(p => { PRESETS[p.key] = p.teams.map(t => ({ name: t.name, color: t.color, logo: t.logo })); });
  DEFAULT_PRESET = CFG.teams.default || (PRESET_LIST[0] && PRESET_LIST[0].key);

  CELEBS = {};
  CFG.celebrations.songs.forEach(s => { CELEBS[s.key] = { label: s.label, sub: s.sub, yt: s.yt, start: s.start, emoji: s.emoji }; });
  DEFAULT_CELEB = CFG.celebrations.default || (CFG.celebrations.songs[0] && CFG.celebrations.songs[0].key);

  // build the DOM, then grab element refs that live inside it
  document.title = CFG.meta.pageTitle;
  document.body.innerHTML = buildShell(CFG);
  audioEl = $("audioEl");

  // header AV-test + settings preset buttons (interpolated values → wired in JS, not inline onclick)
  const av = $("avBtn"); if (av) av.onclick = () => window.open(CFG.meta.avTestUrl, "_blank");
  document.querySelectorAll("#settings [data-preset]").forEach(b => { b.onclick = () => applyPreset(b.dataset.preset); });

  // state
  state = load() || {};
  const basePreset = PRESETS[DEFAULT_PRESET] || [];
  state.teams = state.teams || basePreset.map(t => ({ ...t, score: 0 }));
  state.used = state.used || {};
  state.cfg = state.cfg || { direct: CFG.timers.direct, pass: CFG.timers.steal };
  state.theme = state.theme || CFG.theme.default;
  if (!THEME_KEYS.includes(state.theme)) state.theme = CFG.theme.default;
  state.celebration = state.celebration || DEFAULT_CELEB;
  state.celebStart = state.celebStart || {};
  state.awarded = state.awarded || {};

  // keyboard + live number inputs
  document.addEventListener("input", e => {
    if (e.target.id === "cfgDirect") { state.cfg.direct = Math.max(5, +e.target.value || CFG.timers.direct); save(); }
    if (e.target.id === "cfgPass") { state.cfg.pass = Math.max(5, +e.target.value || CFG.timers.steal); save(); }
    if (e.target.id === "cfgCelebStart") { state.celebStart[state.celebration] = Math.max(0, Math.floor(+e.target.value || 0)); save(); }
  });
  document.addEventListener("keydown", onKeydown);

  document.body.dataset.theme = state.theme;
  renderMarker();
  renderBoard();
  renderRail();
  if (CFG.rules.openOnLoad) openRules();
}

function onKeydown(e) {
  if (e.target.tagName === "INPUT") return;
  if ($("winner").classList.contains("open")) { if (e.key === "Escape" || e.key === "Enter") closeWinner(); return; }
  if (e.key === "?" || e.key === "/") { toggleRules(); e.preventDefault(); return; }
  if ($("rules").classList.contains("open")) { if (e.key === "Escape" || e.key === "Enter") closeRules(); return; }

  const overlayOpen = $("overlay").classList.contains("open");
  if (!overlayOpen) {
    if (e.key.toLowerCase() === "y") cycleTheme();
    if (e.key.toLowerCase() === "g") toggleSettings();
    if (e.key.toLowerCase() === "w") openWinner();
    if (e.key === "Escape") $("settings").classList.remove("open");
    return;
  }
  switch (true) {
    case e.key === "Escape": closeOverlay(); break;
    case e.key.toLowerCase() === "a": revealAnswer(); break;
    case e.key.toLowerCase() === "c": revealClue(); break;
    case e.key.toLowerCase() === "b": revealBonusQ(); break;
    case e.key.toLowerCase() === "n": revealBonusA(); break;
    case e.key.toLowerCase() === "m": toggleAudio(); break;
    case e.key.toLowerCase() === "y": cycleTheme(); break;
    case e.key === " ": pauseTimer(); e.preventDefault(); break;
    case e.key.toLowerCase() === "t": startPhase("direct"); break;
    case e.key.toLowerCase() === "p": startPhase("pass"); break;
    case e.key.toLowerCase() === "s": stopTimer(); break;
    case /^[1-8!@#$%^&*]$/.test(e.key): {
      const sym = "!@#$%^&*".indexOf(e.key);
      const i = sym >= 0 ? sym : +e.key - 1;
      const neg = e.shiftKey || sym >= 0;
      if (i < state.teams.length) toggleAward(awards, i, current.clue.v, neg ? -1 : 1);
      break;
    }
  }
}

/* ============ go ============ */
if (window.TRIVIA_CONFIG && Array.isArray(window.TRIVIA_CONFIG.categories) && window.TRIVIA_CONFIG.categories.length) {
  boot();
} else {
  showConfigError();
}
