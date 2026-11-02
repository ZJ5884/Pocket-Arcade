/* ---------------- CHECKERS ---------------- */
const CK_DIRS = [[-1,-1],[-1,1],[1,-1],[1,1]];
function ckStart(){
  const b = new Int8Array(64);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) { if (r < 3) b[r * 8 + c] = -1; else if (r > 4) b[r * 8 + c] = 1; }
  return b;
}
function ckGen(b, side){
  const caps = [], back = side === 1 ? 0 : 7;
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq];
    if (!p || Math.sign(p) !== side) continue;
    const king0 = Math.abs(p) === 2;
    b[sq] = 0;
    (function jump(pos, king, path, taken){
      let any = false;
      for (const [dr, dc] of CK_DIRS) {
        if (!king && dr !== -side) continue;
        const r = pos >> 3, c = pos & 7, lr = r + 2 * dr, lc = c + 2 * dc;
        if (lr < 0 || lr > 7 || lc < 0 || lc > 7) continue;
        const mid = (r + dr) * 8 + c + dc, land = lr * 8 + lc, mp = b[mid];
        if (!mp || Math.sign(mp) === side || taken.includes(mid) || b[land]) continue;
        any = true;
        const np = path.concat(land), nt = taken.concat(mid);
        if (!king && lr === back) caps.push({ path: np, taken: nt });
        else jump(land, king, np, nt);
      }
      if (!any && path.length > 1) caps.push({ path, taken });
    })(sq, king0, [sq], []);
    b[sq] = p;
  }
  if (caps.length) return caps;
  const simple = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq];
    if (!p || Math.sign(p) !== side) continue;
    const king = Math.abs(p) === 2, r = sq >> 3, c = sq & 7;
    for (const [dr, dc] of CK_DIRS) {
      if (!king && dr !== -side) continue;
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7 || b[nr * 8 + nc]) continue;
      simple.push({ path: [sq, nr * 8 + nc], taken: [] });
    }
  }
  return simple;
}
function ckApply(b, m){
  const nb = b.slice(), from = m.path[0], to = m.path[m.path.length - 1], p = nb[from];
  nb[from] = 0; m.taken.forEach(t => { nb[t] = 0; });
  nb[to] = (Math.abs(p) === 1 && (to >> 3) === (p > 0 ? 0 : 7)) ? p * 2 : p;
  return nb;
}
function ckPerft(b, side, d){ if (!d) return 1; let n = 0; for (const m of ckGen(b, side)) n += ckPerft(ckApply(b, m), -side, d - 1); return n; }
function ckEval(b, side){
  let s = 0;
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq]; if (!p) continue;
    const r = sq >> 3, c = sq & 7, sg = Math.sign(p), k = Math.abs(p) === 2;
    let v = k ? 175 : 100;
    if (!k) { v += (sg === 1 ? 7 - r : r) * 4; if (sg === 1 ? r === 7 : r === 0) v += 8; }
    else v += 6 - (Math.abs(3.5 - r) + Math.abs(3.5 - c));
    if (c === 0 || c === 7) v -= 2;
    s += sg * v;
  }
  return s * side;
}
const ckS = { nodes: 0, deadline: 0, abort: false };
function ckNeg(b, side, depth, alpha, beta, ply){
  if ((++ckS.nodes & 511) === 0 && Date.now() > ckS.deadline) ckS.abort = true;
  if (ckS.abort) return 0;
  const ms = ckGen(b, side);
  if (!ms.length) return -20000 + ply;
  if (depth <= 0) { if (ms[0].taken.length && ply < 16) depth = 1; else return ckEval(b, side); }
  for (const m of ms) {
    const v = -ckNeg(ckApply(b, m), -side, depth - 1, -beta, -alpha, ply + 1);
    if (ckS.abort) return 0;
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}
function ckPick(b, side, maxDepth, ms, noise){
  const moves = ckGen(b, side);
  if (!moves.length) return null;
  if (moves.length === 1) return moves[0];
  if (Math.random() < noise) return moves[rand(moves.length)];
  ckS.deadline = Date.now() + ms; ckS.abort = false; ckS.nodes = 0;
  let best = moves[0];
  for (let depth = 1; depth <= maxDepth; depth++) {
    let alpha = -Infinity, bestV = -Infinity, bestM = null;
    for (const m of moves) {
      const v = -ckNeg(ckApply(b, m), -side, depth - 1, -Infinity, -alpha, 1);
      if (ckS.abort) break;
      if (v > bestV) { bestV = v; bestM = m; }
      if (v > alpha) alpha = v;
    }
    if (ckS.abort || !bestM) break;
    best = bestM; moves.splice(moves.indexOf(best), 1); moves.unshift(best);
    if (bestV > 15000) break;
  }
  return best;
}
function checkers(api, signal, lv){
  const X0 = 12, Y0 = 88, SQ = 42, L = [{ depth: 1, ms: 200, noise: .45, base: 150 }, { depth: 5, ms: 700, noise: .05, base: 400 }, { depth: 9, ms: 1300, noise: 0, base: 900 }][lv];
  let hist = [], b, turn = 1, sel = -1, moves = [], last = null, half = 0, plies = 0, msg = '', msgT = 0, phase = 'play', thinkT = 0, cursor = 52, showCur = false, final = null, endT = 0, ended = false;
  const BTN = [12, 478, 336, 40];
  function newGame(){ hist = []; b = ckStart(); turn = 1; sel = -1; moves = ckGen(b, 1); last = null; half = 0; plies = 0; phase = 'play'; msg = ''; msgT = 0; api.score(0); }
  function finish(kind){
    let score, m;
    if (kind === 'win') { score = L.base + Math.max(0, 80 - plies); m = 'You win!'; }
    else if (kind === 'loss') { score = 0; m = 'You lose.'; }
    else { score = Math.round(L.base / 3); m = 'Draw.'; }
    final = { score, msg: m }; phase = 'over'; endT = .9; api.score(score);
  }
  function applyMove(m, side){
    const mover = b[m.path[0]], isMan = Math.abs(mover) === 1;
    b = ckApply(b, m); last = m.path; plies++;
    half = (m.taken.length || isMan) ? 0 : half + 1;
    sel = -1;
    moves = ckGen(b, -side);
    if (!moves.length) { finish(side === 1 ? 'win' : 'loss'); return; }
    if (half >= 80) { finish('draw'); return; }
    turn = -side;
    if (turn === -1) { phase = 'think'; thinkT = .35; } else { phase = 'play'; }
  }
  function activate(sq){
    if (phase !== 'play') return;
    if (sel >= 0) {
      const m = moves.find(x => x.path[0] === sel && x.path[x.path.length - 1] === sq);
      if (m) { hist.push({ b: b.slice(), last, half, plies }); applyMove(m, 1); return; }
    }
    if (b[sq] > 0) {
      if (moves.some(x => x.path[0] === sq)) sel = sq;
      else { sel = -1; if (moves.some(x => x.taken.length)) { msg = 'You must capture'; msgT = 1.2; } }
    } else sel = -1;
  }
  newGame();
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (inRect(p, BTN)) { newGame(); return; }
    const c = Math.floor((p.x - X0) / SQ), r = Math.floor((p.y - Y0) / SQ);
    if (c >= 0 && c < 8 && r >= 0 && r < 8) { cursor = r * 8 + c; activate(cursor); }
  }, { signal });
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt;
    if (phase === 'think') { thinkT -= dt; if (thinkT <= 0) { const m = ckPick(b, -1, L.depth, L.ms, L.noise); if (m) applyMove(m, -1); } }
    if (phase === 'over') { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    clear();
    text('Checkers · ' + LEVELS[lv], 14, 28, 16, '#e8ebff', 'left');
    const status = phase === 'think' ? 'Thinking…' : phase === 'over' ? final.msg : msgT > 0 ? msg : moves.some(x => x.taken.length) && turn === 1 ? 'Capture!' : 'Your move';
    text(status, W - 14, 28, 16, phase === 'over' || msgT > 0 ? '#ffd75c' : '#8d94c4', 'right');
    let mine = 0, theirs = 0; for (let i = 0; i < 64; i++) { if (b[i] > 0) mine++; else if (b[i] < 0) theirs++; }
    text('You ' + mine + '   Computer ' + theirs, W / 2, 62, 14, '#8d94c4');
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const sq = r * 8 + c, x = X0 + c * SQ, y = Y0 + r * SQ;
      ctx.fillStyle = (r + c) % 2 ? '#6a72b5' : '#c5cbf2'; ctx.fillRect(x, y, SQ, SQ);
      if (last && last.includes(sq)) { ctx.fillStyle = 'rgba(255,215,92,.38)'; ctx.fillRect(x, y, SQ, SQ); }
      if (sq === sel) { ctx.fillStyle = 'rgba(255,215,92,.6)'; ctx.fillRect(x, y, SQ, SQ); }
      const p = b[sq];
      if (p) {
        const cx = x + SQ / 2, cy = y + SQ / 2, mineP = p > 0;
        circle(cx, cy + 2, 16, 'rgba(0,0,0,.25)');
        circle(cx, cy, 16, mineP ? '#ff5c7a' : '#23263f');
        ctx.strokeStyle = mineP ? '#ffb3c0' : '#8d94c4'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, TAU); ctx.stroke();
        if (Math.abs(p) === 2) { ctx.fillStyle = '#ffd75c'; ctx.beginPath(); ctx.moveTo(cx - 8, cy + 5); ctx.lineTo(cx - 9, cy - 5); ctx.lineTo(cx - 4, cy); ctx.lineTo(cx, cy - 7); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx + 9, cy - 5); ctx.lineTo(cx + 8, cy + 5); ctx.closePath(); ctx.fill(); }
      }
    }
    if (sel >= 0) moves.filter(m => m.path[0] === sel).forEach(m => { const t = m.path[m.path.length - 1]; circle(X0 + (t & 7) * SQ + SQ / 2, Y0 + (t >> 3) * SQ + SQ / 2, 7, 'rgba(255,215,92,.9)'); });
    if ((padConnected || showCur) && phase === 'play') { const x = X0 + (cursor & 7) * SQ, y = Y0 + (cursor >> 3) * SQ; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, SQ - 3, SQ - 3); }
    button(BTN[0], BTN[1], BTN[2], BTN[3], 'New game', '#3b4380');
  });
  return {
    dir: d => { showCur = true; const x = clamp((cursor & 7) + VEC[d][0], 0, 7), y = clamp((cursor >> 3) + VEC[d][1], 0, 7); cursor = y * 8 + x; },
    a: () => activate(cursor), x: () => { sel = -1; },
    undo: () => { if (phase === 'play' && turn === 1 && hist.length) { const h = hist.pop(); b = h.b; last = h.last; half = h.half; plies = h.plies; sel = -1; moves = ckGen(b, 1); msg = ''; msgT = 0; } }
  };
}
