/* ================= UI NAV: shell, router, back backStack, spatial (D-pad) focus ================= */
const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'store', label: 'Store' },
  { id: 'library', label: 'Library' },
  { id: 'mine', label: 'My Games' },
  { sec: 'Browse' },
  { id: 'browse:arcade', label: 'Arcade', ic: 'arcade', cat: 1 },
  { id: 'browse:puzzle', label: 'Puzzle', ic: 'puzzle', cat: 1 },
  { id: 'browse:board', label: 'Board', ic: 'board', cat: 1 },
  { id: 'browse:sports', label: 'Sports', ic: 'sports', cat: 1 },
  { id: 'browse:word', label: 'Word', ic: 'word', cat: 1 },
  { sec: 'You' },
  { id: 'progress', label: 'Progress', hint: 'Select' },
  { id: 'settings', label: 'Settings', hint: 'Start' }
];
/* A page is { search?, hints(), render(params) -> html, after?(), x?(el), y?(el), shoulder?(d) }. Pages register themselves here. */
const PAGES = {};
/* Buttons with data-act="name" call ACTIONS[name](element, event). */
const ACTIONS = {};

let route = { page: 'store', params: {} }, backStack = [], fxEl = null, lastContentKey = '', pageTimers = [];
const content = () => $('#content');
const SEARCH = { q: '' };

function pageTimer(fn, ms){ pageTimers.push(setInterval(fn, ms)); }
function stopPageTimers(){ pageTimers.forEach(clearInterval); pageTimers = []; }

function buildShell(){
  $('#navList').innerHTML = NAV.map(n => n.sec ? '<div class="nav-sec">' + n.sec + '</div>' : '<button class="nav-i' + (n.cat ? ' cat' : '') + '" data-f data-k="nav-' + n.id + '" data-act="nav" data-v="' + n.id + '" aria-label="' + n.label + '">' + ICON[n.ic || n.id] + '<span>' + n.label + '</span>' + (n.hint ? '<kbd>' + n.hint + '</kbd>' : '') + '</button>').join('');
  $('#search').insertAdjacentHTML('afterbegin', ICON.search);
  $('#backBtn').innerHTML = ICON.back + 'Back';
}

/* ---------- routing ---------- */
function go(page, params, push){
  if (page.indexOf(':') > 0) { const parts = page.split(':'); page = parts[0]; params = { cat: parts[1] }; }
  if (push) backStack.push({ route, key: fxEl && fxEl.dataset ? fxEl.dataset.k : '', scroll: content().scrollTop });
  else { backStack = []; if (route.page !== page) clearSearch(); }
  route = { page, params: params || {} };
  render();
}
function back(){
  const s = backStack.pop();
  if (s) { route = s.route; render({ key: s.key, scroll: s.scroll }); return true; }
  if (route.page !== 'home') { go('home'); return true; }
  return false;
}
function clearSearch(){ SEARCH.q = ''; const q = $('#q'); if (q) q.value = ''; }
function refresh(){ render({ key: fxEl && fxEl.dataset ? fxEl.dataset.k : '', scroll: content().scrollTop }); }
function showHome(key){
  mode = 'ui'; closeModal();
  try { document.documentElement.style.background = ''; document.body.style.background = ''; } catch (e) {}
  $('#home').style.display = 'grid'; $('#game').style.display = 'none';
  render({ key: key || '', scroll: content().scrollTop });
}

function render(restore){
  stopPageTimers();
  const P = PAGES[route.page], c = content();
  c.innerHTML = P.render(route.params);
  c.scrollTop = restore && restore.scroll ? restore.scroll : 0;
  if (!restore) { c.classList.remove('pg'); void c.offsetWidth; c.classList.add('pg'); }
  const section = route.page === 'browse' ? 'browse:' + browseCat : (route.params.from === 'browse' ? 'browse:' + browseCat : (route.params.from || route.page));
  $$('.nav-i').forEach(b => b.classList.toggle('on', b.dataset.v === section));
  $('#backBtn').style.display = backStack.length ? 'inline-flex' : 'none';
  $('#search').style.visibility = P.search ? 'visible' : 'hidden';
  $('#me').className = route.page === 'progress' ? 'on' : '';
  if (P.after) P.after(c);
  renderHints(); renderMe(); updateBadge();
  let el = null;
  if (restore && restore.key) el = $('#home [data-k="' + restore.key + '"]');
  if (!el || el.offsetParent === null) el = c.querySelector('[data-def]') || c.querySelector('[data-f]');
  setFx(el, false);
}

