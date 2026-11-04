/* =====================================================================
   game-nights · quizdeck engine
   =====================================================================
   A round-by-round quiz, played like a slide deck: a cover, each round's
   title card and its questions one at a time, then the final standings.
   A round can also be a board (categories × values, like the quizboard)
   for a quiz-show segment inside the deck. One scoreboard runs across the
   whole game.

   Load order in an event's index.html (classic scripts, no modules/fetch →
   works on file://, `python -m http.server`, and GitHub Pages):

       <link rel="stylesheet" href="../../engine/quizboard.css">  <!-- themes + shared UI -->
       <link rel="stylesheet" href="../../engine/quizdeck.css">
       <script src="config.js"></script>        <!-- window.TRIVIA_CONFIG, meta.mode "quizdeck" -->
       <script src="config.local.js"></script>  <!-- optional private overlay -->
       <script src="../../engine/quizdeck.js"></script>

   Config reference: README → "Quizdeck mode".
   ===================================================================== */

/* ============ engine constants (kept in step with quizboard.js) ============ */
const THEME_LIST = [
  { key: "noir", label: "Stadium Noir", sw: ["#060c18", "#4ade80", "#f5c542"] },
  { key: "dusk", label: "Dusk Stadium", sw: ["#12091e", "#f87171", "#f5c542"] },
  { key: "day", label: "Day Game", sw: ["#f2f5f9", "#16a34a", "#b8860b"] },
  { key: "diya", label: "Diya Night", sw: ["#160b1e", "#f59e0b", "#f472b6"] },
];
const THEME_KEYS = THEME_LIST.map(t => t.key);

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
const MARKER_OPTIONS = [
  { val: "clock", label: "Clock" },
  { val: "car", label: "Car" },
  { val: "🏁", label: "Flag" },
  { val: "🚀", label: "Rocket" },
  { val: "🪔", label: "Diya" },
  { val: "⚡", label: "Bolt" },
  { val: "●", label: "Dot" },
];

