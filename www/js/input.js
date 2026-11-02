/* ================= INPUT: touch + keyboard + gamepad ================= */
/* mode is 'ui' (launcher) or 'play' (a game is running). Launcher actions are implemented in ui/nav.js. */
let mode = 'ui', over = false, cur = {}, current = null;
const keyHeld = {};
let padAx = 0, padAy = 0, padConnected = false;
const KEYDIR = { ArrowLeft:'l', ArrowRight:'r', ArrowUp:'u', ArrowDown:'d', a:'l', d:'r', w:'u', s:'d', A:'l', D:'r', W:'u', S:'d' };
const VEC = { l:[-1,0], r:[1,0], u:[0,-1], d:[0,1] };

function axis(){ return clamp((keyHeld.r ? 1 : 0) - (keyHeld.l ? 1 : 0) + padAx, -1, 1); }
function axisY(){ return clamp((keyHeld.d ? 1 : 0) - (keyHeld.u ? 1 : 0) + padAy, -1, 1); }

/* The focus ring only shows for keyboard / controller input; touch and mouse hide it. */
function setInput(t){ try { const r = document.documentElement; if (r.dataset.input !== t) r.dataset.input = t; } catch (e) {} }
addEventListener('pointerdown', e => setInput(e.pointerType === 'mouse' ? 'mouse' : 'touch'), true);

function onDir(d){
  if (mode === 'web') { webPress(d, true); setTimeout(() => webPress(d, false), 90); return; }
  if (mode !== 'play') { setInput('pad'); uiDir(d); }
  else if (!over) {
    if (cur.dir8) cur.dir8(VEC[d][0], VEC[d][1]);
    else if (cur.dir) cur.dir(d);
  }
}
function onA(){
  if (mode === 'web') { webPress('a', true); return; }
  if (mode !== 'play') { setInput('pad'); uiA(); }
  else if (over) start(current);
  else if (cur.a) cur.a();
}
function onAUp(){ if (mode === 'web') { webPress('a', false); return; }
  if (mode === 'play' && !over && cur.aUp) cur.aUp(); }
function onX(){ if (mode === 'web') { webPress('x', true); setTimeout(() => webPress('x', false), 90); return; } if (mode !== 'play') { setInput('pad'); uiX(); } else if (!over && cur.x) cur.x(); }
function onY(){ if (mode === 'web') { webPress('y', true); setTimeout(() => webPress('y', false), 90); return; } if (mode !== 'play') { setInput('pad'); uiY(); } else if (!over && cur.y) cur.y(); }
function onB(){ if (mode === 'web') { webPress('b', true); setTimeout(() => webPress('b', false), 90); return; } if (mode === 'play') toMenu(); else { setInput('pad'); uiB(); } }
function onStart(){ if (mode === 'web') { webPress('start', true); setTimeout(() => webPress('start', false), 90); return; } if (mode === 'play') start(current); else { setInput('pad'); uiStart(); } }
function onSelect(){ if (mode === 'web') { mineExit(); return; } if (mode !== 'play') { setInput('pad'); uiSelect(); } else onUndo(); }
function onUndo(){ if (mode === 'play' && !over && cur.undo) cur.undo(); }
function onShoulder(d){ if (mode === 'play') onLevel(d); else { setInput('pad'); uiShoulder(d); } }

