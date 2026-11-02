/* ---------------- SLIDING PUZZLE ---------------- */
function slidepuzzle(api, signal, lv){
  const N = [3, 4, 5][lv], TS = Math.floor(330 / N), GAP = 4, X0 = 15, Y0 = 92;
  const goal = Array.from({ length: N * N }, (_, i) => (i + 1) % (N * N));
  let hist = [], t = goal.slice(), moves = 0, time = 0, done = false, endT = 0, score = 0, ended = false, cursor = 0, showCur = false;
  (function shuffle(){
    let bp = N * N - 1, prev = -1;
    for (let k = 0; k < 120 * N; k++) {
      const r = (bp / N) | 0, c = bp % N, opts = [];
      if (r > 0) opts.push(bp - N); if (r < N - 1) opts.push(bp + N); if (c > 0) opts.push(bp - 1); if (c < N - 1) opts.push(bp + 1);
      const o = opts.filter(x => x !== prev), pick = o[rand(o.length)];
      t[bp] = t[pick]; t[pick] = 0; prev = bp; bp = pick;
    }
    if (t.every((v, i) => v === goal[i])) { const a = t.indexOf(0), n = a % N ? a - 1 : a + 1; t[a] = t[n]; t[n] = 0; }
  })();
  const isWin = () => t.every((v, i) => v === goal[i]);
  function finish(){
    done = true; endT = .7;
    score = Math.max(100, [600, 1500, 3000][lv] - moves * [4, 3, 2][lv] - Math.floor(time) * [2, 3, 4][lv]); api.score(score);
  }
  function tap(r, c){
    if (done) return;
    const bp = t.indexOf(0), br = (bp / N) | 0, bc = bp % N, snap = { t: t.slice(), moves };
    if (r === br && c !== bc) { const st = Math.sign(c - bc); for (let k = bc; k !== c; k += st) t[br * N + k] = t[br * N + k + st]; t[br * N + c] = 0; }
    else if (c === bc && r !== br) { const st = Math.sign(r - br); for (let k = br; k !== r; k += st) t[k * N + bc] = t[(k + st) * N + bc]; t[r * N + bc] = 0; }
    else return;
    hist.push(snap); moves++; if (isWin()) finish();
  }
  function dirMove(d){
    const bp = t.indexOf(0), br = (bp / N) | 0, bc = bp % N, sr = br - VEC[d][1], sc = bc - VEC[d][0];
    if (sr >= 0 && sr < N && sc >= 0 && sc < N) tap(sr, sc);
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e), c = Math.floor((p.x - X0) / TS), r = Math.floor((p.y - Y0) / TS);
    if (c >= 0 && c < N && r >= 0 && r < N) { cursor = r * N + c; tap(r, c); }
  }, { signal });
  loop(signal, dt => {
    if (!done) time += dt; else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, moves + ' moves  ·  ' + fmtTime(time)); } }
    clear();
    text('Moves ' + moves, 70, 30, 17); text(fmtTime(time), W - 60, 30, 17);
    text('Put the numbers in order', W / 2, 62, 13, '#8d94c4');
    rr(X0 - 4, Y0 - 4, TS * N + 8, TS * N + 8, 14, '#10132a');
    for (let i = 0; i < N * N; i++) {
      const v = t[i]; if (!v) continue;
      const x = X0 + (i % N) * TS, y = Y0 + ((i / N) | 0) * TS, ok = v === goal[i];
      rr(x + GAP / 2, y + GAP / 2, TS - GAP, TS - GAP, 10, ok ? '#2f8f6b' : '#3b4380');
      text(v, x + TS / 2, y + TS / 2 + 1, TS > 90 ? 40 : TS > 70 ? 32 : 26);
    }
    if (showCur && padConnected) { const bp = t.indexOf(0), x = X0 + (bp % N) * TS, y = Y0 + ((bp / N) | 0) * TS; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.strokeRect(x + 3, y + 3, TS - 6, TS - 6); ctx.setLineDash([]); }
    text('Tap a tile in line with the gap · D-pad slides a tile', W / 2, 500, 12, '#6c73a6');
  });
  return { dir: d => { showCur = true; dirMove(d); }, a: () => {}, undo: () => { if (!done && hist.length) { const h = hist.pop(); t = h.t; moves = h.moves; } } };
}
