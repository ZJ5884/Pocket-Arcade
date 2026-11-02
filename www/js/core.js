
/* ================= SAVE DATA, SETTINGS, NATIVE BRIDGE ================= */
const LEVELS = ['Easy', 'Normal', 'Hard'];
const APP_VERSION = '4.0.0';
const SAVE_KEY = 'pocket_arcade_save_v1';

const THEMES = {
  graphite: { name: 'Dark', bg: '#121214', side: '#18181c', panel: '#202026', panel2: '#2a2a32', line: '#34343e', text: '#f4f4f6', dim: '#9d9da8', canvas: '#171b33' },
  midnight: { name: 'Midnight', bg: '#0c1020', side: '#111731', panel: '#182044', panel2: '#222c5a', line: '#2e3a72', text: '#e8ebff', dim: '#8d94c4', canvas: '#141a38' },
  forest: { name: 'Forest', bg: '#0f1a15', side: '#14231c', panel: '#1c3027', panel2: '#264034', line: '#35523f', text: '#e6efe6', dim: '#92b09f', canvas: '#12241d' },
  plum: { name: 'Plum', bg: '#1a0f1d', side: '#221428', panel: '#301d38', panel2: '#3d2548', line: '#573460', text: '#f3e8f4', dim: '#b79bbb', canvas: '#241633' },
  amoled: { name: 'Black', bg: '#000000', side: '#060608', panel: '#111116', panel2: '#1b1b22', line: '#26262e', text: '#f4f4f6', dim: '#8a8a96', canvas: '#0a0e22' },
  ocean: { name: 'Ocean', bg: '#08161f', side: '#0c1e2a', panel: '#112b3a', panel2: '#183a4e', line: '#235068', text: '#e4f3fa', dim: '#85a9bb', canvas: '#0e2433' },
  sunset: { name: 'Sunset', bg: '#1d0f14', side: '#26141b', panel: '#341b24', panel2: '#44242f', line: '#63343f', text: '#ffeee6', dim: '#c79c98', canvas: '#2a1420' },
  terminal: { name: 'Terminal', bg: '#050a05', side: '#081008', panel: '#0d1a0d', panel2: '#142814', line: '#1f3d1f', text: '#b8ffb8', dim: '#6fae6f', canvas: '#07120a' },
  paper: { name: 'Paper', bg: '#f1ede4', side: '#faf7f0', panel: '#fffdf8', panel2: '#ece7da', line: '#d9d2c0', text: '#2a2620', dim: '#7a7262', canvas: '#171b33' },
  daylight: { name: 'Light', bg: '#e9e9ee', side: '#f6f6f9', panel: '#ffffff', panel2: '#ececf2', line: '#d0d0da', text: '#18181c', dim: '#5e5e6c', canvas: '#171b33' }
};
const ACCENTS = ['#0078f2', '#e23a6d', '#ff8a3d', '#f2c230', '#2fb36d', '#9b6bff', '#18c4d8', '#ff5f5f', '#a3d83a', '#e062d6', '#8a97ff', '#e8e8ee'];
const FONTS = { system: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', rounded: 'ui-rounded,"SF Pro Rounded",Nunito,"Varela Round",system-ui,sans-serif', serif: 'Georgia,"Times New Roman",serif', mono: 'ui-monospace,"SF Mono",Menlo,Consolas,monospace' };
const PAD_NAMES = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'L1', 5: 'R1', 6: 'L2', 7: 'R2', 8: 'Select', 9: 'Start', 10: 'L3', 11: 'R3' };
const BIND_ACTIONS = [['a', 'Confirm / main action'], ['b', 'Back'], ['x', 'Action X'], ['y', 'Action Y'], ['l1', 'Previous (difficulty, filter)'], ['r1', 'Next (difficulty, filter)'], ['select', 'Select (progress, undo in a game)'], ['start', 'Start (settings, restart in a game)']];
const AVATARS = ['🎮', '🕹️', '👾', '🦊', '🐙', '🚀', '🍄', '⭐', '🐸', '🦉', '🍕', '🔥'];
const DEFAULTS = { sound: true, volume: 7, haptics: true, theme: 'graphite', accent: '#0078f2', density: 'large', uiScale: 100, motion: false, defLevel: 1, orient: 'auto', awake: false, hints: true, swapAB: false, deadzone: 1, fps: 0, showFps: false, touchpad: 'auto', view: 'grid', nav: 'auto', sort: 'default', start: 'home', font: 'system', radius: 'round', bgstyle: 'plain', frame: 'panel', splash: true, gfit: 'stretch', gbars: 'slim', uiSound: false, uiHaptics: true, swapXY: false, stickMode: 'both', rep: 'normal', tpSize: 'm', tpOpacity: 'm', tpHand: 'right', tpHaptic: true, binds: { a: 0, b: 1, x: 2, y: 3, l1: 4, r1: 5, select: 8, start: 9 }, keys: { a: 'enter', b: 'escape', x: 'x', y: 'c', l1: 'q', r1: 'e', select: 'tab', start: 'p', undo: 'z' } };
const DEADZONES = [.12, .2, .35];

