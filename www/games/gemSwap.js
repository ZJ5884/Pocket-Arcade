/* ---------------- GEM SWAP ---------------- */
function gemSwap(api, signal, lv){
  const N = 8, CS = 42, X0 = 12, Y0 = 100, NC = [5, 6, 7][lv];
  const COL = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff', '#b36bff', '#ff9a5c', '#d6f2ff'];
  let g = [], sel = -1, cx = 0, cy = 0, phase = 'idle', t = 0, score = 0, chain = 0, moves = [30, 26, 22][lv], clearing = new Set(), shake = 0, msg = '', msgT = 0, over = false, endT = 0, hint = -1;
  const found = () => {
    const m = new Set();
    for (let y = 0; y < N; y++) for (let x = 0; x < N - 2; x++) { const v = g[y * N + x]; if (v >= 0 && v === g[y * N + x + 1] && v === g[y * N + x + 2]) { m.add(y * N + x); m.add(y * N + x + 1); m.add(y * N + x + 2); } }
    for (let x = 0; x < N; x++) for (let y = 0; y < N - 2; y++) { const v = g[y * N + x]; if (v >= 0 && v === g[(y + 1) * N + x] && v === g[(y + 2) * N + x]) { m.add(y * N + x); m.add((y + 1) * N + x); m.add((y + 2) * N + x); } }
    return m;
  };
  const swap = (a, b) => { const t2 = g[a]; g[a] = g[b]; g[b] = t2; };
  function findMove(){
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const a = y * N + x, bx = x + dx, by = y + dy; if (bx >= N || by >= N) continue;
      const b = by * N + bx; swap(a, b); const ok = found().size > 0; swap(a, b); if (ok) return [a, b];
    }
    return null;
  }
  function init(){ do { g = Array.from({ length: N * N }, () => rand(NC)); } while (found().size || !findMove()); }
  init();
  function trySwap(a, b){
    if (phase !== 'idle' || over) return;
    swap(a, b);
    if (found().size) { moves--; chain = 0; phase = 'resolve'; t = .14; sel = -1; hint = -1; beep(420, .05); }
    else { swap(a, b); shake = .25; sel = -1; beep(150, .08); }
  }
  const cellAt = p => { const x = Math.floor((p.x - X0) / CS), y = Math.floor((p.y - Y0) / CS); return x >= 0 && x < N && y >= 0 && y < N ? y * N + x : -1; };
  let down = null;
  canvas.addEventListener('pointerdown', e => { const p = pt(e); down = { p, c: cellAt(p) }; capture(e); }, { signal });
  canvas.addEventListener('pointerup', e => {
    if (!down) return; const p = pt(e), d = down; down = null;
    if (d.c < 0) return;
    const dx = p.x - d.p.x, dy = p.y - d.p.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
      const x = d.c % N, y = (d.c / N) | 0; let nx = x, ny = y;
      if (Math.abs(dx) > Math.abs(dy)) nx += dx > 0 ? 1 : -1; else ny += dy > 0 ? 1 : -1;
      if (nx >= 0 && nx < N && ny >= 0 && ny < N) { cx = x; cy = y; trySwap(d.c, ny * N + nx); }
      return;
    }
    cx = d.c % N; cy = (d.c / N) | 0;
    if (sel < 0) sel = d.c;
    else if (sel === d.c) sel = -1;
    else if (Math.abs((sel % N) - (d.c % N)) + Math.abs(((sel / N) | 0) - ((d.c / N) | 0)) === 1) trySwap(sel, d.c);
    else sel = d.c;
  }, { signal });
  loop(signal, dt => {
    if (shake > 0) shake -= dt; if (msgT > 0) msgT -= dt;
    if (phase === 'resolve') {
      t -= dt;
      if (t <= 0) {
        const m = found();
        if (m.size) { chain++; const pts = m.size * 10 * chain; score += pts; api.score(score); clearing = m; phase = 'clear'; t = .22; beep(500 + chain * 90, .08); buzz(); if (chain > 1) { msg = 'Chain x' + chain; msgT = .9; } }
        else { phase = 'idle'; if (moves <= 0) { over = true; endT = .6; } else if (!findMove()) { init(); msg = 'No moves left: board shuffled'; msgT = 1.4; } }
      }
    } else if (phase === 'clear') {
      t -= dt;
      if (t <= 0) {
        clearing.forEach(i => { g[i] = -1; });
        for (let x = 0; x < N; x++) { const col = []; for (let y = N - 1; y >= 0; y--) if (g[y * N + x] >= 0) col.push(g[y * N + x]); while (col.length < N) col.push(rand(NC)); for (let y = 0; y < N; y++) g[(N - 1 - y) * N + x] = col[y]; }
        clearing = new Set(); phase = 'resolve'; t = .12;
      }
    }
    if (over) { endT -= dt; if (endT <= 0) { api.end(score, ''); endT = 99; } }
    clear();
    text('Moves ' + moves, 70, 30, 20, moves <= 3 ? '#ff7a8a' : '#e8ebff'); text('Score ' + score, W - 80, 30, 18, '#b9bfe8');
    text('Swap two neighbours to line up 3 or more', W / 2, 66, 13, '#8d94c4');
    rr(X0 - 4, Y0 - 4, N * CS + 8, N * CS + 8, 12, '#10132a');
    for (let i = 0; i < N * N; i++) {
      const v = g[i]; if (v < 0) continue;
      const x = X0 + (i % N) * CS + CS / 2 + (shake > 0 && (i === sel || true) ? Math.sin(shake * 90) * 2 : 0), y = Y0 + ((i / N) | 0) * CS + CS / 2;
      const r = clearing.has(i) ? 15 * (t / .22) : 16;
      ctx.fillStyle = COL[v];
      ctx.beginPath();
      if (v === 0) ctx.arc(x, y, r, 0, TAU);
      else if (v === 1) { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); }
      else if (v === 2) ctx.roundRect(x - r * .85, y - r * .85, r * 1.7, r * 1.7, 5);
      else if (v === 3) { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r * .8); ctx.lineTo(x - r, y + r * .8); ctx.closePath(); }
      else if (v === 4) { for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + Math.PI / 6; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); }
      else if (v === 5) { for (let k = 0; k < 10; k++) { const a = k * TAU / 10 - Math.PI / 2, rr2 = k % 2 ? r * .5 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } ctx.closePath(); }
      else ctx.ellipse(x, y, r, r * .7, 0, 0, TAU);
      ctx.fill();
      if (i === sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(X0 + (i % N) * CS + 2, Y0 + ((i / N) | 0) * CS + 2, CS - 4, CS - 4, 8); ctx.stroke(); }
    }
    if (padConnected && phase === 'idle') { ctx.strokeStyle = sel >= 0 ? '#ffd75c' : 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(X0 + cx * CS + 1, Y0 + cy * CS + 1, CS - 2, CS - 2, 8); ctx.stroke(); }
    if (msgT > 0) text(msg, W / 2, 478, 17, '#ffd75c');
  });
  return {
    dir: d => {
      if (sel >= 0) { const nx = cx + VEC[d][0], ny = cy + VEC[d][1]; if (nx >= 0 && nx < N && ny >= 0 && ny < N) { trySwap(sel, ny * N + nx); } return; }
      cx = clamp(cx + VEC[d][0], 0, N - 1); cy = clamp(cy + VEC[d][1], 0, N - 1);
    },
    a: () => { const i = cy * N + cx; sel = sel === i ? -1 : i; },
    dbg: () => ({ g, N, phase, moves, score })
  };
}
