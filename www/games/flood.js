/* ---------------- FLOOD FILL ---------------- */
function flood(api, signal, lv){
  const N = [10, 14, 18][lv], NC = [5, 6, 6][lv], CS = Math.floor(336 / N), X0 = Math.floor((W - CS * N) / 2), Y0 = 64, PY = 452;
  const COL = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff', '#b36bff', '#ff9a5c'];
  let hist = [], g, limit = 0, used = 0, score = 0, boards = 0, selC = 1, dead = false, endT = 0, ended = false, flash = 0, flashTxt = '';
  function region(grid){
    const c0 = grid[0], seen = new Uint8Array(N * N), q = [0], out = []; seen[0] = 1;
    while (q.length) {
      const i = q.pop(); out.push(i);
      const r = (i / N) | 0, c = i % N;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nr = r + dr, nc = c + dc; if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue; const k = nr * N + nc; if (!seen[k] && grid[k] === c0) { seen[k] = 1; q.push(k); } }
    }
    return out;
  }
  const fillRegion = (grid, c) => { region(grid).forEach(i => { grid[i] = c; }); };
  const solved = grid => grid.every(v => v === grid[0]);
  function greedy(grid){
    const t = grid.slice(); let n = 0;
    while (!solved(t) && n < 300) {
      let bc = -1, bs = -1;
      for (let c = 0; c < NC; c++) { if (c === t[0]) continue; const u = t.slice(); fillRegion(u, c); const sz = region(u).length; if (sz > bs) { bs = sz; bc = c; } }
      fillRegion(t, bc); n++;
    }
    return n;
  }
  function newBoard(){
    do { g = Array.from({ length: N * N }, () => rand(NC)); } while (solved(g));
    hist = []; limit = greedy(g) + [6, 3, 1][lv]; used = 0; selC = (g[0] + 1) % NC;
  }
  newBoard();
  function apply(c){
    if (dead || c === g[0] || c < 0 || c >= NC) return;
    hist.push({ g: g.slice(), used }); fillRegion(g, c); used++;
    if (solved(g)) {
      boards++; const pts = 100 + (limit - used) * 30; score += pts; api.score(score); flash = 1; flashTxt = 'Cleared! +' + pts; newBoard();
    } else if (used >= limit) { dead = true; endT = .9; }
  }
  const palX = i => 24 + i * ((W - 48) / NC) + ((W - 48) / NC) / 2;
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    for (let i = 0; i < NC; i++) if (Math.hypot(p.x - palX(i), p.y - PY) < 24) { selC = i; apply(i); return; }
  }, { signal });
  loop(signal, dt => {
    if (flash > 0) flash -= dt;
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Boards cleared: ' + boards); } }
    clear();
    text('Moves ' + (limit - used) + ' left', 80, 30, 17, limit - used <= 2 ? '#ff7a8a' : '#e8ebff'); text('Board ' + (boards + 1), W - 60, 30, 15, '#8d94c4');
    const filled = region(g).length / (N * N);
    rr(X0, 44, CS * N, 8, 4, '#232850'); rr(X0, 44, Math.max(8, CS * N * filled), 8, 4, '#6fe3a7');
    for (let i = 0; i < N * N; i++) rr(X0 + (i % N) * CS, Y0 + ((i / N) | 0) * CS, CS - 1, CS - 1, Math.min(5, CS / 4), COL[g[i]]);
    for (let i = 0; i < NC; i++) {
      const x = palX(i), dis = i === g[0];
      ctx.globalAlpha = dis ? .25 : 1; circle(x, PY, 20, COL[i]); ctx.globalAlpha = 1;
      if (i === selC && !dis) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, PY, 25, 0, TAU); ctx.stroke(); }
    }
    text('Fill from the top-left corner until one colour remains', W / 2, 500, 12, '#6c73a6');
    if (flash > 0) text(flashTxt, W / 2, 250, 28, '#ffd75c');
  });
  return {
    dir: d => { if (d === 'l' || d === 'r') { let c = selC; for (let k = 0; k < NC; k++) { c = (c + (d === 'r' ? 1 : NC - 1)) % NC; if (c !== g[0]) break; } selC = c; } },
    a: () => apply(selC),
    undo: () => { if (!dead && hist.length) { const h = hist.pop(); g = h.g; used = h.used; } },
    dbg: () => ({ g, N, NC, limit, used, score, dead })
  };
}