const DEFAULTS = {
  meta: {
    slug: null,             // REQUIRED: localStorage namespace + gallery link
    version: 1,
    mode: "quizdeck",
    pageTitle: null,        // browser tab; defaults to "<title> <titleAccent>"
    title: "GAME",
    titleAccent: "NIGHT",
    logo: null,
    author: null,
    subtitle: "",
    editionLine: "",
    date: "",
    avTestUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  timers: { question: 45, steal: 0, marker: "clock" },   // per round: round.timer / round.steal; 0 = no clock
  scoring: { points: 100, stealPenaltyRatio: 0.5 },      // default points per question; a deduction costs this fraction
  flow: { revealOnNext: false },                         // true: → shows the answer before moving on (A always does)
  theme: { default: "noir" },
  rounds: [],
  teams: { default: null, presets: [] },
  celebrations: { default: null, songs: [] },
  ytStarts: {},           // { videoId: seconds } answer-video starts that win over a question's yt.start (Settings → copy)
  rules: { openOnLoad: true, answerNote: null, items: null },
  winner: { label: "🏆 Champions!!" },
};

/* ============ module state (assigned in boot) ============ */
let CFG, KEY, SLIDES, STEAL_RATIO;
let PRESET_LIST, PRESETS, DEFAULT_PRESET;
let CELEBS, DEFAULT_CELEB;
let state, current = null;
let showing = false;   // answer visible on the current visit; every visit opens on the question side
let audioEl, audioMode = null, ytClip = null, ytAudioFrame = null, ytAudioTimer = null, ytClipHandle = null;
let answerYt = null, winnerYt = null, answerVideo = null;   // answerVideo: the upload actually showing   // YouTube players (engine/youtube.js) for the answer video and the winner song
let timer = { phase: null, total: 0, elapsed: 0, last: 0, int: null, paused: false };
let confettiRAF = null;

const $ = id => document.getElementById(id);
function esc(s) { const d = document.createElement("div"); d.textContent = s ?? ""; return d.innerHTML; }
const list = v => v == null ? [] : [].concat(v);

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

function defaultAnswerNote(cfg) {
  return {
    heading: "Round by round",
    body: `${cfg.rounds.length} rounds, one running scoreboard. Points go up after every answer.`,
    example: `Part of an answer right? Half marks.`,
  };
}
function defaultRuleItems(cfg) {
  return [
    { num: "1", text: `Questions go to each team in turn. <small>Answer before the clock runs out.</small>` },
    { num: "2", text: `Miss it and it passes to the next team.` },
    { num: "3", text: `A board round works like a quiz board: pick a category and a value. A wrong steal costs <b>${Math.round(cfg.scoring.stealPenaltyRatio * 100)}%</b> of the value.` },
    { num: "★", text: `Trash-talk? <b>Totally allowed.</b>` },
  ];
}

function normalizeConfig(raw) {
  const cfg = deepMerge(DEFAULTS, raw);
  cfg.meta.pageTitle = cfg.meta.pageTitle || `${cfg.meta.title} ${cfg.meta.titleAccent}`.trim();
  cfg.rounds = (cfg.rounds || []).map(r => ({
    kind: "questions", blurb: "", questions: [], categories: [], ...r,
  }));
  cfg.rules.answerNote = cfg.rules.answerNote || defaultAnswerNote(cfg);
  cfg.rules.items = cfg.rules.items || defaultRuleItems(cfg);
  cfg.teams.presets = cfg.teams.presets || [];
  cfg.celebrations.songs = cfg.celebrations.songs || [];
  cfg.ytStarts = cfg.ytStarts || {};
  return cfg;
}

/* ============ the deck: slides, questions, keys ============ */
// cover → (round card → questions)… → standings; a board round is a single slide whose
// clues open on top of it (state.open) instead of sitting in the linear order.
function buildSlides() {
  const s = [{ type: "cover" }];
  CFG.rounds.forEach((r, ri) => {
    if (r.kind === "board") { s.push({ type: "board", ri }); return; }
    s.push({ type: "round", ri });
    r.questions.forEach((q, qi) => s.push({ type: "q", ri, qi }));
  });
  s.push({ type: "end" });
  return s;
}
function refKey(ref) { return ref.ci == null ? `${ref.ri}-${ref.qi}` : `${ref.ri}-${ref.ci}-${ref.qi}`; }
function clueOf(ref) {
  const r = CFG.rounds[ref.ri];
  return ref.ci == null ? r.questions[ref.qi] : r.categories[ref.ci].clues[ref.qi];
}
// a question's value: board clues carry v; deck questions their own points, the round's, or the default
function valueOf(ref) {
  const r = CFG.rounds[ref.ri], q = clueOf(ref);
  return q.v ?? q.points ?? r.points ?? CFG.scoring.points;
}
function activeRef() {
  if (state.open) return state.open;
  const s = SLIDES[state.pos];
  return s.type === "q" ? { ri: s.ri, qi: s.qi } : null;
}
function roundTimers(ri) {
  const r = CFG.rounds[ri];
  return { direct: r.timer ?? CFG.timers.question, pass: r.steal ?? CFG.timers.steal };
}
function questionCount(r) {
  return r.kind === "board" ? r.categories.reduce((n, c) => n + c.clues.length, 0) : r.questions.length;
}

/* ============ shell markup, built from config ============ */
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
  <div id="app" class="deck">
    <header>
      <div class="brand">
        <span class="mark">${brandIcon}${brand}</span>
        <span class="sub">${m.subtitle}</span>
      </div>
      <div class="spacer"></div>
      <button class="hbtn" onclick="toggleOverview(); this.blur()">Rounds · O</button>
      <button class="hbtn" onclick="toggleRules(); this.blur()">Rules · ?</button>
      <button class="hbtn" id="avBtn">AV Test 🔊</button>
      <button class="hbtn" onclick="toggleSettings()">⚙ Settings · G</button>
      <button class="hbtn" onclick="openWinner(); this.blur()">🏆 Winner · W</button>
      <button class="hbtn warn" onclick="resetGame()">Reset</button>
    </header>

    <div class="deckbar">
      <span class="dchip" id="dRound"></span>
      <span class="dpos" id="dPos"></span>
      <div class="dprog"><i id="dProg"></i></div>
      <span class="thud" id="tHud"><span class="ctl" id="tPaused">Space ⏯</span><span
          id="timerMode">direct</span><span id="timeLeft">0</span></span>
    </div>
    <div id="ttrack">
      <div class="rail"></div>
      <div id="tfill"></div>
      <div id="car"></div>
    </div>

    <div id="stage"></div>

    <div id="dfoot">
      <div class="awards award" id="awardRows"></div>
      <div class="dnav">
        <button class="abtn" onclick="prev()">← Back</button>
        <button class="abtn primary" id="nextBtn" onclick="next()">Next →</button>
        <button class="abtn" id="btnAns" onclick="revealAnswer()">Answer · A</button>
        <button class="abtn" id="btnClue" onclick="revealClue()">Clue · C</button>
        <button class="abtn" id="btnClip" onclick="toggleAudio()">▶ Clip · M</button>
        <span class="legend"><b>← →</b> move&nbsp;·&nbsp;<b>A</b> answer&nbsp;·&nbsp;<b>1-8</b> full&nbsp;·&nbsp;<b>Alt</b>
          half&nbsp;·&nbsp;<b>⇧</b> wrong&nbsp;·&nbsp;<b>O</b> rounds</span>
      </div>
    </div>

    <div id="rail"></div>
    <audio id="audioEl"></audio>
  </div>

  <!-- ============ rounds overview ============ -->
  <div id="overview" onclick="if(event.target===this) toggleOverview()">
    <div class="ocard">
      <button class="hbtn mclose" onclick="toggleOverview()" title="Close (Esc)">✕</button>
      <h2>Rounds</h2>
      <div id="ovList"></div>
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
      <div class="wvnote" id="wVidNote"></div>
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
    <h2>Timer marker</h2>
    <div class="markerPick" id="markerPick"></div>
    <h2>Winner song</h2>
    <div class="themePick" id="celebPick"></div>
    <div class="numrow">start <input type="number" id="cfgCelebStart" min="0" max="6000"> <span
        class="nrhint">seconds into the song</span></div>
    <h2>Answer video starts</h2>
    <div class="numrow"><button class="abtn" onclick="copyYtStarts()">Copy video starts</button>
      <span class="nrhint" id="ytStartsHint">nudge a video with [ ] while it plays</span></div>
    <textarea class="ytout" id="ytStartsOut" readonly hidden></textarea>
    <h2>Notes</h2>
    <div style="font-size:.76rem; color:var(--ink-dim); line-height:1.6">
      Use <b>← →</b> or a presenter clicker to move through the deck. Everything (scores, answers shown,
      teams, theme and winner song) auto-saves in this browser. Questions load from <b>config.js</b>.
    </div>
  </div>`;
}

function showConfigError() {
  document.title = "game-nights · no config";
  document.body.innerHTML = `
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;
              font-family:system-ui,sans-serif; background:#060c18; color:#eef2f8; padding:2rem">
    <div style="max-width:32rem; text-align:center; line-height:1.6">
      <div style="font-size:2.4rem; margin-bottom:.6rem">🎲</div>
      <h1 style="font-size:1.4rem; margin:0 0 .6rem">No game config found</h1>
      <p style="color:#a0aec0; margin:0 0 1rem">
        This event has no <code>config.js</code> that sets
        <code>window.TRIVIA_CONFIG</code> with at least one round.
      </p>
    </div>
  </div>`;
}

/* ============ persistence ============ */
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } }
function load() {
  try { const raw = localStorage.getItem(KEY); return raw == null ? null : JSON.parse(raw); }
  catch (e) { return null; }
}

/* ============ theme + timer marker ============ */
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
function currentMarker() { return state.marker || CFG.timers.marker || "clock"; }
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

/* ============ text + media helpers ============ */
/* «word», <<word>> or *word* → highlighted term; this/these/those/here → pointer (kw=true) */
function fmt(s, kw) {
  s = String(s ?? "")
    .replace(/«([^»]+)»/g, '<span class="hl">$1</span>')
    .replace(/<<([^<>]+)>>/g, '<span class="hl">$1</span>')
    .replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
  if (kw) s = s.replace(/\b(this|these|those|here)\b/gi, '<span class="kw">$1</span>');
  return s;
}
function imgsHtml(srcs) {
  return srcs.map(src => `<img src="${esc(src)}" alt="" onerror="this.remove()">`).join("");
}
function ytHtml() {
  return `<div class="ytwrap on" id="dqYt"></div><div class="ytnudge" id="dqNudge"></div>`;
}

/* ============ render ============ */
function renderAll() { renderBar(); renderStage(); renderFoot(); renderRail(); }
// moving between slides leaves the score rail alone: redrawing it would re-decode every team logo
function renderNav(motion) { renderBar(); renderStage(motion); renderFoot(); }

function renderBar() {
  const s = SLIDES[state.pos];
  const ri = s.ri;
  const r = ri != null ? CFG.rounds[ri] : null;
  $("dRound").textContent = r ? `Round ${ri + 1} · ${r.title}` : s.type === "end" ? "Final standings" : CFG.meta.editionLine || "Welcome";
  let pos = "";
  if (state.open) {
    const c = r.categories[state.open.ci];
    pos = `${c.cat} · ${c.clues[state.open.qi].v}`;
  } else if (s.type === "q") pos = `Q ${s.qi + 1} / ${r.questions.length}`;
  else if (s.type === "board") {
    const done = r.categories.reduce((n, c, ci) => n + c.clues.filter((_, qi) => state.revealed[refKey({ ri, ci, qi })]).length, 0);
    pos = `${done} / ${questionCount(r)} played`;
  }
  $("dPos").textContent = pos;
  $("dProg").style.width = (SLIDES.length > 1 ? state.pos / (SLIDES.length - 1) * 100 : 0) + "%";
  const ref = activeRef();
  const hasClock = ref && roundTimers(ref.ri).direct > 0;
  $("ttrack").classList.toggle("off", !hasClock);
  $("tHud").classList.toggle("off", !hasClock);
}

/* Slides cross-fade: the new one fades in on top of the old one (both share the stage's
   single grid cell), so the screen never flashes empty in between.
   motion: { dir: 1 | -1, calm } when moving; omit it to redraw in place with no animation.
   calm = coming back to a board from one of its clues, so its cells don't stagger in again. */
function reducedMotion() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
function renderStage(motion) {
  const st = $("stage");
  const ref = activeRef();
  const s = SLIDES[state.pos];
  const animate = !!motion && !reducedMotion();
  const html = ref ? questionHtml(ref)
    : s.type === "cover" ? coverHtml()
      : s.type === "round" ? roundHtml(s.ri)
        : s.type === "board" ? boardHtml(s.ri, animate && !motion.calm)
          : endHtml();
  const holder = document.createElement("div");
  holder.innerHTML = html.trim();
  const el = holder.firstElementChild;
  [...st.children].forEach(old => {
    if (!animate) { old.remove(); return; }
    // the outgoing copy keeps no ids or players, so lookups and sound only ever reach the new slide
    old.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
    old.querySelectorAll("iframe").forEach(f => f.remove());
    old.classList.remove("entering", "back");
    old.classList.add("leaving");
    setTimeout(() => old.remove(), 240);
  });
  if (animate) el.classList.add("entering", ...(motion.dir < 0 ? ["back"] : []));
  st.appendChild(el);
  if (s.type === "board" && !ref) wireBoard(s.ri, el);
}

function coverHtml() {
  const m = CFG.meta;
  const logo = m.logo ? `<img class="dcover-logo" src="${esc(m.logo)}" alt="" onerror="this.remove()">` : "";
  const rounds = CFG.rounds.map((r, i) => `<li><span>${i + 1}</span>${esc(r.title)}</li>`).join("");
  return `<div class="dslide dcover">
    ${logo}
    <h1>${m.title} <b>${m.titleAccent}</b></h1>
    <div class="dkicker">${m.editionLine}</div>
    <ol class="dcover-rounds">${rounds}</ol>
    <div class="dgo">Press → to begin</div>
  </div>`;
}

function roundHtml(ri) {
  const r = CFG.rounds[ri];
  const n = questionCount(r);
  const t = roundTimers(ri).direct;
  const bits = [`${n} question${n === 1 ? "" : "s"}`];
  if (r.points != null) bits.push(`${r.points} pts each`);
  if (t) bits.push(`${t} seconds each`);
  return `<div class="dslide dround${r.kind === "rapid" ? " rapid" : ""}">
    <div class="dkicker">Round ${ri + 1}${r.kind === "rapid" ? " · rapid fire" : ""}</div>
    <h2>${esc(r.title)}</h2>
    ${r.blurb ? `<p>${r.blurb}</p>` : ""}
    <div class="dmeta">${bits.join(" · ")}</div>
    <div class="dgo">Press → for the first question</div>
  </div>`;
}

// stagger = cells drop in one by one (arriving at the round); otherwise the board just appears
function boardHtml(ri, stagger) {
  const r = CFG.rounds[ri];
  const rows = r.categories.reduce((n, c) => Math.max(n, c.clues.length), 0);
  const delay = ms => stagger ? ` style="animation-delay:${ms}ms"` : "";
  const cats = r.categories.map((c, ci) => `<div class="cat"${delay(ci * 55)}>${esc(c.cat)}</div>`).join("");
  let cells = "";
  for (let qi = 0; qi < rows; qi++) {
    r.categories.forEach((c, ci) => {
      const clue = c.clues[qi];
      if (!clue) { cells += `<div class="cell" style="visibility:hidden"></div>`; return; }
      const used = state.revealed[refKey({ ri, ci, qi })];
      cells += `<div class="cell${used ? " used" : ""}" data-ci="${ci}" data-qi="${qi}"${delay((qi + 1) * 75 + ci * 55)}
        title="${used ? "Click: review · Shift-click: reopen as unplayed" : ""}"><span class="val">${clue.v}</span></div>`;
    });
  }
  return `<div class="dslide dboardwrap">
    ${r.blurb ? `<div class="dboard-blurb">${r.blurb}</div>` : ""}
    <div class="dboard${stagger ? "" : " calm"}" style="grid-template-columns:repeat(${r.categories.length},1fr);grid-template-rows:auto repeat(${rows},minmax(0,1fr))">${cats}${cells}</div>
  </div>`;
}
function wireBoard(ri, root) {
  root.querySelectorAll(".dboard .cell[data-ci]").forEach(el => {
    el.onclick = e => {
      const ref = { ri, ci: +el.dataset.ci, qi: +el.dataset.qi };
      if (e.shiftKey && state.revealed[refKey(ref)]) { delete state.revealed[refKey(ref)]; save(); }
      openBoardClue(ref);
    };
  });
}

function questionHtml(ref) {
  const r = CFG.rounds[ref.ri], q = clueOf(ref), key = refKey(ref);
  const shown = showing;
  const played = !!state.revealed[key];
  const eyebrow = ref.ci == null
    ? `${esc(r.title)} · Question ${ref.qi + 1} of ${r.questions.length}`
    : `${esc(r.categories[ref.ci].cat)}`;
  const pts = `${valueOf(ref)} pts`;
  const hasMedia = list(q.qImg).length || list(q.img).length || q.yt;
  const media = mediaHtml(q, shown);
  const multi = media.count > 1;
  return `<div class="dslide dq${hasMedia ? " withMedia" : ""}${shown ? " shown" : ""}">
    <div class="dq-main">
      <div class="dq-eyebrow"><span>${eyebrow}</span><span class="dq-pts">${pts}</span>${played ? `<span class="dq-played">↺ played</span>` : ""}</div>
      <div class="oq dq-q">${fmt(q.q, true)}</div>
      <div class="oaudio" id="oAudio">
        <button id="audioBtn" onclick="toggleAudio()">▶</button>
        <span class="meta" id="audioMeta">clip</span>
      </div>
      <div class="clue" id="oClue"><b>Clue · </b>${fmt(q.clue || "", true)}</div>
      ${q.note ? `<div class="hostnote">${esc(q.note)}</div>` : ""}
      <div class="dq-answer"><span class="plab">Answer</span><div class="aval">${fmt(q.a, false)}</div></div>
    </div>
    ${hasMedia ? `<div class="dq-media${multi ? " multi" : ""}" id="dqMedia">${media.html}</div>` : ""}
  </div>`;
}
// question images until the answer is shown, then the answer's video or images
function mediaHtml(q, shown) {
  if (shown && q.yt) return { html: ytHtml(), count: 0 };
  const aMedia = list(q.img), qMedia = list(q.qImg);
  const srcs = shown && aMedia.length ? aMedia : qMedia;
  return {
    html: srcs.length ? imgsHtml(srcs)
      : `<div class="awaiting"><span class="glyph">?</span><span class="k">press A to reveal</span></div>`,
    count: srcs.length,
  };
}

function endHtml() {
  const teams = state.teams.map((t, i) => ({ ...t, i })).sort((a, b) => b.score - a.score);
  const top = Math.max(1, ...teams.map(t => t.score));
  const rows = teams.map((t, n) => `<li style="--tc:${t.color}">
      <span class="pos">${n + 1}</span>
      <img src="${esc(t.logo || "")}" alt="" onerror="this.style.visibility='hidden'">
      <span class="nm">${esc(t.name)}</span>
      <span class="bar"><i style="width:${Math.max(0, t.score) / top * 100}%"></i></span>
      <span class="sc">${t.score}</span>
    </li>`).join("");
  return `<div class="dslide dend">
    <div class="dkicker">Final standings</div>
    <ol class="dstand">${rows}</ol>
    <div class="dgo">Press W to crown the winner</div>
  </div>`;
}

function renderFoot() {
  const ref = activeRef();
  $("dfoot").classList.toggle("onQ", !!ref);
  $("nextBtn").textContent = state.open ? "Back to board →"
    : ref && CFG.flow.revealOnNext && !showing ? "Show answer →" : "Next →";
  if (!ref) { $("awardRows").innerHTML = ""; return; }
  const q = clueOf(ref);
  $("btnClue").style.display = q.clue ? "" : "none";
  $("btnClip").style.display = (q.audio || (q.ytAudio && q.ytAudio.id)) ? "" : "none";
  renderAwards();
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
          <button class="adj" title="-10" onclick="bump(${i},-10)">−</button>
          <button class="adj" title="+10" onclick="bump(${i},10)">+</button>
        </div>
      </div>`;
    el.querySelector(".tlogo").style.setProperty("--tc", t.color);
    rail.appendChild(el);
  });
}
function bump(i, d) { state.teams[i].score += d; save(); renderRail(); refreshEnd(); }
function editScore(i) {
  const sc = $("rail").children[i].querySelector(".score");
  if (!sc) return;
  const inp = document.createElement("input");
  inp.type = "number"; inp.className = "scoreEdit"; inp.value = state.teams[i].score;
  inp.style.setProperty("--tc", state.teams[i].color);
  sc.replaceWith(inp); inp.focus(); inp.select();
  const commit = () => { const v = parseInt(inp.value, 10); if (!isNaN(v)) state.teams[i].score = v; save(); renderRail(); refreshEnd(); };
  inp.addEventListener("blur", commit);
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "Escape") { renderRail(); }
  });
}
function refreshEnd() { if (SLIDES[state.pos].type === "end" && !state.open) renderStage(); }   // in place, no fade

