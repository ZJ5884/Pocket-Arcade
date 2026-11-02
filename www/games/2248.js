/* ---------------- 2248 ---------------- */
const nextPow2 = v => { let p = 2; while (p < v) p *= 2; return p; };
function g2248(api, signal, lv){
  const COLS = 5, ROWS = 7, CS = 64, X0 = 20, Y0 = 70;
  const POOL = [[2, 2, 2, 4, 4, 8], [2, 2, 4, 4, 8, 8, 16], [2, 4, 4, 8, 8, 16, 32, 64]][lv];
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  let score = 0, path = [], sum = 0, cursor = 17, holding = false, touchOn = false, dead = false, endT = 0, ended = false, best = 0, flash = 0, flashTxt = '';
  const val = i => g[(i / COLS) | 0][i % COLS];
  const maxVal = () => { let m = 0; for (const r of g) for (const v of r) if (v > m) m = v; return m; };
  const spawn = () => { const m = maxVal(), pool = POOL.filter(v => v <= Math.max(8, m / 2)); return pool[rand(pool.length)]; };
  const adj = (a, b) => a !== b && Math.abs(((a / COLS) | 0) - ((b / COLS) | 0)) <= 1 && Math.abs((a % COLS) - (b % COLS)) <= 1;
  function hasMove(){
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[r][c] && g[r][c] === g[nr][nc]) return true;
    }
    return false;
  }
  do { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) g[r][c] = spawn(); } while (!hasMove());
  best = maxVal();
  function canAdd(i){
    if (!path.length) return val(i) > 0;
    const last = path[path.length - 1];
    if (path.includes(i) || !adj(last, i)) return false;
    const v = val(i);
    return v === val(last) || v === sum;
  }
  function extend(i){
    if (i < 0 || dead) return;
    if (!path.length) { if (val(i) > 0) { path = [i]; sum = val(i); } return; }
    if (path.length >= 2 && i === path[path.length - 2]) { const p = path.pop(); sum -= val(p); return; }
    if (canAdd(i)) { path.push(i); sum += val(i); }
  }
  function commit(){
    if (path.length >= 2) {
      const res = nextPow2(sum), last = path[path.length - 1];
      path.forEach(i => { g[(i / COLS) | 0][i % COLS] = 0; });
      g[(last / COLS) | 0][last % COLS] = res;
      for (let c = 0; c < COLS; c++) {
        const col = []; for (let r = ROWS - 1; r >= 0; r--) if (g[r][c]) col.push(g[r][c]);
        for (let r = ROWS - 1, k = 0; r >= 0; r--, k++) g[r][c] = k < col.length ? col[k] : spawn();
      }
      score += res; api.score(score); flash = .8; flashTxt = '+' + res; best = Math.max(best, maxVal());
      if (!hasMove()) { dead = true; endT = .8; }
    }
    path = []; sum = 0;
  }
  const tileAt = p => {
    const c = Math.floor((p.x - X0) / CS), r = Math.floor((p.y - Y0) / CS);
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return -1;
    const cx = X0 + c * CS + CS / 2, cy = Y0 + r * CS + CS / 2;
    return Math.hypot(p.x - cx, p.y - cy) < CS * .46 ? r * COLS + c : -1;
  };
  canvas.addEventListener('pointerdown', e => { const i = tileAt(pt(e)); if (i < 0) return; capture(e); touchOn = true; path = []; sum = 0; extend(i); cursor = i; }, { signal });
  canvas.addEventListener('pointermove', e => { if (touchOn) extend(tileAt(pt(e))); }, { signal });
  canvas.addEventListener('pointerup', () => { if (touchOn) { touchOn = false; commit(); } }, { signal });
  canvas.addEventListener('pointercancel', () => { touchOn = false; path = []; sum = 0; }, { signal });
  const color = v => 'hsl(' + ((Math.log2(v) * 47 + 10) % 360) + ',62%,52%)';
  loop(signal, dt => {
    if (flash > 0) flash -= dt;
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Biggest tile: ' + best); } }
    clear();
    text('Link equal tiles', 90, 30, 16, '#8d94c4');
    text(path.length >= 2 ? '→ ' + nextPow2(sum) : flash > 0 ? flashTxt : '', W - 70, 30, 22, '#ffd75c');
    rr(X0 - 6, Y0 - 6, COLS * CS + 12, ROWS * CS + 12, 16, '#10132a');
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c, v = g[r][c], x = X0 + c * CS, y = Y0 + r * CS, on = path.includes(i);
      rr(x + 3, y + 3, CS - 6, CS - 6, 14, color(v));
      text(v, x + CS / 2, y + CS / 2 + 1, v > 999 ? 18 : v > 99 ? 24 : 30, '#fff');
      if (on) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, CS - 4, CS - 4, 14); ctx.stroke(); }
    }
    if (path.length > 1) {
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); path.forEach((i, k) => { const x = X0 + (i % COLS) * CS + CS / 2, y = Y0 + ((i / COLS) | 0) * CS + CS / 2; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineCap = 'butt';
    }
    if ((padConnected) && !touchOn) { const x = X0 + (cursor % COLS) * CS, y = Y0 + ((cursor / COLS) | 0) * CS; ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.strokeRect(x + 1, y + 1, CS - 2, CS - 2); ctx.setLineDash([]); }
    text('Equal tiles, or a tile equal to the running total · diagonals count', W / 2, 528, 11, '#6c73a6');
  });
  return {
    dir8: (dx, dy) => {
      const c = (cursor % COLS) + dx, r = ((cursor / COLS) | 0) + dy;
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
      cursor = r * COLS + c;
      if (holding) extend(cursor);
    },
    a: () => { holding = true; path = []; sum = 0; extend(cursor); },
    aUp: () => { if (holding) { holding = false; commit(); } },
    dbg: () => ({ g, score, dead })
  };
}