const freshDB = () => ({ v: 1, created: Date.now(), saved: 0, profile: { name: 'Player', avatar: '🎮' }, settings: JSON.parse(JSON.stringify(DEFAULTS)), games: {}, favs: [], recent: [], totals: { plays: 0, ms: 0 }, trophies: {}, owned: STARTER.slice() });
let DB = freshDB();
let S = DB.settings;

function mergeDB(raw){
  const d = freshDB();
  if (!raw || typeof raw !== 'object') return d;
  if (raw.profile) { d.profile.name = String(raw.profile.name || d.profile.name).slice(0, 14); d.profile.avatar = String(raw.profile.avatar || d.profile.avatar).slice(0, 8); }
  if (raw.settings) for (const k in DEFAULTS) if (k !== 'binds' && k !== 'keys' && typeof raw.settings[k] === typeof DEFAULTS[k]) d.settings[k] = raw.settings[k];
  if (raw.settings && raw.settings.binds && typeof raw.settings.binds === 'object') for (const k in DEFAULTS.binds) { const v = raw.settings.binds[k]; if (Number.isInteger(v) && v >= 0 && v < 32) d.settings.binds[k] = v; }
  if (raw.settings && raw.settings.keys && typeof raw.settings.keys === 'object') for (const k in DEFAULTS.keys) { const v = raw.settings.keys[k]; if (typeof v === 'string' && v.length && v.length < 14) d.settings.keys[k] = v; }
  if (raw.settings && raw.settings.density === 'compact' && !raw.settings.view) d.settings.view = 'compact';
  if (raw.games && typeof raw.games === 'object') for (const id in raw.games) {
    const g = raw.games[id]; if (!g || typeof g !== 'object') continue;
    d.games[id] = { lv: g.lv === 0 || g.lv === 1 || g.lv === 2 ? g.lv : null, best: {}, plays: +g.plays || 0, ms: +g.ms || 0, last: +g.last || 0 };
    for (const l in (g.best || {})) if (+g.best[l] > 0) d.games[id].best[l] = +g.best[l];
  }
  if (Array.isArray(raw.favs)) d.favs = raw.favs.filter(x => typeof x === 'string').slice(0, 60);
  if (Array.isArray(raw.recent)) d.recent = raw.recent.filter(x => typeof x === 'string').slice(0, 8);
  if (raw.totals) { d.totals.plays = +raw.totals.plays || 0; d.totals.ms = +raw.totals.ms || 0; }
  if (raw.trophies && typeof raw.trophies === 'object') for (const k in raw.trophies) d.trophies[k] = +raw.trophies[k] || 1;
  if (Array.isArray(raw.owned)) d.owned = raw.owned.filter(x => typeof x === 'string').slice(0, 200);
  else if (raw.games && Object.keys(raw.games).length || raw.totals && raw.totals.plays) d.owned = CATALOG.map(g => g.id);   /* saves from before the store keep every game */
  if (d.settings.accent === '#e23a6d' && d.settings.theme === 'graphite') d.settings.accent = DEFAULTS.accent;
  if (d.settings.density === 'list') d.settings.density = 'large';
  if (!THEMES[d.settings.theme]) d.settings.theme = DEFAULTS.theme;
  d.created = +raw.created || d.created; d.saved = +raw.saved || 0;
  return d;
}
function migrateLegacy(d){
  /* Scores from the first web versions were stored one key each. Pull them in once. */
  try {
    if (localStorage.getItem('pa_legacy_done')) return false;
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i), m = /^best_(.+?)(?:_L([02]))?$/.exec(k || '');
      if (m) { const g = d.games[m[1]] = d.games[m[1]] || { lv: null, best: {}, plays: 0, ms: 0, last: 0 }; g.best[m[2] || '1'] = Math.max(g.best[m[2] || '1'] || 0, +localStorage.getItem(k) || 0); found = true; }
      const n = /^lv_(.+)$/.exec(k || '');
      if (n) { const g = d.games[n[1]] = d.games[n[1]] || { lv: null, best: {}, plays: 0, ms: 0, last: 0 }; const v = +localStorage.getItem(k); if (v >= 0 && v <= 2) g.lv = v; found = true; }
    }
    localStorage.setItem('pa_legacy_done', '1');
    return found;
  } catch (e) { return false; }
}
function useDB(d){ DB = d; S = d.settings; }