/* ============ awards: one row, a mark per team ============ */
// 1 = full value · 0.5 = half (Alt) · -1 = wrong, costing stealPenaltyRatio of the value (Shift)
function markFrom(e) { return e.shiftKey ? -1 : e.altKey ? 0.5 : 1; }
function renderAwards() {
  const ref = activeRef(); if (!ref) return;
  const v = valueOf(ref);
  const marks = state.awarded[refKey(ref)] || {};
  const row = $("awardRows");
  row.innerHTML = `<span class="alab">+${v} · ½ ${Math.round(v / 2)} · −${Math.round(v * STEAL_RATIO)} →</span>`;
  state.teams.forEach((t, i) => {
    const b = document.createElement("button");
    const s = marks[i] || 0;
    b.className = "chip" + (s === 1 ? " plus" : s > 0 ? " half" : s < 0 ? " minus" : "");
    b.style.setProperty("--tc", t.color);
    b.textContent = (s === 1 ? "+" : s > 0 ? "½ " : s < 0 ? "−" : "") + t.name;
    b.onclick = e => toggleAward(ref, i, markFrom(e));
    row.appendChild(b);
  });
}
function awardDelta(mark, val) { return mark > 0 ? Math.round(val * mark) : -Math.round(val * STEAL_RATIO); }
function toggleAward(ref, i, mark) {
  const val = valueOf(ref);
  const map = state.awarded[refKey(ref)] = state.awarded[refKey(ref)] || {};
  const prev = map[i] || 0;
  if (prev) state.teams[i].score -= awardDelta(prev, val);
  map[i] = (prev === mark) ? 0 : mark;
  if (map[i]) state.teams[i].score += awardDelta(map[i], val);
  else delete map[i];
  save(); renderRail(); renderAwards();
}