function renderHints(){
  const h = $('#hints'); if (!h) return;
  const P = PAGES[route.page];
  h.style.display = S.hints ? '' : 'none';
  h.innerHTML = P && P.hints ? P.hints() : '';
}
function renderMe(){
  const a = $('#meAv'), n = $('#meName'), s = $('#meSub'), t = $('#meTop');
  if (t) t.textContent = DB.profile.avatar;
  const tried = games.filter(g => DB.games[g.id] && DB.games[g.id].plays > 0).length;
  if (a) a.textContent = DB.profile.avatar; if (n) n.textContent = DB.profile.name;
  if (s) s.textContent = ownedGames().length + ' games in library';
}
let offlineReady = false;
function updateBadge(){
  const parts = [];
  parts.push(padConnected ? '<span class="dot on"></span>Controller connected' : '<span class="dot"></span>No controller');
  if (offlineReady || isNative()) parts.push('Works offline');
  const b = $('#badge'); if (b) b.innerHTML = parts.join('<br>');
}

/* ---------- focus ---------- */
function setFx(el, scroll){
  if (fxEl && fxEl.classList) fxEl.classList.remove('fx');
  fxEl = el || null;
  if (!el) return;
  el.classList.add('fx');
  const inContent = !!(el.closest && el.closest('#content'));
  if (inContent && el.dataset) lastContentKey = el.dataset.k || '';
  try { const hero = $('#hero'); if (hero) hero.classList.toggle('hold', !!(el.closest && el.closest('#hero'))); } catch (e) {}
  if (scroll !== false && el.scrollIntoView) {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (inContent) { const first = content().querySelector('[data-f]'); if (first === el) content().scrollTop = 0; }
  }
}
function visibleFocusables(root){
  return Array.from(root.querySelectorAll('[data-f]')).filter(e => e.offsetParent !== null && !e.disabled);
}
function move(d){
  const root = modal ? $('#modal') : $('#home');
  const els = visibleFocusables(root);
  if (!els.length) return;
  if (!fxEl || !els.includes(fxEl)) { setFx(els.find(e => e.closest('#content')) || els[0]); return; }
  if ((d === 'l' || d === 'r') && fxEl._adj) { fxEl._adj(d === 'r' ? 1 : -1); return; }
  if (!modal && d === 'r' && fxEl.closest('#side') && lastContentKey) {
    const t = $('#home [data-k="' + lastContentKey + '"]');
    if (t && t.offsetParent !== null) { setFx(t); return; }
  }
  if (!modal) {
    /* predictable jumps: search -> first thing on the page; hero buttons -> the selected featured game */
    if (d === 'd' && fxEl.id === 'search') { const t = content().querySelector('[data-def]') || content().querySelector('[data-f]'); if (t) { setFx(t); return; } }
    if (d === 'l' && fxEl.classList.contains('hero-li')) { const t = content().querySelector('[data-k="hero-main"]'); if (t) { setFx(t); return; } }
    if (d === 'r' && fxEl.dataset.k === 'hero-more') { const t = content().querySelector('.hero-li.on'); if (t) { setFx(t); return; } }
  }
  const a = fxEl.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  let best = null, bs = Infinity;
  for (const e of els) {
    if (e === fxEl) continue;
    const r = e.getBoundingClientRect(), dx = r.left + r.width / 2 - ax, dy = r.top + r.height / 2 - ay;
    let p, s, ov;
    if (d === 'r') { if (dx <= 2) continue; p = dx; s = Math.abs(dy); ov = r.top < a.bottom && r.bottom > a.top; }
    else if (d === 'l') { if (dx >= -2) continue; p = -dx; s = Math.abs(dy); ov = r.top < a.bottom && r.bottom > a.top; }
    else if (d === 'd') { if (dy <= 2) continue; p = dy; s = Math.abs(dx); ov = r.left < a.right && r.right > a.left; }
    else { if (dy >= -2) continue; p = -dy; s = Math.abs(dx); ov = r.left < a.right && r.right > a.left; }
    const score = p + s * (ov ? .4 : 3);
    if (score < bs) { bs = score; best = e; }
  }
  if (best && d === 'l' && !modal && best.closest('#side') && !best.classList.contains('on')) {
    best = $('#side .nav-i.on') || best;
  }
  if (best) setFx(best);
  else if (!modal && fxEl.closest('#content')) { const c = content(); if (d === 'd') c.scrollBy(0, 140); else if (d === 'u') c.scrollTop = 0; }
}
function activate(el){
  if (!el) return;
  if (el.matches && el.matches('input:not([type=file]),textarea')) { el.focus(); return; }
  const i = el.tagName === 'LABEL' && el.querySelector('input'); if (i) { i.focus(); return; }
  el.click();
}

