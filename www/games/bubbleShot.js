/* ---------------- BUBBLE SHOT ---------------- */
function bubbleShot(api, signal, lv){
  const R = 16, COLS = 11, ROWS_MAX = 14, X0 = 4, Y0 = 22, LINE = 13;
  const COL = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff', '#b36bff', '#ff9a5c'];
  let NC = [4, 5, 6][lv], rows = [], par = 0, ang = -Math.PI / 2, shotN = 0, proj = null, cur2, next, score = 0, level = 1, pops = [], over = false, endT = 0, msg = '', msgT = 0, falling = [];
  const rowLen = r => ((r + par) % 2 ? COLS - 1 : COLS);
  const cellXY = (r, c) => [X0 + R + c * 2 * R + ((r + par) % 2 ? R : 0), Y0 + R + r * 28];
  const get = (r, c) => r >= 0 && r < ROWS_MAX && rows[r] && c >= 0 && c < rowLen(r) ? rows[r][c] : -2;
  function fillRows(n){ for (let r = 0; r < ROWS_MAX; r++) { rows[r] = Array(rowLen(r)).fill(-1); } for (let r = 0; r < n; r++) for (let c = 0; c < rowLen(r); c++) rows[r][c] = rand(NC); }
  function nbrs(r, c){ const odd = (r + par) % 2; return [[r, c - 1], [r, c + 1], [r - 1, c - (odd ? 0 : 1)], [r - 1, c + (odd ? 1 : 0)], [r + 1, c - (odd ? 0 : 1)], [r + 1, c + (odd ? 1 : 0)]].filter(([a, b]) => get(a, b) !== -2); }
  const colorsLeft = () => { const s = new Set(); rows.forEach(r => r.forEach(v => { if (v >= 0) s.add(v); })); return [...s]; };
  const pickColor = () => { const l = colorsLeft(); return l.length ? l[rand(l.length)] : rand(NC); };
  function newLevel(){ par = 0; fillRows(Math.min(8, 4 + level)); cur2 = pickColor(); next = pickColor(); shotN = 0; }
  newLevel();
  function fire(){ if (proj || over) return; const sp = 620; proj = { x: W / 2, y: H - 46, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, c: cur2 }; cur2 = next; next = pickColor(); beep(440, .04); }
  function snap(){
    let best = null, bd = 1e9;
    for (let r = 0; r < ROWS_MAX; r++) for (let c = 0; c < rowLen(r); c++) { if (rows[r][c] !== -1) continue; const [x, y] = cellXY(r, c), d = Math.hypot(x - proj.x, y - proj.y); if (d < bd) { bd = d; best = [r, c]; } }
    const [r, c] = best; rows[r][c] = proj.c; const col = proj.c; proj = null;
    const seen = new Set([r * 100 + c]), st = [[r, c]];
    while (st.length) { const [a, b] = st.pop(); for (const [n, m2] of nbrs(a, b)) { if (get(n, m2) === col && !seen.has(n * 100 + m2)) { seen.add(n * 100 + m2); st.push([n, m2]); } } }
    let gained = 0;
    if (seen.size >= 3) {
      seen.forEach(k => { const a = (k / 100) | 0, b = k % 100, [x, y] = cellXY(a, b); rows[a][b] = -1; pops.push({ x, y, c: col, t: .3 }); }); gained += seen.size * 10; beep(560, .08); buzz();
      const conn = new Set(), q = []; for (let c2 = 0; c2 < rowLen(0); c2++) if (rows[0][c2] >= 0) { conn.add(c2); q.push([0, c2]); }
      while (q.length) { const [a, b] = q.pop(); for (const [n, m2] of nbrs(a, b)) if (get(n, m2) >= 0 && !conn.has(n * 100 + m2)) { conn.add(n * 100 + m2); q.push([n, m2]); } }
      for (let a = 0; a < ROWS_MAX; a++) for (let b = 0; b < rowLen(a); b++) if (rows[a][b] >= 0 && !conn.has(a === 0 ? b : a * 100 + b)) { const [x, y] = cellXY(a, b); falling.push({ x, y, vy: 0, c: rows[a][b] }); rows[a][b] = -1; gained += 20; }
    } else {
      shotN++;
      if (shotN % [8, 6, 5][lv] === 0) {
        par = 1 - par; const nr = Array(rowLen(0)).fill(0).map(() => rand(NC));
        rows.pop(); rows.unshift(nr);
        for (let a = 0; a < ROWS_MAX; a++) if (rows[a].length !== rowLen(a)) rows[a] = Array.from({ length: rowLen(a) }, (_, i) => rows[a][i] !== undefined ? rows[a][i] : -1);
        msg = 'Ceiling lowers'; msgT = 1;
      }
    }
    if (gained) { score += gained; api.score(score); }
    for (let a = LINE; a < ROWS_MAX; a++) if (rows[a].some(v => v >= 0)) { over = true; endT = .8; buzz('over'); }
    if (!over && rows.every(rw => rw.every(v => v < 0))) { level++; score += 200; api.score(score); msg = 'Cleared! Level ' + level; msgT = 1.5; newLevel(); }
    else if (!colorsLeft().includes(cur2)) cur2 = pickColor();
  }
  function aimAt(p){ ang = clamp(Math.atan2(p.y - (H - 46), p.x - W / 2), -Math.PI + .15, -.15); }
  let dragging = false;
  canvas.addEventListener('pointerdown', e => { dragging = true; aimAt(pt(e)); capture(e); }, { signal });
  canvas.addEventListener('pointermove', e => { if (dragging) aimAt(pt(e)); }, { signal });
  canvas.addEventListener('pointerup', e => { if (dragging) { dragging = false; aimAt(pt(e)); fire(); } }, { signal });
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt;
    if (!over) {
      ang = clamp(ang + axis() * 1.6 * dt, -Math.PI + .15, -.15);
      if (proj) {
        const steps = 4;
        for (let s = 0; s < steps && proj; s++) {
          proj.x += proj.vx * dt / steps; proj.y += proj.vy * dt / steps;
          if (proj.x < X0 + R) { proj.x = X0 + R; proj.vx = Math.abs(proj.vx); }
          if (proj.x > W - X0 - R) { proj.x = W - X0 - R; proj.vx = -Math.abs(proj.vx); }
          let hit = proj.y <= Y0 + R;
          if (!hit) for (let r = 0; r < ROWS_MAX && !hit; r++) for (let c = 0; c < rowLen(r); c++) if (rows[r][c] >= 0) { const [x, y] = cellXY(r, c); if (Math.hypot(x - proj.x, y - proj.y) < 2 * R - 3) { hit = true; break; } }
          if (hit) snap();
        }
      }
    } else { endT -= dt; if (endT <= 0) { api.end(score, 'Reached level ' + level); endT = 99; } }
    pops.forEach(p => p.t -= dt); pops = pops.filter(p => p.t > 0);
    falling.forEach(f => { f.vy += 900 * dt; f.y += f.vy * dt; }); falling = falling.filter(f => f.y < H + 20);
    clear();
    for (let r = 0; r < ROWS_MAX; r++) for (let c = 0; c < rowLen(r); c++) if (rows[r][c] >= 0) { const [x, y] = cellXY(r, c); circle(x, y, R - 1, COL[rows[r][c]]); circle(x - 4, y - 4, 3.5, 'rgba(255,255,255,.4)'); }
    falling.forEach(f => circle(f.x, f.y, R - 1, COL[f.c]));
    pops.forEach(p => { ctx.globalAlpha = p.t / .3; circle(p.x, p.y, R + (1 - p.t / .3) * 10, p.c >= 0 ? COL[p.c] : '#fff'); ctx.globalAlpha = 1; });
    ctx.strokeStyle = 'rgba(255,92,122,.5)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, Y0 + R + LINE * 28 - 14); ctx.lineTo(W, Y0 + R + LINE * 28 - 14); ctx.stroke(); ctx.setLineDash([]);
    if (!proj && !over) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([3, 7]); ctx.lineWidth = 2; let ax = W / 2, ay = H - 46, dx = Math.cos(ang), dy = Math.sin(ang); ctx.beginPath(); ctx.moveTo(ax, ay); for (let i = 0; i < 24; i++) { ax += dx * 18; ay += dy * 18; if (ax < X0 + R || ax > W - X0 - R) { dx = -dx; ax = clamp(ax, X0 + R, W - X0 - R); } ctx.lineTo(ax, ay); } ctx.stroke(); ctx.setLineDash([]); }
    if (proj) circle(proj.x, proj.y, R - 1, COL[proj.c]);
    circle(W / 2, H - 46, R - 1, COL[cur2]); circle(W / 2 - 4, H - 50, 3.5, 'rgba(255,255,255,.4)');
    circle(W / 2 + 60, H - 34, 10, COL[next]); text('next', W / 2 + 60, H - 14, 11, '#8d94c4');
    text('Score ' + score, 60, H - 30, 15, '#b9bfe8'); text('Level ' + level, 60, H - 12, 12, '#8d94c4');
    if (msgT > 0) text(msg, W / 2, H - 90, 18, '#ffd75c');
  });
  return { a: fire, dbg: () => ({ rows, score, proj, ang }) };
}
