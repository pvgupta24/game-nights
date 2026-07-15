/* =====================================================================
   game-nights · team-cards engine
   =====================================================================
   Printable team badges — table tents (one page per team) and distribution
   slips (N small copies per team to hand out). Reads the SAME config as the
   board (window.TRIVIA_CONFIG.teams.presets): every team is {name, color,
   logo, tagline}; the board uses name/color/logo, these cards add tagline.

   An event's team-cards.html shell:
       <link rel="stylesheet" href="../../engine/team-cards.css">
       <script src="config.js"></script>
       <script src="config.local.js"></script>   <!-- optional -->
       <script src="../../engine/team-cards.js"></script>
   Print with the browser (Ctrl/Cmd+P) — @page rules make each tent fill a
   Letter page so the fold line lands on the centre.
   ===================================================================== */

const GEM = `<span class="gem"><svg viewBox="0 0 24 24"><path d="M12 0c.8 6 5.2 10.4 11.2 12-6 1.6-10.4 6-11.2 12-.8-6-5.2-10.4-11.2-12C6.8 10.4 11.2 6 12 0Z" fill="#4285F4"/></svg><span>Gemini</span></span>`;

let PRESETS = [], mode = "cards", theme = null;

function presetTeams(key) {
  const p = PRESETS.find(x => x.key === key);
  return p ? p.teams : [];
}

function setMode(m) {
  mode = m;
  document.getElementById("mCards").classList.toggle("active", m === "cards");
  document.getElementById("mSlips").classList.toggle("active", m === "slips");
  document.getElementById("copiesGrp").style.display = m === "slips" ? "" : "none";
  document.getElementById("tagGrp").style.display = m === "cards" ? "" : "none";
  render();
}
function setTheme(t) {
  theme = t;
  document.querySelectorAll("#themeBtns [data-preset]").forEach(b =>
    b.classList.toggle("active", b.dataset.preset === t));
  render();
}

function render() {
  const stage = document.getElementById("stage");
  const teams = presetTeams(theme);
  stage.className = mode === "cards" ? "tents" : "slips";
  stage.innerHTML = "";

  if (mode === "cards") {
    teams.forEach(t => {
      const el = document.createElement("div");
      el.className = "tent"; el.style.setProperty("--tc", t.color);
      el.innerHTML = `
        <div class="flap"><div class="foldnote">↓ fold under for a base ↓</div></div>
        <div class="top"><div class="foldnote">↓ fold in half here ↓</div></div>
        <div class="bottom">
          <div class="imgbox">
            <img src="${t.logo || ""}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'fallback',textContent:'${t.name}'}))">
            ${GEM}
          </div>
          ${t.tagline ? `<div class="tag">${t.tagline}</div>` : ""}
        </div>`;
      stage.appendChild(el);
    });
    document.getElementById("hint").textContent = "One page per team — image fills the lower half. Print, fold along the dashed centre line, and stand it on the table.";
  } else {
    const n = Math.max(1, Math.min(40, +document.getElementById("copies").value || 10));
    document.body.classList.add("print-hide-bands");
    teams.forEach(t => {
      const band = document.createElement("div");
      band.className = "teamband"; band.textContent = `${t.name} ×${n}`;
      stage.appendChild(band);
      for (let i = 0; i < n; i++) {
        const s = document.createElement("div");
        s.className = "slip"; s.style.setProperty("--tc", t.color);
        s.innerHTML = `<img src="${t.logo || ""}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'fallback',textContent:'${t.name}'}))">${GEM}`;
        stage.appendChild(s);
      }
    });
    document.getElementById("hint").textContent = `${n} slips per team (${n * teams.length} total). Print, cut along the dashed lines, shuffle, and hand one to each person to find their team.`;
  }
}

/* ============ boot ============ */
function boot() {
  const cfg = window.TRIVIA_CONFIG;
  const meta = cfg.meta || {};
  const brand = `${meta.title || "GAME"} ${meta.titleAccent || "NIGHT"}`.trim();
  document.title = `${brand} — Team Cards`;

  PRESETS = (cfg.teams && cfg.teams.presets) || [];
  theme = (cfg.teams && cfg.teams.default) || (PRESETS[0] && PRESETS[0].key);

  const themeBtns = PRESETS.map(p =>
    `<button data-preset="${p.key}"${p.key === theme ? ' class="active"' : ""}>${p.label || p.key}</button>`).join("");

  document.body.innerHTML = `
  <div class="toolbar">
    <h1>${brand} — CARDS</h1>
    <div class="grp">
      <button id="mCards" class="active" onclick="setMode('cards')">Table tents</button>
      <button id="mSlips" onclick="setMode('slips')">Distribution slips</button>
    </div>
    <div class="grp" id="themeBtns">${themeBtns}</div>
    <div class="grp" id="copiesGrp" style="display:none">
      <label>per team</label><input type="number" id="copies" value="10" min="1" max="40" onchange="render()">
    </div>
    <div class="grp" id="tagGrp">
      <label><input type="checkbox" id="tagChk" checked onchange="document.body.classList.toggle('notag', !this.checked)"> Taglines</label>
    </div>
    <div class="grp">
      <label><input type="checkbox" id="gemChk" onchange="document.body.classList.toggle('showgem', this.checked)"> Gemini credit</label>
    </div>
    <div class="grp"><button onclick="window.print()">🖨 Print</button></div>
    <div class="hint" id="hint"></div>
  </div>
  <div class="sheet"><div id="stage" class="tents"></div></div>`;

  document.querySelectorAll("#themeBtns [data-preset]").forEach(b => { b.onclick = () => setTheme(b.dataset.preset); });
  render();
}

function showCardsError() {
  document.title = "game-nights — team cards";
  document.body.innerHTML = `
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center;
              font-family:system-ui,sans-serif; background:#26282e; color:#eee; padding:2rem; text-align:center">
    <div style="max-width:30rem; line-height:1.6">
      <div style="font-size:2rem">🖨️</div>
      <h1 style="font-size:1.3rem; margin:.4rem 0">No teams to print</h1>
      <p style="color:#9aa0a8">This event's <code>config.js</code> has no
      <code>teams.presets</code>. Add at least one preset with a team roster.</p>
    </div>
  </div>`;
}

if (window.TRIVIA_CONFIG && window.TRIVIA_CONFIG.teams &&
    Array.isArray(window.TRIVIA_CONFIG.teams.presets) && window.TRIVIA_CONFIG.teams.presets.length) {
  boot();
} else {
  showCardsError();
}
