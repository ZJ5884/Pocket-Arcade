const W = 360, H = 540, SCALE = 3;
const $ = s => document.querySelector(s);
const canvas = $('#c'), ctx = canvas.getContext('2d');
canvas.width = W * SCALE; canvas.height = H * SCALE;
ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
if (!ctx.roundRect) ctx.roundRect = function(x, y, w, h){ this.rect(x, y, w, h); };
const rand = n => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TAU = Math.PI * 2;


let audioCtx = null;
function beep(f, d){
  if (!S.sound || !S.volume) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime;
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(.18 * S.volume / 7, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + d);
  } catch (e) {}
}
const fmtTime = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

function clear(){ ctx.fillStyle = CANVAS_BG; ctx.fillRect(0, 0, W, H); }
function rr(x, y, w, h, r, fill){ ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); }
function circle(x, y, r, fill){ ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
function text(t, x, y, size, color, align){ ctx.fillStyle = color || '#fff'; ctx.font = '700 ' + size + 'px system-ui,sans-serif'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
function button(x, y, w, h, label, fill){ rr(x, y, w, h, 12, fill || '#3b4380'); text(label, x + w/2, y + h/2 + 1, 16, '#fff'); }
function inRect(p, r){ return p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] && p.y <= r[1] + r[3]; }

/* Frame loop. S.fps caps the frame rate (0 = every display frame). Skipped frames just wait for the next one. */
let fpsN = 0, fpsAt = 0;
function loop(signal, fn){
  let last = performance.now();
  const f = t => {
    if (signal.aborted) return;
    const iv = S.fps ? 1000 / S.fps - 2 : 0;
    if (iv && t - last < iv) { requestAnimationFrame(f); return; }
    fn(Math.min((t - last) / 1000, 0.033), t);
    last = t;
    if (S.showFps) { fpsN++; if (t - fpsAt >= 500) { const el = $('#fps'); if (el) el.textContent = Math.round(fpsN * 1000 / (t - fpsAt)) + ' fps'; fpsN = 0; fpsAt = t; } }
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}

function pt(e){ const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
function capture(e){ try { canvas.setPointerCapture(e.pointerId); } catch(_) {} }
function swipe(signal, cb){
  let sx, sy;
  canvas.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; }, { signal });
  canvas.addEventListener('pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    cb(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
  }, { signal });
}
/* Slingshot: press anywhere, drag backwards, release. cb gets the vector from finger to start point. */
function sling(signal, canStart, onMove, onRelease){
  let p0 = null, vx = 0, vy = 0, len = 0;
  canvas.addEventListener('pointerdown', e => { if (!canStart()) return; p0 = pt(e); vx = vy = len = 0; capture(e); }, { signal });
  canvas.addEventListener('pointermove', e => {
    if (!p0) return;
    const p = pt(e); vx = p0.x - p.x; vy = p0.y - p.y; len = Math.hypot(vx, vy);
    onMove(vx, vy, len);
  }, { signal });
  const up = () => { if (!p0) return; p0 = null; onRelease(vx, vy, len); };
  canvas.addEventListener('pointerup', up, { signal });
  canvas.addEventListener('pointercancel', () => { p0 = null; }, { signal });
}
/* Crosshair controller shared by Archery and Darts. */
function makeAimer(signal, c){
  const a = { x: c.x, y: c.y, sx: 0, sy: 0 };
  let last = null, pressedFire = false;
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e); capture(e);
    if (inRect(p, c.fire)) { pressedFire = true; return; }
    last = p;
  }, { signal });
  canvas.addEventListener('pointermove', e => {
    if (!last) return;
    const p = pt(e);
    a.x = clamp(a.x + p.x - last.x, c.x0, c.x1); a.y = clamp(a.y + p.y - last.y, c.y0, c.y1);
    last = p;
  }, { signal });
  canvas.addEventListener('pointerup', e => {
    if (pressedFire) { pressedFire = false; if (inRect(pt(e), c.fire)) c.onFire(); }
    last = null;
  }, { signal });
  a.step = (dt, now) => {
    a.x = clamp(a.x + axis() * c.speed * dt, c.x0, c.x1);
    a.y = clamp(a.y + axisY() * c.speed * dt, c.y0, c.y1);
    a.sx = Math.sin(now / 370) * c.sway + Math.sin(now / 910) * c.sway * .5;
    a.sy = Math.cos(now / 430) * c.sway + Math.sin(now / 1130) * c.sway * .5;
  };
  return a;
}
function crosshair(x, y, color){
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x - 6, y); ctx.moveTo(x + 6, y); ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 6); ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 20); ctx.stroke();
}