/* ============ navigation ============ */
function next() {
  if (state.open) { closeBoardClue(); return; }
  const ref = activeRef();
  if (ref && CFG.flow.revealOnNext && !showing) { revealAnswer(); return; }
  go(state.pos + 1);
}
function prev() {
  if (state.open) { closeBoardClue(); return; }
  go(state.pos - 1);
}
function go(i) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (i === state.pos && !state.open) return;
  const dir = i >= state.pos ? 1 : -1;
  leaveSlide();
  state.pos = i; state.open = null;
  save(); renderNav({ dir }); enterSlide();
}
function openBoardClue(ref) {
  leaveSlide();
  state.open = ref;
  save(); renderNav({ dir: 1 }); enterSlide();
}
function closeBoardClue() {
  leaveSlide();
  state.open = null;
  save(); renderNav({ dir: -1, calm: true });
}
function leaveSlide() {
  stopAudio(); stopTimer();
  if (answerYt) { answerYt.stop(); answerYt = null; answerVideo = null; }
  current = null; showing = false;
}
function enterSlide() {
  const ref = activeRef();
  if (!ref) return;
  current = { ref, key: refKey(ref) };
  setupAudio(clueOf(ref));
  if (!state.revealed[current.key] && roundTimers(ref.ri).direct > 0) startPhase("direct");
}

