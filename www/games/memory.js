/* ---------------- MEMORY ---------------- */
function memory(api, signal, lv){
  const EMALL = ['🍎', '🚀', '🎈', '🐙', '🌵', '⚡', '🍕', '🎲', '🐳', '🎸', '🍩', '🦊'];
  const NP = [8, 10, 12][lv], EM = EMALL.slice(0, NP), N = NP * 2, ROWS = Math.ceil(N / 4);
  const deck = EM.concat(EM).sort(() => Math.random() - .5);
  const GAP = 8, CW = 76, CH = Math.min(88, Math.floor((516 - 56) / ROWS) - GAP), X0 = 16, Y0 = 56, LOCK = [1.1, .8, .5][lv];
  const rect = i => [X0 + (i % 4) * (CW + GAP), Y0 + ((i / 4) | 0) * (CH + GAP), CW, CH];
  let up = [], matched = new Set(), moves = 0, t = 0, lockT = 0, cursor = 0, score = 0, pairs = 0, endT = 0, done = false, ended = false;
  function flip(i){
    if (done || lockT > 0 || matched.has(i) || up.includes(i)) return;
    up.push(i);
    if (up.length === 2) {
      moves++;
      if (deck[up[0]] === deck[up[1]]) {
        matched.add(up[0]); matched.add(up[1]); up = []; pairs++; score += 100; api.score(score);
        if (pairs === EM.length) { done = true; endT = .8; score += Math.max(0, 700 + NP * 20 - moves * 20 - Math.floor(t) * 2); api.score(score); }
      } else lockT = LOCK;
    }
  }
  canvas.addEventListener('pointerdown', e => { const p = pt(e); for (let i = 0; i < N; i++) if (inRect(p, rect(i))) { cursor = i; flip(i); return; } }, { signal });
  loop(signal, dt => {
    if (!done) t += dt;
    if (lockT > 0) { lockT -= dt; if (lockT <= 0) up = []; }
    if (done) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, moves + ' moves  ·  ' + fmtTime(t)); } }
    clear();
    text('Moves ' + moves, 70, 28, 17); text(fmtTime(t), W - 60, 28, 17);
    for (let i = 0; i < N; i++) {
      const r = rect(i), face = matched.has(i) || up.includes(i);
      rr(r[0], r[1], r[2], r[3], 12, matched.has(i) ? '#1f6b49' : face ? '#eee4da' : '#3b4380');
      if (face) text(deck[i], r[0] + r[2] / 2, r[1] + r[3] / 2 + 2, Math.min(40, CH * .5));
      else text('?', r[0] + r[2] / 2, r[1] + r[3] / 2 + 1, 30, '#6c73a6');
      if (padConnected && i === cursor) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(r[0] - 2, r[1] - 2, r[2] + 4, r[3] + 4, 14); ctx.stroke(); }
    }
  });
  return {
    dir: d => { const x = clamp(cursor % 4 + VEC[d][0], 0, 3), y = clamp(((cursor / 4) | 0) + VEC[d][1], 0, ROWS - 1); cursor = Math.min(N - 1, y * 4 + x); },
    a: () => flip(cursor)
  };
}
