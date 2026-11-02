/* ---------------- MINES ---------------- */
function mines(api, signal, lv){
  const C = 9, R = 12, M = [12, 20, 28][lv], S = 36, X0 = 18, Y0 = 64, BTN = [100, 502, 160, 30];
  const NUMCOL = ['', '#5cc8ff', '#5cff9a', '#ff7a8a', '#b38cff', '#ff9a5c', '#5cffe0', '#ffffff', '#9aa0c8'];
  const cells = Array.from({ length: C * R }, () => ({ m: false, r: false, f: false, n: 0 }));
  let placed = false, flagMode = false, revealed = 0, dead = false, won = false, t = 0, cx = 4, cy = 5, endT = 0, boom = null;
  let press = null, pressT = 0, pressDone = false, nowT = 0, showCur = false, ended = false;
  const idx = (x, y) => y * C + x, inb = (x, y) => x >= 0 && y >= 0 && x < C && y < R;
  const nbs = (x, y) => { const o = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && inb(x + dx, y + dy)) o.push([x + dx, y + dy]); return o; };
  function place(sx, sy){
    const ban = new Set([idx(sx, sy)].concat(nbs(sx, sy).map(p => idx(p[0], p[1]))));
    let n = 0;
    while (n < M) { const i = rand(C * R); if (ban.has(i) || cells[i].m) continue; cells[i].m = true; n++; }
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) cells[idx(x, y)].n = nbs(x, y).filter(p => cells[idx(p[0], p[1])].m).length;
    placed = true;
  }
  function flood(sx, sy){
    const st = [[sx, sy]];
    while (st.length) {
      const [x, y] = st.pop(), c = cells[idx(x, y)];
      if (c.r || c.f) continue;
      c.r = true; revealed++;
      if (c.n === 0) nbs(x, y).forEach(p => st.push(p));
    }
  }
  function reveal(x, y){
    const c = cells[idx(x, y)];
    if (c.r || c.f || dead) return;
    if (c.m) { c.r = true; boom = [x, y]; dead = true; endT = 1.1; return; }
    flood(x, y);
  }
  function dig(x, y){
    if (dead || won) return;
    const c = cells[idx(x, y)];
    if (!placed) place(x, y);
    if (c.r) {
      if (c.n > 0) {
        const ns = nbs(x, y);
        if (ns.filter(p => cells[idx(p[0], p[1])].f).length === c.n) ns.forEach(p => reveal(p[0], p[1]));
      }
    } else reveal(x, y);
    api.score(revealed * 10);
    if (!dead && revealed === C * R - M) { won = true; endT = .8; }
  }
  function flag(x, y){ if (dead || won) return; const c = cells[idx(x, y)]; if (!c.r) c.f = !c.f; }
  const cellAt = p => { const x = Math.floor((p.x - X0) / S), y = Math.floor((p.y - Y0) / S); return inb(x, y) ? [x, y] : null; };
  const finalScore = () => revealed * 10 + (won ? Math.max(0, 600 - Math.floor(t)) : 0);
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e); capture(e);
    if (inRect(p, BTN)) { flagMode = !flagMode; return; }
    const c = cellAt(p);
    if (c) { press = c; pressT = nowT; pressDone = false; }
  }, { signal });
  canvas.addEventListener('pointerup', () => {
    if (press && !pressDone) { if (flagMode) flag(press[0], press[1]); else dig(press[0], press[1]); }
    press = null;
  }, { signal });
  canvas.addEventListener('pointercancel', () => { press = null; }, { signal });
  loop(signal, (dt, now) => {
    nowT = now;
    if (!dead && !won && placed) t += dt;
    if (press && !pressDone && now - pressT > 420) { pressDone = true; if (flagMode) dig(press[0], press[1]); else flag(press[0], press[1]); }
    if (endT > 0) { endT -= dt; if (endT <= 0 && !ended) { ended = true; const s = finalScore(); api.score(s); api.end(s, won ? 'Cleared in ' + fmtTime(t) : 'Boom!'); } }
    clear();
    text('Mines ' + (M - cells.filter(c => c.f).length), 80, 30, 18);
    text(fmtTime(t), W - 60, 30, 18);
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
      const c = cells[idx(x, y)], px = X0 + x * S, py = Y0 + y * S;
      let col = c.r ? '#1d2243' : '#3b4380';
      if (dead && c.m && !c.f) col = '#5a2a40';
      if (boom && boom[0] === x && boom[1] === y) col = '#c0304a';
      rr(px + 1, py + 1, S - 2, S - 2, 6, col);
      if (c.f) text('🚩', px + S / 2, py + S / 2 + 1, 18);
      else if ((dead || won) && c.m) text('💣', px + S / 2, py + S / 2 + 1, 18);
      else if (c.r && c.n) text(c.n, px + S / 2, py + S / 2 + 1, 20, NUMCOL[c.n]);
      if ((padConnected || showCur) && x === cx && y === cy) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(px + 2, py + 2, S - 4, S - 4, 6); ctx.stroke(); }
    }
    button(BTN[0], BTN[1], BTN[2], BTN[3], flagMode ? 'Mode: Flag' : 'Mode: Dig', flagMode ? '#a8324a' : '#3b4380');
  });
  return {
    dir: d => { showCur = true; cx = clamp(cx + VEC[d][0], 0, C - 1); cy = clamp(cy + VEC[d][1], 0, R - 1); },
    a: () => { showCur = true; if (flagMode) flag(cx, cy); else dig(cx, cy); },
    x: () => { showCur = true; flag(cx, cy); },
    y: () => { flagMode = !flagMode; }
  };
}