function revealAnswer() {
  const ref = activeRef(); if (!ref) return;
  const key = refKey(ref);
  if (showing) return;
  showing = true;
  state.revealed[key] = true;
  save();
  stopTimer();
  const q = clueOf(ref);
  if (q.yt) stopAudio();
  // update the slide in place (no redraw): show the answer, and swap in the answer's own media
  const slide = document.querySelector("#stage .dq:not(.leaving)");
  if (slide) {
    slide.classList.add("shown");
    const box = slide.querySelector(".dq-media");
    if (box && (q.yt || list(q.img).length)) {
      const m = mediaHtml(q, true);
      box.innerHTML = m.html; box.classList.toggle("multi", m.count > 1);
      if (q.yt) embedAnswerYt();
    }
  }
  renderBar(); renderFoot();
}

/* ============ answer-video start: nudge it live, keep it, copy it into config ============ */
// a nudged start (saved in this browser) wins over config ytStarts, which wins over the question's yt.start
function ytStart(yt) {
  const own = state.ytStart && state.ytStart[yt.id];
  return own != null ? own : (CFG.ytStarts[yt.id] ?? yt.start ?? 0);
}
// the clip's video and its backup uploads, each starting where it was nudged to; `first` jumps the queue
function ytQueue(yt, first) {
  const all = [yt, ...(yt.alts || [])].map(v => typeof v === "string" ? { id: v, start: 0 } : v)
    .map(v => ({ id: v.id, start: ytStart(v) }));
  if (first) all.sort((a, b) => (b.id === first) - (a.id === first));
  return all;
}
function mmss(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }
function embedAnswerYt(first) {
  const yt = current && clueOf(current.ref).yt, box = $("dqYt");
  if (!yt || !box) return;
  const [head, ...alts] = ytQueue(yt, first);
  if (answerYt) answerYt.stop();
  answerYt = ytMount(box, {
    id: head.id, start: head.start, alts,
    onStatus: (kind, text, video) => { answerVideo = video; renderYtNote(video, kind, text); },
  });
}
// under the answer video, only when something is wrong: why it isn't playing (the screen is the players' too)
function renderYtNote(video, kind, text) {
  const note = $("dqNudge"); if (!note) return;
  const bad = kind === "error" || kind === "stalled";
  if (!bad) { if (note.classList.contains("bad")) { note.className = "ytnudge"; note.innerHTML = ""; } return; }
  note.className = "ytnudge bad";
  note.innerHTML = `⚠ ${esc(text)} · <a href="${ytWatchUrl(video.id, video.start)}" target="_blank" rel="noopener">open on YouTube</a>`;
}
// a nudge says where the video now starts, then gets out of the way
let nudgeFlash = null;
function flashNudge(sec) {
  const note = $("dqNudge"); if (!note) return;
  note.className = "ytnudge"; note.textContent = `starts at ${mmss(sec)}`;
  clearTimeout(nudgeFlash);
  nudgeFlash = setTimeout(() => { if (!note.classList.contains("bad")) note.textContent = ""; }, 1500);
}
function nudgeYt(d) {
  const yt = current && showing && clueOf(current.ref).yt;
  if (!yt || !answerYt || !answerVideo) return;
  state.ytStart = state.ytStart || {};
  state.ytStart[answerVideo.id] = Math.max(0, answerVideo.start + d);
  save(); embedAnswerYt(answerVideo.id); flashNudge(state.ytStart[answerVideo.id]);
}
function copyYtStarts() {
  const own = state.ytStart || {};
  const text = `ytStarts: ${JSON.stringify({ ...CFG.ytStarts, ...own }, null, 2)},`;
  const out = $("ytStartsOut"), hint = $("ytStartsHint");
  out.value = text; out.hidden = false; out.select();
  const manual = () => { hint.textContent = "select the text below and copy it into config.js"; };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => { hint.textContent = `${Object.keys(own).length} nudged · copied, paste into config.js`; }, manual);
  } else manual();
}
function revealClue() { if (current && clueOf(current.ref).clue) $("oClue").classList.add("shown"); }

