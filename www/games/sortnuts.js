/* ---------------- NUTS & BOLTS ---------------- */
function nutsSolve(tubes, CAP){
  const seen = new Set(); let nodes = 0;
  const key = t => t.map(x => x.join('')).sort().join('|');
  const won = t => t.every(x => x.length === 0 || (x.length === CAP && x.every(v => v === x[0])));
  function dfs(t, path){
    if (++nodes > 40000) return null;
    if (won(t)) return path;
    const k = key(t); if (seen.has(k)) return null; seen.add(k);
    for (let a = 0; a < t.length; a++) {
      const A = t[a]; if (!A.length) continue;
      const top = A[A.length - 1]; let run = 0;
      while (run < A.length && A[A.length - 1 - run] === top) run++;
      for (let b = 0; b < t.length; b++) {
        if (a === b) continue;
        const B = t[b];
        if (B.length === CAP || (B.length && B[B.length - 1] !== top) || (!B.length && run === A.length)) continue;
        const n = Math.min(run, CAP - B.length), nt = t.map(x => x.slice());
        for (let k = 0; k < n; k++) nt[b].push(nt[a].pop());
        const r = dfs(nt, path.concat([[a, b]]));
        if (r) return r;
      }
    }
    return null;
  }
  return dfs(tubes.map(x => x.slice()), []);
}
function sortnuts(api, signal, lv){
  const NC = [5, 7, 9][lv], CAP = 4, T = NC + 2;
  const COL = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff', '#b36bff', '#ff9a5c', '#ff6fd8', '#b9bfe8', '#2fd0b0'];
  let tubes, undoS = [], sel = -1, moves = 0, time = 0, done = false, endT = 0, ended = false, score = 0, cursor = 0, showCur = false, msg = '', msgT = 0;
  const n1 = Math.ceil(T / 2), n2 = T - n1, BTN = [[12, 490, 108, 36, 'Undo'], [126, 490, 108, 36, 'Restart'], [240, 490, 108, 36, 'New']];
  function generate(){
    for (let tries = 0; tries < 60; tries++) {
      const nuts = []; for (let c = 0; c < NC; c++) for (let k = 0; k < CAP; k++) nuts.push(c);
      for (let i = nuts.length - 1; i > 0; i--) { const j = rand(i + 1); [nuts[i], nuts[j]] = [nuts[j], nuts[i]]; }
      const t = Array.from({ length: T }, () => []);
      nuts.forEach((n, i) => t[(i / CAP) | 0].push(n));
      const isWon = t.every(x => !x.length || x.every(v => v === x[0]));
      if (!isWon && nutsSolve(t, CAP)) return t;
    }
    const t = Array.from({ length: T }, () => []);
    for (let c = 0; c < NC; c++) for (let k = 0; k < CAP; k++) t[(c + k) % NC].push(c);
    return t;
  }
  let start = generate(); tubes = start.map(x => x.slice());
  const pos = i => { const row = i < n1 ? 0 : 1, k = row ? n2 : n1, col = row ? i - n1 : i; return { x: 12 + (336 / k) * (col + .5), y: row ? 300 : 100 }; };
  const TH = CAP * 30 + 14;
  const won = () => tubes.every(x => !x.length || (x.length === CAP && x.every(v => v === x[0])));
  function tryMove(a, b){
    const A = tubes[a], B = tubes[b];
    if (!A.length || a === b || B.length === CAP) return false;
    const top = A[A.length - 1];
    if (B.length && B[B.length - 1] !== top) return false;
    let run = 0; while (run < A.length && A[A.length - 1 - run] === top) run++;
    const n = Math.min(run, CAP - B.length);
    undoS.push(JSON.stringify(tubes));
    for (let k = 0; k < n; k++) B.push(A.pop());
    moves++;
    if (won()) { done = true; endT = .9; score = Math.max(100, [600, 1300, 2500][lv] - moves * 8 - Math.floor(time)); api.score(score); }
    return true;
  }
  function pick(i){
    if (done) return;
    if (sel < 0) { if (tubes[i].length) sel = i; return; }
    if (sel === i) { sel = -1; return; }
    if (tryMove(sel, i)) { sel = -1; return; }
    sel = tubes[i].length ? i : -1;
  }
  const undo = () => { if (undoS.length && !done) { tubes = JSON.parse(undoS.pop()); moves = Math.max(0, moves - 1); sel = -1; } };
  const restart = () => { tubes = start.map(x => x.slice()); undoS = []; moves = 0; sel = -1; };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    for (const b of BTN) if (inRect(p, b)) { if (b[4] === 'Undo') undo(); else if (b[4] === 'Restart') restart(); else { start = generate(); restart(); time = 0; } return; }
    for (let i = 0; i < T; i++) { const q = pos(i); if (p.x > q.x - 24 && p.x < q.x + 24 && p.y > q.y - 22 && p.y < q.y + TH + 10) { cursor = i; pick(i); return; } }
  }, { signal });
  loop(signal, dt => {
    if (!done) time += dt; else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, moves + ' moves · ' + fmtTime(time)); } }
    clear();
    text('Moves ' + moves, 70, 30, 17); text(fmtTime(time), W - 60, 30, 17); text('Sort each colour into its own bolt', W / 2, 62, 13, '#8d94c4');
    for (let i = 0; i < T; i++) {
      const q = pos(i), A = tubes[i], full = A.length === CAP && A.every(v => v === A[0]);
      rr(q.x - 20, q.y, 40, TH, 12, full ? '#1f4a3a' : '#10132a');
      ctx.strokeStyle = i === sel ? '#ffd75c' : full ? '#2f9e6b' : '#3b4380'; ctx.lineWidth = i === sel ? 3 : 2; ctx.beginPath(); ctx.roundRect(q.x - 20, q.y, 40, TH, 12); ctx.stroke();
      ctx.fillStyle = '#4a5290'; ctx.fillRect(q.x - 2, q.y + 6, 4, TH - 12);
      let lift = 0;
      if (i === sel) { const top = A[A.length - 1]; let run = 0; while (run < A.length && A[A.length - 1 - run] === top) run++; lift = run; }
      A.forEach((v, k) => {
        const y = q.y + TH - 8 - (k + 1) * 30 + (k >= A.length - lift && lift ? -14 : 0);
        rr(q.x - 16, y + 2, 32, 25, 8, COL[v]);
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(q.x, y + 14.5, 5.5, 0, TAU); ctx.fill();
        rr(q.x - 16, y + 2, 32, 7, 4, 'rgba(255,255,255,.22)');
      });
      if ((padConnected || showCur) && i === cursor && !done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.roundRect(q.x - 25, q.y - 5, 50, TH + 10, 14); ctx.stroke(); ctx.setLineDash([]); }
    }
    BTN.forEach(b => button(b[0], b[1], b[2], b[3], b[4], b[4] === 'Undo' && !undoS.length ? '#232850' : '#3b4380'));
  });
  return {
    dir: d => { showCur = true; if (d === 'l') cursor = Math.max(0, cursor - 1); else if (d === 'r') cursor = Math.min(T - 1, cursor + 1); else if (d === 'd' && cursor < n1) cursor = Math.min(T - 1, cursor + n1); else if (d === 'u' && cursor >= n1) cursor = Math.max(0, cursor - n1); },
    a: () => pick(cursor), x: undo, undo, y: restart,
    dbg: () => ({ tubes, CAP, done, start })
  };
}
