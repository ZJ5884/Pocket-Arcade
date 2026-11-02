/* ================= REGISTRY: lazy-loaded game modules, install state, launching ================= */
const LOADING = {}, READY = new Set();
function loadScript(src){
  if (LOADING[src]) return LOADING[src];
  return LOADING[src] = new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => ok();
    s.onerror = () => { delete LOADING[src]; no(new Error('Could not load ' + src)); };
    document.head.appendChild(s);
  });
}

/* Each catalog entry becomes a game object whose `fn` exists once its module has loaded. */
const games = CATALOG.map(c => { const g = Object.assign({}, c); Object.defineProperty(g, 'fn', { get: () => READY.has(c.file) ? globalThis[c.fnName] : undefined }); return g; });
const byId = id => games.find(g => g.id === id);
const isReady = g => READY.has(g.file);
const sizeKB = g => g.kb + (g.needs || []).reduce((s, n) => s + (SHARED_KB[n] || 0), 0);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function loadModule(g){
  for (const n of (g.needs || [])) await loadScript(n);
  await loadScript(g.file);
  READY.add(g.file);
}

/* "Installing" a game loads its module and adds it to the library. Everything is bundled, so it is quick. */
const installing = new Set();
async function install(g){
  if (installing.has(g.id)) return false;
  installing.add(g.id);
  const t0 = Date.now();
  try {
    await loadModule(g);
    const wait = 700 - (Date.now() - t0); if (wait > 0) await sleep(wait);
    setOwned(g.id, true); checkTrophies();
    return true;
  } catch (e) {
    toast('Could not install ' + g.name + '. Try again.');
    return false;
  } finally { installing.delete(g.id); }
}
function uninstall(g){ setOwned(g.id, false); DB.recent = DB.recent.filter(x => x !== g.id); save(); }
const ownedGames = () => games.filter(g => isOwned(g.id));

async function play(g){
  if (!g || !isOwned(g.id)) return;
  if (!isReady(g)) { try { await loadModule(g); } catch (e) { toast('Could not load ' + g.name + '. Try again.'); return; } }
  start(g);
}
async function preloadOwned(){
  for (const g of ownedGames()) { if (isReady(g)) continue; try { await loadModule(g); } catch (e) {} await sleep(30); }
}

/* ---------- playing ---------- */
let ac = null, playMark = 0;
function tickPlay(){
  if (!playMark || !current) return;
  const dt = clamp(Date.now() - playMark, 0, 1800000); playMark = Date.now();
  gs(current.id).ms += dt; DB.totals.ms += dt;
}
try { document.addEventListener('visibilitychange', () => { if (document.hidden) tickPlay(); else if (playMark) playMark = Date.now(); }); } catch (e) {}

function stop(){ tickPlay(); playMark = 0; if (ac) ac.abort(); ac = null; }
function onLevel(d){
  if (mode === 'play' && current) { const v = clamp(getLevel(current.id) + d, 0, 2); if (v !== getLevel(current.id)) { setLevel(current.id, v); start(current); } }
}
function start(g){
  stop(); current = g; mode = 'play'; over = false; cur = {}; closeModal();
  ac = new AbortController();
  const lv = getLevel(g.id), gsd = gs(g.id);
  gsd.plays++; gsd.last = Date.now(); DB.totals.plays++;
  DB.recent = [g.id].concat(DB.recent.filter(x => x !== g.id)).slice(0, 8);
  playMark = Date.now(); save();
  try { document.documentElement.style.background = CANVAS_BG; document.body.style.background = CANVAS_BG; } catch (e) {}
  stopPageTimers();
  $('#home').style.display = 'none';
  $('#game').style.display = 'flex';
  $('#game').className = 'enter';
  $('#gname').textContent = g.name;
  $('#lvl').innerHTML = LEVELS[lv] + ' <kbd>L1/R1</kbd>';
  $('#hud').textContent = '0';
  $('#best').textContent = getBest(g.id, lv);
  $('#over').style.display = 'none';
  $('#controls').innerHTML = g.controls.concat([['L1 / R1', 'Change level'], ['Start', 'Restart'], ['B', 'Back to library']])
    .map(c => '<li><kbd>' + c[0] + '</kbd><span>' + c[1] + '</span></li>').join('');
  $('#ctl').style.display = S.hints ? '' : 'none';
  const api = {
    level: lv,
    score: n => { $('#hud').textContent = n; if (n > getBest(g.id, lv)) $('#best').textContent = n; },
    end: (n, extra) => {
      if (over) return;
      tickPlay();
      const old = getBest(g.id, lv), best = Math.max(old, n), isNew = n > 0 && n > old;
      if (isNew) setBest(g.id, lv, best); else save();
      over = true; buzz(isNew ? 'win' : 'over');
      $('#overTitle').textContent = isNew ? (old ? 'New best!' : 'First score!') : 'Round over';
      $('#overTitle').className = isNew ? 'new' : '';
      $('#res').textContent = LEVELS[lv] + '  ·  Score ' + n + '  ·  Best ' + best + (extra ? '\n' + extra : '');
      $('#best').textContent = best;
      $('#over').style.display = 'flex';
      checkTrophies();
    }
  };
  cur = g.fn(api, ac.signal, lv) || {};
  gameChrome(g);
}
function toMenu(){
  const id = current && current.id;
  stop(); over = false; flush();
  showHome(id ? 'c-' + id : '');
}