/* ============ rounds overview ============ */
function toggleOverview() {
  const o = $("overview");
  if (!o.classList.contains("open")) renderOverview();
  o.classList.toggle("open");
}
function renderOverview() {
  const wrap = $("ovList"); wrap.innerHTML = "";
  const addRow = (label, tiles) => {
    const row = document.createElement("div"); row.className = "ovrow";
    row.innerHTML = `<div class="ovlab">${label}</div>`;
    const t = document.createElement("div"); t.className = "ovtiles";
    tiles.forEach(x => t.appendChild(x));
    row.appendChild(t); wrap.appendChild(row);
  };
  const tile = (text, idx, done) => {
    const b = document.createElement("button");
    b.className = "otile" + (done ? " done" : "") + (state.pos === idx && !state.open ? " cur" : "");
    b.textContent = text;
    b.onclick = () => { toggleOverview(); go(idx); };
    return b;
  };
  addRow("Start", [tile("Cover", 0, false)]);
  CFG.rounds.forEach((r, ri) => {
    const tiles = [];
    SLIDES.forEach((s, idx) => {
      if (s.ri !== ri) return;
      if (s.type === "round") tiles.push(tile("Intro", idx, false));
      if (s.type === "q") tiles.push(tile(`Q${s.qi + 1}`, idx, !!state.revealed[refKey(s)]));
      if (s.type === "board") tiles.push(tile("Board", idx, false));
    });
    addRow(`${ri + 1} · ${esc(r.title)}`, tiles);
  });
  addRow("Finish", [tile("Standings", SLIDES.length - 1, false)]);
}

