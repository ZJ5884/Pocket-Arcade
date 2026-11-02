/* ---------------- NONOGRAM ---------------- */
function nonogram(api, signal, lv){
  const N = [5, 7, 10][lv], dens = [.6, .55, .5][lv];
  let sol, g, hist = [], cx = 0, cy = 0, mark = false, t0 = performance.now(), done = false, endT = 0, score = 0, solved = 0, shown = 0;
  const runs = a => { const r = []; let c = 0; a.forEach(v => { if (v) c++; else if (c) { r.push(c); c = 0; } }); if (c) r.push(c); return r.length ? r : [0]; };
  let rowC, colC;
  function fresh(){
    do { sol = Array.from({ length: N }, () => Array.from({ length: N }, () => Math.random() < dens ? 1 : 0)); } while (sol.flat().filter(Boolean).length < N * N * .35);
    g = Array.from({ length: N }, () => Array(N).fill(0)); hist = []; cx = cy = 0; t0 = performance.now();
    rowC = sol.map(r => runs(r)); colC = Array.from({ length: N }, (_, x) => runs(sol.map(r => r[x])));
  }
  fresh();
  const okRows = () => g.every((r, y) => runs(r.map(v => v === 1 ? 1 : 0)).join() === rowC[y].join()) && Array.from({ length: N }, (_, x) => runs(g.map(r => r[x] === 1 ? 1 : 0)).join() === colC[x].join()).every(Boolean);
  const maxCol = Math.max(...Array.from({ length: 3 }, (_, i) => [5, 7, 10][i] / 2 | 0)) ;
  const CL = 78, CT = 112, CS = Math.floor(Math.min((W - CL - 10) / N, (H - CT - 50) / N));
  function set(x, y, v){
    if (done || x < 0 || y < 0 || x >= N || y >= N) return;
    if (g[y][x] === v) v = 0;
    hist.push([x, y, g[y][x]]); g[y][x] = v; beep(v ? 520 : 380, .04);
    if (okRows()) win();
  }
  function win(){
    done = true; endT = 1.1; solved++; const sec = (performance.now() - t0) / 1000;
    const pts = Math.max(40, Math.round(N * N * 12 - sec * 2)); score += pts; api.score(score); buzz('win'); beep(880, .2);
  }
  function undo(){ if (done || !hist.length) return; const [x, y, v] = hist.pop(); g[y][x] = v; }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (inRect(p, [W - 112, 10, 100, 36])) { mark = !mark; return; }
    if (inRect(p, [W - 222, 10, 100, 36])) { undo(); return; }
    const x = Math.floor((p.x - CL) / CS), y = Math.floor((p.y - CT) / CS);
    if (x >= 0 && y >= 0 && x < N && y < N) { cx = x; cy = y; set(x, y, mark ? 2 : 1); }
  }, { signal });
  loop(signal, dt => {
    if (done) { endT -= dt; if (endT <= 0) { if (solved >= 3 || false) { api.end(score, solved + ' puzzles solved'); endT = 99; done = true; } else { done = false; fresh(); } } }
    clear();
    const sec = Math.floor((performance.now() - t0) / 1000);
    text(N + '×' + N + ' · puzzle ' + (solved + 1) + '/3', 14, 28, 14, '#b9bfe8', 'left'); text(fmtTime ? fmtTime(sec * 1000) : sec + 's', 14, 52, 14, '#8d94c4', 'left');
    button(W - 222, 10, 100, 36, 'Undo', '#3b4380'); button(W - 112, 10, 100, 36, mark ? 'Mark ✕' : 'Fill ■', mark ? '#7a4a8a' : '#2f7a5a');
    const fs = Math.max(9, Math.min(14, CS * .5));
    for (let y = 0; y < N; y++) text(rowC[y].join(' '), CL - 6, CT + y * CS + CS / 2, fs, (done || g[y].every((v, x) => (v === 1) === !!sol[y][x])) ? '#5cff9a' : '#b9bfe8', 'right');
    for (let x = 0; x < N; x++) { const c = colC[x], sat = done; c.forEach((n, i) => text(String(n), CL + x * CS + CS / 2, CT - 8 - (c.length - 1 - i) * (fs + 1), fs, sat ? '#5cff9a' : '#b9bfe8')); }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const px = CL + x * CS, py = CT + y * CS;
      rr(px + 1, py + 1, CS - 2, CS - 2, 4, g[y][x] === 1 ? '#5cc8ff' : '#232850');
      if (g[y][x] === 2) text('✕', px + CS / 2, py + CS / 2, CS * .6, '#8d6aa8');
    }
    ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2;
    for (let i = 5; i < N; i += 5) { ctx.beginPath(); ctx.moveTo(CL + i * CS, CT); ctx.lineTo(CL + i * CS, CT + N * CS); ctx.moveTo(CL, CT + i * CS); ctx.lineTo(CL + N * CS, CT + i * CS); ctx.stroke(); }
    if (!done) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 3; ctx.strokeRect(CL + cx * CS + 1, CT + cy * CS + 1, CS - 2, CS - 2); }
    text('A fill   X mark   Select undo', W / 2, H - 22, 13, '#6c73a6');
    if (done) text('Solved!', W / 2, 40, 22, '#5cff9a');
  });
  return { dir: d => { const v = VEC[d]; cx = clamp(cx + v[0], 0, N - 1); cy = clamp(cy + v[1], 0, N - 1); }, a: () => set(cx, cy, 1), x: () => set(cx, cy, 2), y: () => { mark = !mark; }, undo, dbg: () => ({ sol, g, set, N, solved }) };
}
