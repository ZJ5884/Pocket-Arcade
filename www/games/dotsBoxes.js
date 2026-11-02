/* ---------------- DOTS AND BOXES ---------------- */
function dotsBoxes(api, signal, lv){
  const N = [4, 5, 5][lv], CS = Math.floor(300 / N), X0 = (W - CS * N) / 2, Y0 = 120;
  /* edges: h[y][x] for y 0..N, x 0..N-1 ; v[y][x] for y 0..N-1, x 0..N */
  const h = Array.from({ length: N + 1 }, () => Array(N).fill(0)), v = Array.from({ length: N }, () => Array(N + 1).fill(0));
  const owner = Array.from({ length: N }, () => Array(N).fill(0));
  let turn = 1, cx = 1, cy = 0, mine = 0, theirs = 0, wait = 0, msg = 'Your move', over = false, endT = 0, last = null;
  const sides = (x, y) => (h[y][x] ? 1 : 0) + (h[y + 1][x] ? 1 : 0) + (v[y][x] ? 1 : 0) + (v[y][x + 1] ? 1 : 0);
  function claim(kind, x, y, who){
    (kind === 'h' ? h : v)[y][x] = who; last = [kind, x, y];
    let got = 0;
    const chk = (bx, by) => { if (bx >= 0 && bx < N && by >= 0 && by < N && !owner[by][bx] && sides(bx, by) === 4) { owner[by][bx] = who; got++; } };
    if (kind === 'h') { chk(x, y - 1); chk(x, y); } else { chk(x - 1, y); chk(x, y); }
    if (who === 1) mine += got; else theirs += got;
    beep(got ? 700 : 400, .05);
    api.score(mine * 10);
    if (mine + theirs === N * N) { over = true; endT = .8; return; }
    if (!got) { turn = -who; if (turn === -1) wait = .5; msg = turn === 1 ? 'Your move' : 'Computer…'; }
    else { msg = who === 1 ? 'Box! Go again' : 'Computer goes again'; if (who === -1) wait = .5; }
  }
  const free = () => { const l = []; for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) if (!h[y][x]) l.push(['h', x, y]); for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) if (!v[y][x]) l.push(['v', x, y]); return l; };
  function boxesOf(e){ const [k, x, y] = e; return k === 'h' ? [[x, y - 1], [x, y]] : [[x - 1, y], [x, y]]; }
  const sideCount = (bx, by) => (bx >= 0 && bx < N && by >= 0 && by < N && !owner[by][bx]) ? sides(bx, by) : -1;
  function aiMove(){
    const f = free();
    const takes = f.filter(e => boxesOf(e).some(([bx, by]) => sideCount(bx, by) === 3));
    if (takes.length && (lv > 0 || Math.random() < .8)) return takes[rand(takes.length)];
    const safe = f.filter(e => !boxesOf(e).some(([bx, by]) => sideCount(bx, by) === 2));
    if (safe.length && (lv > 0 || Math.random() < .6)) return safe[rand(safe.length)];
    if (lv === 2) { let best = null, bs = 1e9; for (const e of f) { const s = boxesOf(e).reduce((a, [bx, by]) => a + (sideCount(bx, by) === 2 ? 1 : 0), 0); if (s < bs) { bs = s; best = e; } } return best; }
    return f[rand(f.length)];
  }
  function human(e){ if (over || turn !== 1) return; const [k, x, y] = e; if ((k === 'h' ? h : v)[y][x]) { beep(150, .06); return; } claim(k, x, y, 1); }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e); let best = null, bd = 18;
    for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) { const d = Math.hypot(p.x - (X0 + x * CS + CS / 2), p.y - (Y0 + y * CS)); if (d < bd) { bd = d; best = ['h', x, y]; } }
    for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) { const d = Math.hypot(p.x - (X0 + x * CS), p.y - (Y0 + y * CS + CS / 2)); if (d < bd) { bd = d; best = ['v', x, y]; } }
    if (best) { cx = best[0] === 'h' ? best[1] * 2 + 1 : best[1] * 2; cy = best[0] === 'h' ? best[2] * 2 : best[2] * 2 + 1; human(best); }
  }, { signal });
  const cursorEdge = () => (cy % 2 === 0) ? ['h', (cx - 1) / 2, cy / 2] : ['v', cx / 2, (cy - 1) / 2];
  const validCell = (x, y) => x >= 0 && x <= 2 * N && y >= 0 && y <= 2 * N && ((x % 2) ^ (y % 2)) === 1;
  loop(signal, dt => {
    if (!over && turn === -1) { wait -= dt; if (wait <= 0) { const e = aiMove(); if (e) claim(e[0], e[1], e[2], -1); } }
    if (over) { endT -= dt; if (endT <= 0) { const sc = mine * 10 + (mine > theirs ? 150 : 0); api.score(sc); api.end(sc, (mine > theirs ? 'You win ' : mine < theirs ? 'CPU wins ' : 'Draw ') + mine + ' – ' + theirs); endT = 99; } }
    clear();
    text('You ' + mine + '   CPU ' + theirs, W / 2, 36, 22, '#e8ebff'); text(over ? '' : msg, W / 2, 72, 15, turn === 1 ? '#b9bfe8' : '#8d94c4');
    for (let by = 0; by < N; by++) for (let bx = 0; bx < N; bx++) if (owner[by][bx]) { rr(X0 + bx * CS + 4, Y0 + by * CS + 4, CS - 8, CS - 8, 8, owner[by][bx] === 1 ? 'rgba(92,200,255,.55)' : 'rgba(255,92,122,.55)'); text(owner[by][bx] === 1 ? 'Y' : 'C', X0 + bx * CS + CS / 2, Y0 + by * CS + CS / 2, 18, '#fff'); }
    const isLast = (k, x, y) => last && last[0] === k && last[1] === x && last[2] === y;
    for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) { const o = h[y][x]; ctx.strokeStyle = o ? (isLast('h', x, y) ? '#ffd75c' : o === 1 ? '#5cc8ff' : '#ff5c7a') : '#2a2f5a'; ctx.lineWidth = o ? 6 : 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X0 + x * CS + 6, Y0 + y * CS); ctx.lineTo(X0 + (x + 1) * CS - 6, Y0 + y * CS); ctx.stroke(); }
    for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) { const o = v[y][x]; ctx.strokeStyle = o ? (isLast('v', x, y) ? '#ffd75c' : o === 1 ? '#5cc8ff' : '#ff5c7a') : '#2a2f5a'; ctx.lineWidth = o ? 6 : 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X0 + x * CS, Y0 + y * CS + 6); ctx.lineTo(X0 + x * CS, Y0 + (y + 1) * CS - 6); ctx.stroke(); }
    ctx.lineCap = 'butt';
    for (let y = 0; y <= N; y++) for (let x = 0; x <= N; x++) circle(X0 + x * CS, Y0 + y * CS, 5, '#e8ebff');
    if (padConnected && turn === 1 && !over) { const [k, x, y] = cursorEdge(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); if (k === 'h') ctx.arc(X0 + x * CS + CS / 2, Y0 + y * CS, 11, 0, TAU); else ctx.arc(X0 + x * CS, Y0 + y * CS + CS / 2, 11, 0, TAU); ctx.stroke(); }
    text('Draw a line. Close a box to claim it and go again.', W / 2, 500, 12, '#6c73a6');
  });
  return {
    dir: d => { let x = cx, y = cy; for (let k = 0; k < 4; k++) { x += VEC[d][0]; y += VEC[d][1]; if (validCell(x, y)) { cx = x; cy = y; return; } if (x < 0 || y < 0 || x > 2 * N || y > 2 * N) return; } },
    a: () => human(cursorEdge()),
    dbg: () => ({ h, v, owner, turn, mine, theirs })
  };
}