/* ============ audio: local mp3 preferred, YouTube snippet fallback ============ */
function setupAudio(clue) {
  if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
  if (ytAudioTimer) { clearTimeout(ytAudioTimer); ytAudioTimer = null; }
  if (ytClipHandle) { ytClipHandle.stop(); ytClipHandle = null; }
  if (ytAudioFrame) { ytAudioFrame.remove(); ytAudioFrame = null; }
  audioMode = null; ytClip = null;

  const box = $("oAudio"), meta = $("audioMeta"), btn = $("audioBtn");
  if (!box) return;
  const hasFile = !!clue.audio;
  const hasYt = !!(clue.ytAudio && clue.ytAudio.id);
  if (!hasFile && !hasYt) { box.classList.remove("shown"); return; }

  box.classList.add("shown");
  meta.className = "meta"; btn.textContent = "▶";
  ytClip = hasYt ? clue.ytAudio : null;

  if (hasFile) {
    audioMode = "file";
    meta.textContent = "clip";                       // generic label: never leak the filename (it names the song)
    audioEl.src = clue.audio;
    audioEl.onerror = () => {                         // local file absent → fall back to the YouTube snippet
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
  if (!$("audioBtn")) return;
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
  const { id, start, duration, alts } = ytClip;
  const holder = document.createElement("div");
  // present + audible but visually out of the way (a covered snippet player)
  holder.style.cssText = "position:fixed; left:8px; bottom:8px; width:180px; height:101px; opacity:.02; pointer-events:none; z-index:60; overflow:hidden; border-radius:8px";
  document.body.appendChild(holder);
  ytAudioFrame = holder;
  btn.textContent = "⏸";
  // the label follows what the player really does: loading → playing, or why it can't
  ytClipHandle = ytMount(holder, {
    id, start, alts, controls: false, stallText: "hasn't started: check the internet connection",
    onStatus: (kind, text, video) => {
      if (kind === "loading") { meta.className = "meta"; meta.textContent = "clip · loading…"; }
      else if (kind === "playing") {
        meta.className = "meta playing"; meta.textContent = "🎵 playing…";
        if (duration && !ytAudioTimer) ytAudioTimer = setTimeout(stopYtAudio, duration * 1000);   // count from the first sound
      } else if (kind === "error" || kind === "stalled") {
        if (kind === "error") stopYtAudio();
        meta.className = "meta missing";
        meta.innerHTML = `⚠ clip ${esc(text)} · <a href="${ytWatchUrl(video.id, video.start)}" target="_blank" rel="noopener">open on YouTube</a>`;
        btn.textContent = "▶";
      }
    },
  });
}
function stopYtAudio() {
  if (ytAudioTimer) { clearTimeout(ytAudioTimer); ytAudioTimer = null; }
  if (ytClipHandle) { ytClipHandle.stop(); ytClipHandle = null; }
  if (ytAudioFrame) { ytAudioFrame.remove(); ytAudioFrame = null; }
  const btn = $("audioBtn"), meta = $("audioMeta");
  if (btn) btn.textContent = "▶";
  if (meta && audioMode === "yt" && !meta.classList.contains("missing")) { meta.className = "meta"; meta.textContent = "clip · YouTube"; }
}
function stopAudio() {
  if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
  const b = $("audioBtn"); if (b) b.textContent = "▶";
  stopYtAudio();
}

/* ============ timer: direct, then an optional steal clock ============ */
function startPhase(phase) {
  if (!current) return;
  const t = roundTimers(current.ref.ri);
  const secs = phase === "direct" ? t.direct : t.pass;
  if (!secs) return;
  if (timer.int) clearInterval(timer.int);
  timer = { phase, total: secs * 1000, elapsed: 0, last: performance.now(), int: null, paused: false };
  const track = $("ttrack"), hud = $("tHud");
  track.classList.remove("expired"); track.classList.add("running");
  track.classList.toggle("pass", phase === "pass");
  hud.classList.toggle("pass", phase === "pass");
  hud.classList.remove("urgent", "paused", "expired");
  $("timerMode").textContent = phase === "direct" ? "time" : "steal";
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
  const steal = current && roundTimers(current.ref.ri).pass;
  if (timer.phase === "direct" && steal) {
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
  $("timerMode").textContent = "time";
  const ref = activeRef();
  $("timeLeft").textContent = ref ? roundTimers(ref.ri).direct : 0;
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
  if (track.scrollWidth > wrap.clientWidth + 2) {
    state.teams.forEach(t => track.appendChild(teamTile(t)));
    wrap.classList.add("marquee");
  }
}

/* ============ winner celebration ============ */
function openWinner() {
  if (!state.teams.length) return;
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
  stopAudio(); stopTimer();
  const key = CELEBS[state.celebration] ? state.celebration : DEFAULT_CELEB;
  const c = CELEBS[key];
  if (winnerYt) { winnerYt.stop(); winnerYt = null; }
  $("wVidNote").textContent = "";
  if (c) winnerYt = ytMount($("wVideo"), {
    id: c.yt, start: celebStartFor(key) || 0, alts: c.alts,
    onStatus: (kind, text) => { $("wVidNote").textContent = kind === "error" || kind === "stalled" ? `⚠ winner song ${text}` : ""; },
  });
  $("winner").classList.add("open");
  startConfetti();
}
function closeWinner() {
  $("winner").classList.remove("open");
  if (winnerYt) { winnerYt.stop(); winnerYt = null; }
  stopConfetti();
}
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
  if (!s.classList.contains("open")) { renderThemePick(); renderMarkerPick(); renderCelebPick(); renderTeamRows(); syncCelebStart(); }
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
    del.onclick = () => { if (state.teams.length <= 2) return; state.teams.splice(i, 1); save(); renderRail(); renderTeamRows(); renderFoot(); };
    wrap.appendChild(row);
  });
}
function addTeam() {
  if (state.teams.length >= 8) return;
  state.teams.push({ name: `Team ${state.teams.length + 1}`, color: "#f4b340", logo: "", score: 0 });
  save(); renderRail(); renderTeamRows(); renderFoot();
}
function applyPreset(key) {
  const preset = PRESET_LIST.find(p => p.key === key);
  if (!preset) return;
  if (!confirm(`Replace team names/colors/logos with the ${preset.confirmLabel || preset.label || preset.key} preset? (Scores kept by position.)`)) return;
  state.teams = PRESETS[key].map((t, i) => ({ ...t, score: state.teams[i]?.score ?? 0 }));
  save(); renderRail(); renderTeamRows(); renderFoot();
}
function resetGame() {
  if (!confirm("Reset ALL scores, answers shown and award history, and go back to the cover?")) return;
  leaveSlide();
  state.revealed = {}; state.awarded = {}; state.pos = 0; state.open = null;
  state.teams.forEach(t => t.score = 0);
  save(); renderAll(); enterSlide();
}