const gs = id => DB.games[id] || (DB.games[id] = { lv: null, best: {}, plays: 0, ms: 0, last: 0 });
function getLevel(id){ const g = DB.games[id]; return g && g.lv !== null && g.lv !== undefined ? g.lv : S.defLevel; }
function setLevel(id, v){ gs(id).lv = clamp(v, 0, 2); save(); }
const bestKey = (id, lv) => lv === 1 ? id : id + '_L' + lv;
function getBest(id, lv){ const g = DB.games[id]; return g && g.best[lv] ? g.best[lv] : 0; }
function setBest(id, lv, v){ gs(id).best[lv] = v; save(); }
const isFav = id => DB.favs.includes(id);
function toggleFav(id){ const i = DB.favs.indexOf(id); if (i < 0) DB.favs.push(id); else DB.favs.splice(i, 1); save(); }

/* --- native plugins (present only inside the Android app; every call is optional) --- */
const plug = n => { try { return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[n] || null; } catch (e) { return null; } };
const isNative = () => { try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) { return false; } };

let saveTimer = 0, dirty = false;
function persist(){
  dirty = false; DB.saved = Date.now();
  let s = ''; try { s = JSON.stringify(DB); } catch (e) { return; }
  try { localStorage.setItem(SAVE_KEY, s); } catch (e) {}
  const P = plug('Preferences');
  if (P) { try { P.set({ key: SAVE_KEY, value: s }); } catch (e) {} }
}
function save(){ dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(persist, 350); }
function flush(){ if (dirty) { clearTimeout(saveTimer); persist(); } }
addEventListener('pagehide', flush);
try { document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); }); } catch (e) {}

function loadLocal(){
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
  const d = mergeDB(raw);
  if (!raw) { if (migrateLegacy(d)) { /* keep migrated scores */ } }
  return d;
}
/* The native store survives "clear cache" and is included in Android's backup, so it can be newer than the web copy. */
function loadNative(done){
  const P = plug('Preferences'); if (!P) return;
  try {
    P.get({ key: SAVE_KEY }).then(r => {
      if (!r || !r.value) { persist(); return; }
      let raw = null; try { raw = JSON.parse(r.value); } catch (e) { return; }
      if (raw && (+raw.saved || 0) > (DB.saved || 0)) { useDB(mergeDB(raw)); try { localStorage.setItem(SAVE_KEY, r.value); } catch (e) {} done && done(); }
      else if (raw && (+raw.saved || 0) < (DB.saved || 0)) persist();
    }).catch(() => {});
  } catch (e) {}
}

/* --- backup / restore --- */
function exportText(){ flush(); persist(); return JSON.stringify({ app: 'pocket-arcade', version: APP_VERSION, data: DB }); }
function importText(t){
  let o; try { o = JSON.parse(t); } catch (e) { return 'That file is not a Pocket Arcade backup.'; }
  const raw = o && o.app === 'pocket-arcade' ? o.data : (o && o.profile && o.settings ? o : null);
  if (!raw) return 'That file is not a Pocket Arcade backup.';
  useDB(mergeDB(raw)); persist(); return '';
}
function resetScores(){ DB.games = {}; DB.recent = []; DB.totals = { plays: 0, ms: 0 }; DB.trophies = {}; persist(); }
function resetAll(){ const keep = DB.created; useDB(freshDB()); DB.created = keep; persist(); }
const isOwned = id => DB.owned.includes(id);
function setOwned(id, on){ const i = DB.owned.indexOf(id); if (on && i < 0) DB.owned.push(id); else if (!on && i >= 0) DB.owned.splice(i, 1); save(); }