/* ---------- controller routing (called from input.js) ---------- */
function uiDir(d){ move(d); }
function uiA(){ activate(fxEl); }
function uiB(){
  const ae = document.activeElement;
  if (ae && ae.matches && ae.matches('input:not([type=file]),textarea')) { if (modal) closeModal(); else ae.blur(); return; }
  if (modal) return closeModal();
  if (back()) return;
  if (isNative()) confirmBox('Quit Pocket Arcade?', 'Your progress is already saved.', 'Quit', () => { flush(); const A = plug('App'); if (A && A.exitApp) A.exitApp(); });
}
function uiX(){ if (modal) return; const P = PAGES[route.page]; if (P && P.x) P.x(fxEl); }
function uiY(){ if (modal) return; const P = PAGES[route.page]; if (P && P.y) P.y(fxEl); }
function uiStart(){ if (modal) return; go(route.page === 'settings' ? 'home' : 'settings'); }
function uiSelect(){ if (modal) return; go(route.page === 'progress' ? 'home' : 'progress'); }
function uiShoulder(d){ if (modal) return; const P = PAGES[route.page]; if (P && P.shoulder) P.shoulder(d); }

/* ---------- touch / mouse wiring ---------- */
ACTIONS.nav = el => { go(el.dataset.v); setFx($('#home [data-k="nav-' + el.dataset.v + '"]') || el, false); };

$('#home').addEventListener('click', e => {
  const T = e.target, q = s => T.closest ? T.closest(s) : null;
  const f = q('[data-f]'); if (f && f.id !== 'modalIn') setFx(f, false);
  let el;
  if ((el = q('[data-fav]'))) { favToggle(el.dataset.fav); return; }
  if ((el = q('[data-more]'))) { go('detail', { id: el.dataset.more, from: route.page === 'detail' ? 'store' : route.page }, true); return; }
  if ((el = q('[data-act]'))) { const fn = ACTIONS[el.dataset.act]; if (fn) fn(el, e); return; }
  if ((el = q('.card'))) { cardOpen(el); return; }
});
$('#modal').addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-mb]');
  if (b) modalPick(+b.dataset.mb); else if (e.target === $('#modal')) closeModal();
});
$('#backBtn').onclick = () => back();
$('#me').onclick = () => go('progress');
$('#meTop').onclick = () => go('progress');
/* UI feedback: a soft tick and a light buzz on taps */
$('#home').addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('[data-f]')) { if (S.uiSound) beep(620, .015); if (S.uiHaptics && e.pointerType === 'touch') buzz(); } }, true);
$('#q').addEventListener('input', e => {
  SEARCH.q = e.target.value;
  if (route.page === 'store' || route.page === 'library' || route.page === 'browse') { backStack = []; refresh(); }
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
document.addEventListener('contextmenu', e => e.preventDefault());
