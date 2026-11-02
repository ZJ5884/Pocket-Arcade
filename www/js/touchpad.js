/* ================= TOUCH CONTROLS: on-screen D-pad and buttons, undo button ================= */
/* Auto mode shows the buttons on touch screens when no controller is connected and the game has no touch controls of its own. */
const TOUCH_WORDS = /touch|tap|drag|swipe|pull|btn/i;
const hasOwnTouch = g => g.controls.some(c => TOUCH_WORDS.test(c[0]));
const coarse = () => { try { return matchMedia('(pointer:coarse)').matches; } catch (e) { return false; } };

function touchpadWanted(){
  if (mode !== 'play' || !current) return false;
  if (S.touchpad === 'off') return false;
  const h = cur || {};
  if (!(h.dir || h.dir8 || h.a || h.x || h.y)) return false;
  if (S.touchpad === 'on') return true;
  return coarse() && !padConnected && !hasOwnTouch(current);
}
const TP_PRESS = { u: 'u', d: 'd', l: 'l', r: 'r' };
function tpBind(el, down, up){
  el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (_) {} el.classList.add('hold'); if (S.tpHaptic) buzz(); down(); }, { passive: false });
  const rel = () => { if (el.classList.contains('hold')) { el.classList.remove('hold'); up && up(); } };
  el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel); el.addEventListener('lostpointercapture', rel);
}
function buildTouchpad(){
  const box = $('#tpad'), g = $('#game'); if (!box) return;
  const on = touchpadWanted();
  g.classList.toggle('tp-on', on);
  box.innerHTML = '';
  if (!on) return;
  const h = cur || {};
  if (h.dir || h.dir8) {
    const pad = document.createElement('div'); pad.className = 'tp-dpad';
    for (const d of ['u', 'l', 'r', 'd']) {
      const b = document.createElement('button'); b.className = 'tp tp-' + d; b.setAttribute('aria-label', { u: 'Up', d: 'Down', l: 'Left', r: 'Right' }[d]);
      b.textContent = { u: '▲', d: '▼', l: '◀', r: '▶' }[d];
      tpBind(b, () => { keyHeld[d] = true; onDir(d); }, () => { keyHeld[d] = false; });
      pad.appendChild(b);
    }
    box.appendChild(pad);
  }
  const btns = document.createElement('div'); btns.className = 'tp-btns';
  const add = (label, cls, down, up) => { const b = document.createElement('button'); b.className = 'tp tp-b ' + cls; b.textContent = label; tpBind(b, down, up); btns.appendChild(b); };
  if (h.y) add('Y', 'tp-y', onY);
  if (h.x) add('X', 'tp-x', onX);
  if (h.a) add('A', 'tp-a', onA, onAUp);
  if (btns.children.length) box.appendChild(btns);
}
/* Called by start() once the game's handler exists. */
function gameChrome(g){
  const u = $('#undoBtn'); if (u) u.style.display = cur.undo ? '' : 'none';
  if (cur.undo) $('#controls').insertAdjacentHTML('beforeend', '<li><kbd>Select / Z</kbd><span>Undo</span></li>');
  const f = $('#fps'); if (f) { f.style.display = S.showFps ? 'block' : 'none'; f.textContent = ''; }
  buildTouchpad();
  requestAnimationFrame(fitCanvas);
}

/* ---------- game screen fit: Fit keeps the exact shape, Stretch and Fill grow the picture a little to use more of the screen ---------- */
function fitCanvas(){
  const c = $('#c'), w = $('#game .wrap'); if (!c || !w) return;
  const f = S.gfit || 'fit';
  if (f === 'fit' || mode !== 'play') { c.style.width = c.style.height = c.style.aspectRatio = ''; return; }
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  let W0 = w.clientWidth, H0 = w.clientHeight; if (!W0 || !H0) return;
  let portrait = false; try { portrait = matchMedia('(orientation:portrait)').matches; } catch (e) {}
  if ($('#game').classList.contains('tp-on') && portrait) H0 -= 11.5 * rem;
  if (H0 < 60) return;
  const base = 2 / 3, d = f === 'fill' ? .3 : .14, r = Math.min(base * (1 + d), Math.max(base * (1 - d), W0 / H0));
  let cw = Math.min(W0, H0 * r), ch = cw / r; if (ch > H0) { ch = H0; cw = ch * r; }
  c.style.aspectRatio = 'auto'; c.style.width = Math.floor(cw) + 'px'; c.style.height = Math.floor(ch) + 'px';
}
try { addEventListener('resize', () => requestAnimationFrame(fitCanvas)); const _w = document.querySelector('#game .wrap'); if (_w && window.ResizeObserver) new ResizeObserver(() => fitCanvas()).observe(_w); } catch (e) {}