/* --- feel: sound volume lives in beep(); vibration here --- */
function buzz(kind){
  if (!S.haptics) return;
  const H = plug('Haptics');
  try {
    if (H) {
      if (kind === 'win') H.notification({ type: 'SUCCESS' });
      else if (kind === 'over') H.vibrate({ duration: 120 });
      else H.impact({ style: 'LIGHT' });
    } else if (navigator.vibrate) navigator.vibrate(kind === 'win' ? [40, 40, 40] : kind === 'over' ? 90 : 12);
  } catch (e) {}
}

/* --- screen: orientation lock and keep-awake --- */
let wakeLock = null;
function applyScreen(){
  const O = plug('ScreenOrientation');
  const want = { auto: null, landscape: 'landscape', portrait: 'portrait' }[S.orient];
  try {
    if (O) { if (want) O.lock({ orientation: want }); else O.unlock(); }
    else if (screen.orientation && screen.orientation.lock && isNative()) { if (want) screen.orientation.lock(want).catch(() => {}); else screen.orientation.unlock(); }
  } catch (e) {}
  try {
    if (S.awake && navigator.wakeLock && !wakeLock) navigator.wakeLock.request('screen').then(l => { wakeLock = l; l.addEventListener('release', () => { wakeLock = null; }); }).catch(() => {});
    else if (!S.awake && wakeLock) { wakeLock.release(); wakeLock = null; }
  } catch (e) {}
}
try { document.addEventListener('visibilitychange', () => { if (!document.hidden && S.awake) applyScreen(); }); } catch (e) {}

let CANVAS_BG = '#171b33';
function applyLook(){
  const t = THEMES[S.theme] || THEMES.graphite, r = document.documentElement;
  if (!r || !r.style || !r.style.setProperty) return;
  const set = (k, v) => r.style.setProperty(k, v);
  set('--bg', t.bg); set('--side', t.side); set('--panel', t.panel); set('--panel2', t.panel2); set('--line', t.line); set('--text', t.text); set('--dim', t.dim); set('--accent', S.accent);
  { const n = parseInt(S.accent.slice(1), 16), L = (.299 * (n >> 16) + .587 * ((n >> 8) & 255) + .114 * (n & 255)); set('--on-accent', L > 160 ? '#101014' : '#fff'); }
  set('--scale', String(S.uiScale / 100));
  r.dataset.theme = S.theme; r.dataset.motion = S.motion ? 'reduced' : 'full'; r.dataset.density = S.view === 'compact' ? 'compact' : 'large';
  set('--font', FONTS[S.font] || FONTS.system);
  r.dataset.radius = S.radius; r.dataset.bg = S.bgstyle; r.dataset.frame = S.frame; r.dataset.view = S.view;
  r.dataset.gbars = S.gbars; r.dataset.gfit = S.gfit; r.dataset.tps = S.tpSize; r.dataset.tpo = S.tpOpacity; r.dataset.tph = S.tpHand;
  set('--tpk', { s: .82, m: 1, l: 1.25 }[S.tpSize] || 1); set('--tpa', { l: .08, m: .18, h: .34 }[S.tpOpacity] || .18);
  applyNav();
  try { if (typeof fitCanvas === 'function') fitCanvas(); } catch (e) {}
  CANVAS_BG = t.canvas;
  try { const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t.bg); } catch (e) {}
  const SB = plug('StatusBar'); try { if (SB) SB.setBackgroundColor({ color: t.bg }); } catch (e) {}
}

/* Navigation layout: auto picks a bottom bar on portrait phones and a sidebar otherwise. */
function navEffective(){
  if (S.nav && S.nav !== 'auto') return S.nav;
  let portrait = false; try { portrait = matchMedia('(orientation:portrait)').matches; } catch (e) {}
  return portrait ? 'bottom' : 'side';
}
function applyNav(){ try { document.documentElement.dataset.navx = navEffective(); } catch (e) {} }
try { addEventListener('resize', applyNav); addEventListener('orientationchange', applyNav); } catch (e) {}
