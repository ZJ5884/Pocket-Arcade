/* ---------------- TAP MATCH ---------------- */
function tapmatch(api, signal, lv){
  const C = 8, R = 10, CS = 40, X0 = 20, Y0 = 74, NC = [3, 4, 5][lv];
  const COL = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff', '#b36bff'];
  let g, score = 0, cursor = 44, dead = false, endT = 0, ended = false, flash = 0, flashTxt = '', shake = null, bonusTxt = '', final = null;
  const at = (r, c) => (r >= 0 && r < R && c >= 0 && c < C) ? g[r][c] : 0;
  function group(r, c){
    const col = at(r, c); if (!col) return [];
    const seen = new Set([r * C + c]), q = [[r, c]], out = [];
    while (q.length) {
      const [rr0, cc] = q.pop(); out.push([rr0, cc]);
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nr = rr0 + dr, nc = cc + dc, k = nr * C + nc; if (!seen.has(k) && at(nr, nc) === col) { seen.add(k); q.push([nr, nc]); } }
    }
    return out;
  }
  function anyGroup(){ for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const v = g[r][c]; if (v && (at(r, c + 1) === v || at(r + 1, c) === v)) return true; } return false; }
  do { g = Array.from({ length: R }, () => Array.from({ length: C }, () => 1 + rand(NC))); } while (!anyGroup());
  function collapse(){
    for (let c = 0; c < C; c++) { const col = []; for (let r = R - 1; r >= 0; r--) if (g[r][c]) col.push(g[r][c]); for (let r = R - 1, k = 0; r >= 0; r--, k++) g[r][c] = k < col.length ? col[k] : 0; }
    let dst = 0;
    for (let c = 0; c < C; c++) { if (g[R - 1][c]) { if (dst !== c) for (let r = 0; r < R; r++) { g[r][dst] = g[r][c]; g[r][c] = 0; } dst++; } }
  }
  function endGame(msgTxt, bonus){
    dead = true; endT = .9;
    const left = g.reduce((a, row) => a + row.filter(Boolean).length, 0);
    score = Math.max(0, score + bonus - left * 10); api.score(score); final = msgTxt + (left ? ' · ' + left + ' tiles left' : '');
  }
  function pop(r, c){
    if (dead) return;
    const grp = group(r, c);
    if (grp.length < 2) { shake = { r, c, t: .3 }; return; }
    grp.forEach(([gr, gc]) => { g[gr][gc] = 0; });
    const pts = (grp.length - 1) * (grp.length - 1) * 10; score += pts; api.score(score); flash = .7; flashTxt = '+' + pts;
    collapse();
    if (!g[R - 1][0]) endGame('Board cleared!', 1000);
    else if (!anyGroup()) endGame('No more matches', 0);
  }
  const cellAt = p => { const c = Math.floor((p.x - X0) / CS), r = Math.floor((p.y - Y0) / CS); return r >= 0 && r < R && c >= 0 && c < C ? [r, c] : null; };
  canvas.addEventListener('pointerdown', e => { const cl = cellAt(pt(e)); if (cl) { cursor = cl[0] * C + cl[1]; pop(cl[0], cl[1]); } }, { signal });
  loop(signal, dt => {
    if (flash > 0) flash -= dt; if (shake) { shake.t -= dt; if (shake.t <= 0) shake = null; }
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, final); } }
    clear();
    text('Tap groups of 2 or more', 100, 30, 16, '#8d94c4'); text(flash > 0 ? flashTxt : '', W - 60, 30, 22, '#ffd75c');
    rr(X0 - 6, Y0 - 6, C * CS + 12, R * CS + 12, 14, '#10132a');
    const hover = padConnected && !dead ? group((cursor / C) | 0, cursor % C) : [];
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const v = g[r][c]; if (!v) continue;
      const off = shake && shake.r === r && shake.c === c ? Math.sin(shake.t * 60) * 3 : 0;
      rr(X0 + c * CS + 2 + off, Y0 + r * CS + 2, CS - 4, CS - 4, 9, COL[v - 1]);
      if (hover.length > 1 && hover.some(h => h[0] === r && h[1] === c)) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(X0 + c * CS + 3, Y0 + r * CS + 3, CS - 6, CS - 6, 8); ctx.stroke(); }
    }
    if (padConnected && !dead) { const x = X0 + (cursor % C) * CS, y = Y0 + ((cursor / C) | 0) * CS; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(x + 1, y + 1, CS - 2, CS - 2); ctx.setLineDash([]); }
    text('Bigger groups score much more', W / 2, 510, 12, '#6c73a6');
  });
  return {
    dir: d => { const c = clamp((cursor % C) + VEC[d][0], 0, C - 1), r = clamp(((cursor / C) | 0) + VEC[d][1], 0, R - 1); cursor = r * C + c; },
    a: () => pop((cursor / C) | 0, cursor % C),
    dbg: () => ({ g, score, dead })
  };
}