/* ============ boot ============ */
function boot() {
  CFG = normalizeConfig(window.TRIVIA_CONFIG);
  KEY = `gamenights:${CFG.meta.slug}:v${CFG.meta.version}`;
  STEAL_RATIO = CFG.scoring.stealPenaltyRatio;
  SLIDES = buildSlides();

  PRESET_LIST = CFG.teams.presets;
  PRESETS = {};
  PRESET_LIST.forEach(p => { PRESETS[p.key] = p.teams.map(t => ({ name: t.name, color: t.color, logo: t.logo })); });
  DEFAULT_PRESET = CFG.teams.default || (PRESET_LIST[0] && PRESET_LIST[0].key);

  CELEBS = {};
  CFG.celebrations.songs.forEach(s => { CELEBS[s.key] = { label: s.label, sub: s.sub, yt: s.yt, start: s.start, emoji: s.emoji, alts: s.alts }; });
  DEFAULT_CELEB = CFG.celebrations.default || (CFG.celebrations.songs[0] && CFG.celebrations.songs[0].key);

  document.title = CFG.meta.pageTitle;
  document.body.innerHTML = buildShell(CFG);
  audioEl = $("audioEl");

  const av = $("avBtn"); if (av) av.onclick = () => window.open(CFG.meta.avTestUrl, "_blank");
  document.querySelectorAll("#settings [data-preset]").forEach(b => { b.onclick = () => applyPreset(b.dataset.preset); });

  state = load() || {};
  const basePreset = PRESETS[DEFAULT_PRESET] || [];
  state.teams = state.teams || basePreset.map(t => ({ ...t, score: 0 }));
  state.pos = Math.min(Math.max(0, state.pos || 0), SLIDES.length - 1);
  state.open = state.open && SLIDES[state.pos].type === "board" && SLIDES[state.pos].ri === state.open.ri ? state.open : null;
  state.revealed = state.revealed || {};
  state.awarded = state.awarded || {};
  state.theme = THEME_KEYS.includes(state.theme) ? state.theme : CFG.theme.default;
  state.celebration = state.celebration || DEFAULT_CELEB;
  state.celebStart = state.celebStart || {};

  document.addEventListener("input", e => {
    if (e.target.id === "cfgCelebStart") { state.celebStart[state.celebration] = Math.max(0, Math.floor(+e.target.value || 0)); save(); }
  });
  document.addEventListener("keydown", onKeydown);

  document.body.dataset.theme = state.theme;
  renderMarker();
  renderAll();
  stopTimer();
  enterSlide();
  if (CFG.rules.openOnLoad) openRules();
}

function onKeydown(e) {
  if (e.target.tagName === "INPUT") return;
  // a focused button already handles its own Enter/Space as a click; don't also run the shortcut
  if (e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
  if ($("winner").classList.contains("open")) { if (e.key === "Escape" || e.key === "Enter") closeWinner(); return; }
  if (e.key === "?" || e.key === "/") { toggleRules(); e.preventDefault(); return; }
  if ($("rules").classList.contains("open")) { if (e.key === "Escape" || e.key === "Enter") closeRules(); return; }
  if ($("overview").classList.contains("open")) { if (e.key === "Escape" || e.key.toLowerCase() === "o") toggleOverview(); return; }
  if ($("settings").classList.contains("open")) { if (e.key === "Escape") toggleSettings(); return; }

  const k = e.key.toLowerCase();
  switch (true) {
    case e.key === "ArrowRight" || e.key === "PageDown" || e.key === "Enter": next(); e.preventDefault(); break;
    case e.key === "ArrowLeft" || e.key === "PageUp": prev(); e.preventDefault(); break;
    case e.key === "Escape": if (state.open) closeBoardClue(); break;
    case e.key === "Home": go(0); break;
    case e.key === "End": go(SLIDES.length - 1); break;
    case e.key === " ": pauseTimer(); e.preventDefault(); break;
    case k === "a": revealAnswer(); break;
    case k === "c": revealClue(); break;
    case k === "m": toggleAudio(); break;
    case k === "t": startPhase("direct"); break;
    case k === "p": startPhase("pass"); break;
    case k === "s": stopTimer(); break;
    case k === "o": toggleOverview(); break;
    case k === "g": toggleSettings(); break;
    case k === "w": openWinner(); break;
    case k === "y": cycleTheme(); break;
    case e.key === "[": nudgeYt(-10); break;
    case e.key === "]": nudgeYt(10); break;
    case e.key === "{": nudgeYt(-1); break;
    case e.key === "}": nudgeYt(1); break;
    case /^Digit[1-8]$/.test(e.code): {   // by key position, so Shift / Alt combos work on any layout
      const ref = activeRef(); if (!ref) break;
      const i = +e.code.slice(5) - 1;
      if (i < state.teams.length) toggleAward(ref, i, markFrom(e));
      e.preventDefault();
      break;
    }
  }
}

/* ============ go ============ */
if (window.TRIVIA_CONFIG && Array.isArray(window.TRIVIA_CONFIG.rounds) && window.TRIVIA_CONFIG.rounds.length) {
  boot();
} else {
  showConfigError();
}