const typing = e => { const t = e && e.target; return !!(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')); };
let capKey = null, capPad = null, padBlock = false, prevAll = new Set();
const RESERVED_KEYS = new Set(['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd', 'backspace', ' ', 'shift', 'control', 'alt', 'meta']);
const keyLabel = k => ({ enter: 'Enter', escape: 'Esc', tab: 'Tab', ' ': 'Space' }[k] || (k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1)));
function listenKey(cb){ capKey = cb; }
function listenPad(cb){ capPad = cb; padBlock = true; }
function cancelListen(){ capKey = null; capPad = null; }
addEventListener('keydown', e => {
  const lk = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  if (capKey) { e.preventDefault(); if (e.repeat) return; const cb = capKey; capKey = null; cb(lk); return; }
  if (typing(e)) { if (e.key === 'Escape') onB(); return; }
  const K = S.keys || DEFAULTS.keys;
  if (mode === 'play' && !over && cur.key && e.key !== 'Escape' && cur.key(e)) { e.preventDefault(); return; }
  if (e.key.startsWith('Arrow') || e.key === ' ' || e.key === 'Tab') e.preventDefault();
  const d = KEYDIR[e.key];
  if (d) { keyHeld[d] = true; if (!e.repeat || mode !== 'play') onDir(d); }
  else if (lk === 'enter' || lk === ' ' || lk === K.a) { if (!e.repeat) onA(); }
  else if (lk === 'escape' || lk === 'backspace' || lk === K.b) onB();
  else if (lk === '[' || lk === K.l1) onShoulder(-1);
  else if (lk === ']' || lk === K.r1) onShoulder(1);
  else if (lk === K.x && !e.repeat) onX();
  else if (lk === K.y && !e.repeat) onY();
  else if (lk === K.select) onSelect();
  else if (lk === K.undo && !e.repeat) onUndo();
  else if (lk === K.start && !e.repeat) onStart();
  else if (lk === 'v' && !e.repeat && mode !== 'play' && typeof cycleView === 'function') cycleView();
});
addEventListener('keyup', e => {
  const d = KEYDIR[e.key]; if (d) keyHeld[d] = false;
  const lk = e.key.toLowerCase(), K = S.keys || DEFAULTS.keys;
  if (lk === 'enter' || lk === ' ' || lk === K.a) onAUp();
});

const padPrev = {}, repeatAt = {};
const REP = () => ({ fast: { first: 250, rep: 80 }, normal: { first: 350, rep: 140 }, slow: { first: 520, rep: 230 } }[S.rep] || { first: 350, rep: 140 });
let padLive = { held: [], ax: 0, ay: 0 };
let dirKey = '0,0', dirSince = 0, dirFired = '0,0';
function pollPad(now){
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const h = { l:0, r:0, u:0, d:0 }, dz = DEADZONES[S.deadzone] || .2, B = S.binds || DEFAULTS.binds, pressed = new Set(), sm = S.stickMode || 'both';
  let ax = 0, ay = 0, a = 0, b = 0, st = 0, sel = 0, bx = 0, by = 0, l1 = 0, r1 = 0, any = false;
  for (const p of pads) {
    if (!p || !p.connected) continue;
    any = true;
    const bt = i => !!(p.buttons[i] && p.buttons[i].pressed);
    p.buttons.forEach((b, i) => { if (b && b.pressed) pressed.add(i); });
    const x = sm === 'dpad' ? 0 : (p.axes[0] || 0), y = sm === 'dpad' ? 0 : (p.axes[1] || 0);
    const dp = sm !== 'stick';
    if ((dp && bt(14)) || x < -.5) h.l = 1;
    if ((dp && bt(15)) || x > .5)  h.r = 1;
    if ((dp && bt(12)) || y < -.5) h.u = 1;
    if ((dp && bt(13)) || y > .5)  h.d = 1;
    if (Math.abs(x) > dz) ax = x;
    if (Math.abs(y) > dz) ay = y;
    if (dp && bt(14)) ax = -1;
    if (dp && bt(15)) ax = 1;
    if (dp && bt(12)) ay = -1;
    if (dp && bt(13)) ay = 1;
    if (bt(B.a)) a = 1;
    if (bt(B.b)) b = 1;
    if (bt(B.x)) bx = 1;
    if (bt(B.y)) by = 1;
    if (bt(B.select)) sel = 1;
    if (bt(B.start)) st = 1;
    if (bt(B.l1)) l1 = 1;
    if (bt(B.r1)) r1 = 1;
  }
  if (S.swapAB) { const t = a; a = b; b = t; }
  if (S.swapXY) { const t = bx; bx = by; by = t; }
  if (capPad) { for (const i of pressed) if (!prevAll.has(i)) { const cb = capPad; capPad = null; padBlock = true; cb(i); break; } }
  prevAll = pressed;
  if (padBlock) { if (pressed.size === 0 && !capPad) padBlock = false; }
  padLive = { held: Array.from(pressed), ax, ay };
  if (padBlock || capPad) { a = b = st = sel = bx = by = l1 = r1 = 0; h.l = h.r = h.u = h.d = 0; ax = ay = 0; }
  if (any !== padConnected) { padConnected = any; if (typeof updateBadge === 'function') updateBadge(); if (typeof buildTouchpad === 'function') buildTouchpad(); }
  padAx = ax; padAy = ay;
  const dx = h.r - h.l, dy = h.d - h.u, key = dx + ',' + dy;
  if (mode === 'play' && !over && cur.dir8) {
    /* 8-way games: wait a moment so a diagonal d-pad press doesn't fire as two moves */
    if (key !== dirKey) { dirKey = key; dirSince = now; if (key === '0,0') dirFired = key; }
    else if (key !== '0,0' && dirFired !== key && now - dirSince >= 45) { dirFired = key; cur.dir8(dx, dy); }
    for (const d of ['l', 'r', 'u', 'd']) padPrev[d] = h[d];
  } else {
    dirKey = key; dirFired = key;
    for (const d of ['l', 'r', 'u', 'd']) {
      if (h[d] && !padPrev[d]) { onDir(d); repeatAt[d] = now + REP().first; }
      else if (h[d] && mode !== 'play' && now >= repeatAt[d]) { onDir(d); repeatAt[d] = now + REP().rep; }
      padPrev[d] = h[d];
    }
  }
  if (a && !padPrev.a) onA();
  if (!a && padPrev.a) onAUp();
  if (b && !padPrev.b) onB();
  if (bx && !padPrev.x) onX();
  if (by && !padPrev.y) onY();
  if (st && !padPrev.st) onStart();
  if (sel && !padPrev.sel) onSelect();
  if (l1 && !padPrev.l1) onShoulder(-1);
  if (r1 && !padPrev.r1) onShoulder(1);
  padPrev.a = a; padPrev.b = b; padPrev.x = bx; padPrev.y = by; padPrev.st = st; padPrev.sel = sel; padPrev.l1 = l1; padPrev.r1 = r1;
}
(function padLoop(t){ pollPad(t); requestAnimationFrame(padLoop); })(performance.now());
