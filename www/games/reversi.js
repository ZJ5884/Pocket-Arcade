/* ---------------- REVERSI ---------------- */
function reversi(api, signal, lv){
  const CS = 40, X0 = 20, Y0 = 110, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const WT = [100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, 1, 1, 1, 1, -2, 10, 5, -2, 1, 0, 0, 1, -2, 5];
  const WTF = i => { const x = i % 8, y = (i / 8) | 0, mx = x > 3 ? 7 - x : x, my = y > 3 ? 7 - y : y; return WT[my * 8 + mx]; };
  const b = Array(64).fill(0); b[27] = b[36] = -1; b[28] = b[35] = 1;
  let hist = [], turn = 1, cx = 3, cy = 5, aiT = 0, over = false, msg = '', msgT = 0, last = -1;
  function flips(bd, x, y, p){
    if (bd[y * 8 + x]) return [];
    const out = [];
    for (const [dx, dy] of DIRS) {
      let a = x + dx, c = y + dy; const line = [];
      while (a >= 0 && a < 8 && c >= 0 && c < 8 && bd[c * 8 + a] === -p) { line.push(c * 8 + a); a += dx; c += dy; }
      if (line.length && a >= 0 && a < 8 && c >= 0 && c < 8 && bd[c * 8 + a] === p) out.push(...line);
    }
    return out;
  }
  function movesOf(bd, p){ const m = []; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const f = flips(bd, x, y, p); if (f.length) m.push({ x, y, f }); } return m; }
  const apply = (bd, m, p) => { const n = bd.slice(); n[m.y * 8 + m.x] = p; m.f.forEach(i => n[i] = p); return n; };
  const ev = bd => { let s = 0; for (let i = 0; i < 64; i++) s += bd[i] * WTF(i); return s; };
  function search(bd, p, d, al, be){
    const ms = movesOf(bd, p);
    if (d === 0) return ev(bd) + (movesOf(bd, 1).length - movesOf(bd, -1).length) * 6;
    if (!ms.length) { if (!movesOf(bd, -p).length) return (bd.reduce((a, c) => a + c, 0)) * 1000; return search(bd, -p, d - 1, al, be); }
    if (p === 1) { let v = -1e9; for (const m of ms) { v = Math.max(v, search(apply(bd, m, 1), -1, d - 1, al, be)); al = Math.max(al, v); if (al >= be) break; } return v; }
    let v = 1e9; for (const m of ms) { v = Math.min(v, search(apply(bd, m, -1), 1, d - 1, al, be)); be = Math.min(be, v); if (al >= be) break; } return v;
  }
  function aiPick(){
    const ms = movesOf(b, -1);
    if (lv === 0) return Math.random() < .5 ? ms[rand(ms.length)] : ms.slice().sort((p, q) => q.f.length - p.f.length)[0];
    if (lv === 1) { let best = null, bs = 1e9; for (const m of ms) { const s = ev(apply(b, m, -1)) + Math.random() * 3; if (s < bs) { bs = s; best = m; } } return best; }
    let best = null, bs = 1e9; for (const m of ms) { const s = search(apply(b, m, -1), 1, 3, -1e9, 1e9); if (s < bs) { bs = s; best = m; } } return best;
  }
  const count = p => b.reduce((a, c) => a + (c === p ? 1 : 0), 0);
  function afterMove(){
    api.score(count(1) * 10);
    const mine = movesOf(b, 1).length, theirs = movesOf(b, -1).length;
    if (!mine && !theirs) { finish(); return; }
    if (turn === 1) { turn = -1; if (!theirs) { turn = 1; flash('CPU has no move'); } else aiT = .55; }
    else { turn = 1; if (!mine) { turn = -1; flash('You have no move'); aiT = .8; } }
  }
  function flash(s){ msg = s; msgT = 1.6; }
  function finish(){
    over = true; const me = count(1), cpu = count(-1);
    api.end(me * 10 + (me > cpu ? 300 : 0), (me > cpu ? 'You win ' : me < cpu ? 'CPU wins ' : 'Draw ') + me + ' – ' + cpu);
  }
  function place(x, y){
    if (over || turn !== 1) return;
    const f = flips(b, x, y, 1); if (!f.length) { beep(160, .08); return; }
    hist.push({ b: b.slice(), last });
    f.forEach(i => b[i] = 1); b[y * 8 + x] = 1; last = y * 8 + x; beep(440, .05); afterMove();
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e), x = Math.floor((p.x - X0) / CS), y = Math.floor((p.y - Y0) / CS);
    if (x >= 0 && x < 8 && y >= 0 && y < 8) { cx = x; cy = y; place(x, y); }
  }, { signal });
  api.score(2 * 10);
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt;
    if (!over && turn === -1) {
      aiT -= dt;
      if (aiT <= 0) {
        const m = aiPick();
        if (m) { m.f.forEach(i => b[i] = -1); b[m.y * 8 + m.x] = -1; last = m.y * 8 + m.x; beep(330, .05); }
        afterMove();
      }
    }
    clear();
    text('You ' + count(1) + '   CPU ' + count(-1), W / 2, 40, 20, '#e8ebff');
    text(turn === 1 && !over ? 'Your move' : over ? '' : 'CPU is thinking…', W / 2, 75, 14, '#b9bfe8');
    rr(X0 - 6, Y0 - 6, 8 * CS + 12, 8 * CS + 12, 12, '#16603f');
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const px = X0 + x * CS, py = Y0 + y * CS, v = b[y * 8 + x];
      ctx.fillStyle = (x + y) % 2 ? '#1e7a4f' : '#228657'; ctx.fillRect(px, py, CS, CS);
      if (v) { circle(px + CS / 2, py + CS / 2, 16, v === 1 ? '#15151c' : '#f2f2f6'); if (y * 8 + x === last) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px + CS / 2, py + CS / 2, 18, 0, TAU); ctx.stroke(); } }
      else if (turn === 1 && !over && flips(b, x, y, 1).length) circle(px + CS / 2, py + CS / 2, 4, 'rgba(255,255,255,.4)');
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; if (padConnected || true) { ctx.beginPath(); ctx.roundRect(X0 + cx * CS + 1, Y0 + cy * CS + 1, CS - 2, CS - 2, 5); ctx.stroke(); }
    if (msgT > 0) text(msg, W / 2, 470, 18, '#ffd75c');
    text('Black moves first. Surround to flip.', W / 2, 510, 13, '#6c73a6');
  });
  return {
    dir: d => { cx = clamp(cx + VEC[d][0], 0, 7); cy = clamp(cy + VEC[d][1], 0, 7); },
    a: () => place(cx, cy),
    undo: () => { if (over || !hist.length) return; const h = hist.pop(); for (let i = 0; i < 64; i++) b[i] = h.b[i]; last = h.last; turn = 1; aiT = 0; api.score(count(1) * 10); },
    dbg: () => ({ b, movesOf, flips, turn, place })
  };
}
