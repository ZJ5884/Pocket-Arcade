/* ---------------- NUMBER MATCH ---------------- */
function numbermatch(api, signal, lv){
  const COLS = 9, MAXROWS = 16;
  let cells = [], adds = [8, 5, 3][lv], score = 0, sel = -1, hint = null, cursor = 0, msg = '', msgT = 0, dead = false, endT = 0, ended = false, final = null, time = 0;
  const BTN_ADD = [12, 488, 164, 40], BTN_HINT = [184, 488, 164, 40];
  function between(i, j){
    let ro = true; for (let k = i + 1; k < j; k++) if (cells[k]) { ro = false; break; }
    if (ro) return true;
    const ri = (i / COLS) | 0, rj = (j / COLS) | 0, ci = i % COLS, cj = j % COLS;
    if (ci === cj) { for (let r = ri + 1; r < rj; r++) if (cells[r * COLS + ci]) return false; return true; }
    if (rj - ri === Math.abs(cj - ci)) { const dc = Math.sign(cj - ci); for (let k = 1; k < rj - ri; k++) if (cells[(ri + k) * COLS + ci + dc * k]) return false; return true; }
    return false;
  }
  function canPair(a, b){
    if (a === b) return false;
    const i = Math.min(a, b), j = Math.max(a, b);
    if (!cells[i] || !cells[j]) return false;
    const x = cells[i], y = cells[j];
    return (x === y || x + y === 10) && between(i, j);
  }
  function findPair(){ for (let i = 0; i < cells.length; i++) if (cells[i]) for (let j = i + 1; j < cells.length; j++) if (cells[j] && canPair(i, j)) return [i, j]; return null; }
  const rowsN = () => cells.length / COLS;
  do { cells = Array.from({ length: COLS * [3, 4, 5][lv] }, () => 1 + rand(9)); } while (!findPair());
  function afterAction(){
    hint = null;
    if (!cells.length) { dead = true; endT = .9; score += 300 + adds * 50; api.score(score); final = 'Board cleared!'; return; }
    if (adds <= 0 && !findPair()) { dead = true; endT = .9; final = 'No more moves'; }
  }
  function pair(a, b){
    const x = cells[a], y = cells[b];
    cells[a] = 0; cells[b] = 0; score += x === y ? 10 : 15;
    const rows = []; for (let r = 0; r < rowsN(); r++) rows.push(cells.slice(r * COLS, r * COLS + COLS));
    const keep = rows.filter(r => r.some(Boolean)); score += (rows.length - keep.length) * 30;
    cells = [].concat(...keep); sel = -1; api.score(score); afterAction();
  }
  function addNumbers(){
    if (dead) return;
    if (adds <= 0) { msg = 'No adds left'; msgT = 1.2; return; }
    const vals = cells.filter(Boolean); let last = -1;
    for (let i = cells.length - 1; i >= 0; i--) if (cells[i]) { last = i; break; }
    const out = cells.slice(0, last + 1).concat(vals);
    while (out.length % COLS) out.push(0);
    if (out.length / COLS > MAXROWS) { msg = 'Board is full'; msgT = 1.2; return; }
    cells = out; adds--; sel = -1; hint = null; afterAction();
  }
  function doHint(){ if (dead) return; hint = findPair(); if (!hint) { msg = adds ? 'No pairs – add numbers' : 'No pairs left'; msgT = 1.4; } }
  function tapCell(i){
    if (dead || i < 0 || i >= cells.length || !cells[i]) return;
    hint = null;
    if (sel < 0) sel = i;
    else if (sel === i) sel = -1;
    else if (canPair(sel, i)) pair(sel, i);
    else sel = i;
  }
  const geom = () => { const cs = clamp(Math.floor(400 / Math.max(10, rowsN())), 24, 36); return { cs, x0: Math.floor((W - cs * COLS) / 2), y0: 56 }; };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (inRect(p, BTN_ADD)) { addNumbers(); return; }
    if (inRect(p, BTN_HINT)) { doHint(); return; }
    const { cs, x0, y0 } = geom(), c = Math.floor((p.x - x0) / cs), r = Math.floor((p.y - y0) / cs);
    if (c >= 0 && c < COLS && r >= 0) { cursor = r * COLS + c; tapCell(cursor); }
  }, { signal });
  loop(signal, dt => {
    if (!dead) time += dt;
    if (msgT > 0) msgT -= dt;
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, final); } }
    clear();
    const { cs, x0, y0 } = geom();
    text('Pairs: equal or add up to 10', 120, 28, 15, '#8d94c4'); text(msgT > 0 ? msg : fmtTime(time), W - 70, 28, 14, msgT > 0 ? '#ffd75c' : '#8d94c4');
    for (let i = 0; i < cells.length; i++) {
      const v = cells[i], x = x0 + (i % COLS) * cs, y = y0 + ((i / COLS) | 0) * cs;
      if (!v) continue;
      const isSel = i === sel, isHint = hint && (hint[0] === i || hint[1] === i);
      rr(x + 1, y + 1, cs - 2, cs - 2, 6, isSel ? '#ffd75c' : isHint ? '#2f9e6b' : '#232850');
      text(v, x + cs / 2, y + cs / 2 + 1, cs * .55, isSel ? '#2a2200' : 'hsl(' + (v * 40) + ',70%,72%)');
      if (padConnected && i === cursor) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4); }
    }
    button(BTN_ADD[0], BTN_ADD[1], BTN_ADD[2], BTN_ADD[3], 'Add numbers (' + adds + ')', adds ? '#3b4380' : '#232850');
    button(BTN_HINT[0], BTN_HINT[1], BTN_HINT[2], BTN_HINT[3], 'Hint', '#3b4380');
  });
  return {
    dir: d => { const r = clamp(((cursor / COLS) | 0) + VEC[d][1], 0, Math.max(0, rowsN() - 1)), c = clamp((cursor % COLS) + VEC[d][0], 0, COLS - 1); cursor = Math.min(cells.length - 1, r * COLS + c); },
    a: () => tapCell(cursor), x: addNumbers, y: doHint,
    dbg: () => ({ cells, adds, score, dead, canPair, findPair })
  };
}
