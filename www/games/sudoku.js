/* ---------------- SUDOKU ---------------- */
function sdkCands(g, i){
  const r = (i / 9) | 0, c = i % 9, used = new Set();
  for (let k = 0; k < 9; k++) { used.add(g[r * 9 + k]); used.add(g[k * 9 + c]); }
  const br = r - r % 3, bc = c - c % 3;
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) used.add(g[(br + y) * 9 + bc + x]);
  const out = []; for (let v = 1; v <= 9; v++) if (!used.has(v)) out.push(v);
  return out;
}
function sdkNext(g){
  let best = -1, bc = null, bn = 10;
  for (let i = 0; i < 81; i++) if (!g[i]) { const c = sdkCands(g, i); if (c.length < bn) { bn = c.length; best = i; bc = c; if (bn <= 1) break; } }
  return { best, bc };
}
function sdkCount(g, limit){
  let count = 0;
  (function rec(){
    const { best, bc } = sdkNext(g);
    if (best < 0) { count++; return; }
    for (const v of bc) { g[best] = v; rec(); g[best] = 0; if (count >= limit) return; }
  })();
  return count;
}
function sdkFull(){
  const g = Array(81).fill(0);
  (function rec(){
    const { best, bc } = sdkNext(g);
    if (best < 0) return true;
    for (let i = bc.length - 1; i > 0; i--) { const j = rand(i + 1); [bc[i], bc[j]] = [bc[j], bc[i]]; }
    for (const v of bc) { g[best] = v; if (rec()) return true; }
    g[best] = 0;
    return false;
  })();
  return g;
}
function sudokuMake(removeTarget){
  const solution = sdkFull(), puzzle = solution.slice();
  const order = [...Array(81).keys()].sort(() => Math.random() - .5);
  let removed = 0;
  for (const i of order) {
    if (removed >= removeTarget) break;
    const v = puzzle[i]; puzzle[i] = 0;
    if (sdkCount(puzzle.slice(), 2) !== 1) puzzle[i] = v; else removed++;
  }
  return { puzzle, solution };
}
function sudoku(api, signal, lv){
  const { puzzle, solution } = sudokuMake([34, 44, 52][lv]);
  const g = puzzle.slice(), given = puzzle.map(v => v > 0);
  const X0 = 9, Y0 = 52, CS = 38, HINT = [13, 502, 334, 30];
  const padRect = k => [13 + (k % 5) * 68, 408 + ((k / 5) | 0) * 46, 62, 42];
  let sel = 40, t = 0, hints = 0, done = false, endT = 0, score = 0, ended = false;
  function check(){
    if (g.every((v, i) => v === solution[i])) {
      done = true; endT = .7;
      score = Math.max(100, 3000 - Math.floor(t) * 2 - hints * 150); api.score(score);
    }
  }
  const put = v => { if (given[sel] || done) return; g[sel] = v; check(); };
  function hint(){ if (given[sel] || done) return; g[sel] = solution[sel]; given[sel] = true; hints++; check(); }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    const x = Math.floor((p.x - X0) / CS), y = Math.floor((p.y - Y0) / CS);
    if (x >= 0 && x < 9 && y >= 0 && y < 9) { sel = y * 9 + x; return; }
    for (let k = 0; k < 10; k++) if (inRect(p, padRect(k))) { put(k < 9 ? k + 1 : 0); return; }
    if (inRect(p, HINT)) hint();
  }, { signal });
  addEventListener('keydown', e => {
    if (/^[1-9]$/.test(e.key)) put(+e.key);
    else if (e.key === '0' || e.key === 'Delete') put(0);
    else if (e.key === 'h') hint();
  }, { signal });
  loop(signal, dt => {
    if (!done) t += dt;
    else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Solved in ' + fmtTime(t) + (hints ? '  ·  ' + hints + ' hints' : '')); } }
    clear();
    text('Time ' + fmtTime(t), 70, 28, 16);
    text('Hints ' + hints, W - 60, 28, 16);
    const sr = (sel / 9) | 0, sc = sel % 9, sv = g[sel];
    for (let i = 0; i < 81; i++) {
      const r = (i / 9) | 0, c = i % 9, x = X0 + c * CS, y = Y0 + r * CS;
      const related = r === sr || c === sc || (((r / 3) | 0) === ((sr / 3) | 0) && ((c / 3) | 0) === ((sc / 3) | 0));
      let col = related ? '#232a52' : '#1a1f3d';
      if (sv && g[i] === sv) col = '#2c3a78';
      if (i === sel) col = '#4f7cff';
      rr(x + 1, y + 1, CS - 2, CS - 2, 4, col);
      if (g[i]) {
        const wrong = g[i] !== solution[i];
        text(g[i], x + CS / 2, y + CS / 2 + 1, 22, wrong ? '#ff5c7a' : (given[i] || i === sel ? '#fff' : '#9fbaff'));
      }
    }
    ctx.strokeStyle = '#6c73a6'; ctx.lineWidth = 2;
    for (let k = 0; k <= 3; k++) {
      ctx.beginPath(); ctx.moveTo(X0 + k * 3 * CS, Y0); ctx.lineTo(X0 + k * 3 * CS, Y0 + 9 * CS); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X0, Y0 + k * 3 * CS); ctx.lineTo(X0 + 9 * CS, Y0 + k * 3 * CS); ctx.stroke();
    }
    for (let k = 0; k < 10; k++) {
      const r = padRect(k);
      if (k < 9) {
        const used = g.filter((v, i) => v === k + 1 && v === solution[i]).length >= 9;
        rr(r[0], r[1], r[2], r[3], 10, used ? '#1d2243' : '#3b4380');
        text(k + 1, r[0] + r[2] / 2, r[1] + r[3] / 2 + 1, 22, used ? '#4a5290' : '#fff');
      } else { rr(r[0], r[1], r[2], r[3], 10, '#5a3a55'); text('Erase', r[0] + r[2] / 2, r[1] + r[3] / 2 + 1, 15); }
    }
    button(HINT[0], HINT[1], HINT[2], HINT[3], 'Hint  (-150 pts)', '#2c3263');
  });
  return {
    dir: d => { const x = clamp(sel % 9 + VEC[d][0], 0, 8), y = clamp(((sel / 9) | 0) + VEC[d][1], 0, 8); sel = y * 9 + x; },
    a: () => put((g[sel] + 1) % 10), x: () => put(0), y: hint
  };
}
