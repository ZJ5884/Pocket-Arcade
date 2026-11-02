/* ---------------- CHESS ---------------- */
const CH_N = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const CH_K = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const CH_B = [[-1,-1],[-1,1],[1,-1],[1,1]];
const CH_R = [[-1,0],[1,0],[0,-1],[0,1]];
const CH_VAL = [0, 100, 320, 330, 500, 900, 0];
const CH_PST = [null,
  [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
  [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50]
];
const chSign = p => p > 0 ? 1 : -1;

function chStart(){
  const b = new Int8Array(64), back = [4, 2, 3, 5, 6, 3, 2, 4];
  for (let c = 0; c < 8; c++) { b[c] = -back[c]; b[8 + c] = -1; b[48 + c] = 1; b[56 + c] = back[c]; }
  return { b, turn: 1, cs: 15, ep: -1, half: 0 };
}
function chFen(fen){
  const parts = fen.split(' '), b = new Int8Array(64);
  let i = 0;
  for (const ch of parts[0]) {
    if (ch === '/') continue;
    if (ch >= '1' && ch <= '8') { i += +ch; continue; }
    const l = ch.toLowerCase();
    b[i++] = (ch === l ? -1 : 1) * ('pnbrqk'.indexOf(l) + 1);
  }
  const c = parts[2] || '-', ep = parts[3] || '-';
  return { b, turn: parts[1] === 'b' ? -1 : 1, half: 0,
    cs: (c.includes('K') ? 1 : 0) | (c.includes('Q') ? 2 : 0) | (c.includes('k') ? 4 : 0) | (c.includes('q') ? 8 : 0),
    ep: ep === '-' ? -1 : (8 - +ep[1]) * 8 + (ep.charCodeAt(0) - 97) };
}
function chKing(b, side){ const k = side * 6; for (let i = 0; i < 64; i++) if (b[i] === k) return i; return -1; }
function chAttacked(b, sq, by){
  const r = sq >> 3, c = sq & 7, pr = r + (by === 1 ? 1 : -1);
  if (pr >= 0 && pr < 8) {
    if (c > 0 && b[pr * 8 + c - 1] === by) return true;
    if (c < 7 && b[pr * 8 + c + 1] === by) return true;
  }
  for (const [dr, dc] of CH_N) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === by * 2) return true; }
  for (const [dr, dc] of CH_K) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === by * 6) return true; }
  for (const [dr, dc] of CH_B) {
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) { const p = b[nr * 8 + nc]; if (p) { if (p === by * 3 || p === by * 5) return true; break; } nr += dr; nc += dc; }
  }
  for (const [dr, dc] of CH_R) {
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) { const p = b[nr * 8 + nc]; if (p) { if (p === by * 4 || p === by * 5) return true; break; } nr += dr; nc += dc; }
  }
  return false;
}
/* Pseudo-legal moves. m = { f, t, p: promotion piece type or 0, k: 0 normal, 1 double push, 2 en passant, 3 castle } */
function chGen(s, caps){
  const b = s.b, side = s.turn, out = [];
  const push = (f, t, p, k) => out.push({ f, t, p: p || 0, k: k || 0 });
  for (let sq = 0; sq < 64; sq++) {
    const pc = b[sq];
    if (!pc || chSign(pc) !== side) continue;
    const t = Math.abs(pc), r = sq >> 3, c = sq & 7;
    if (t === 1) {
      const dir = -side, nr = r + dir;
      if (nr < 0 || nr > 7) continue;
      const last = nr === 0 || nr === 7;
      if (!b[nr * 8 + c]) {
        if (last) { push(sq, nr * 8 + c, 5); if (!caps) { push(sq, nr * 8 + c, 4); push(sq, nr * 8 + c, 3); push(sq, nr * 8 + c, 2); } }
        else if (!caps) {
          push(sq, nr * 8 + c);
          if (r === (side === 1 ? 6 : 1) && !b[(r + 2 * dir) * 8 + c]) push(sq, (r + 2 * dir) * 8 + c, 0, 1);
        }
      }
      for (const dc of [-1, 1]) {
        const nc = c + dc;
        if (nc < 0 || nc > 7) continue;
        const to = nr * 8 + nc, tp = b[to];
        if (tp && chSign(tp) === -side) {
          if (last) { push(sq, to, 5); if (!caps) { push(sq, to, 4); push(sq, to, 3); push(sq, to, 2); } }
          else push(sq, to);
        } else if (!tp && to === s.ep) push(sq, to, 0, 2);
      }
    } else if (t === 2 || t === 6) {
      for (const [dr, dc] of (t === 2 ? CH_N : CH_K)) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
        const to = nr * 8 + nc, tp = b[to];
        if (!tp) { if (!caps) push(sq, to); } else if (chSign(tp) === -side) push(sq, to);
      }
      if (t === 6 && !caps) {
        const by = -side;
        if (side === 1 && sq === 60) {
          if ((s.cs & 1) && !b[61] && !b[62] && b[63] === 4 && !chAttacked(b, 60, by) && !chAttacked(b, 61, by) && !chAttacked(b, 62, by)) push(60, 62, 0, 3);
          if ((s.cs & 2) && !b[59] && !b[58] && !b[57] && b[56] === 4 && !chAttacked(b, 60, by) && !chAttacked(b, 59, by) && !chAttacked(b, 58, by)) push(60, 58, 0, 3);
        } else if (side === -1 && sq === 4) {
          if ((s.cs & 4) && !b[5] && !b[6] && b[7] === -4 && !chAttacked(b, 4, by) && !chAttacked(b, 5, by) && !chAttacked(b, 6, by)) push(4, 6, 0, 3);
          if ((s.cs & 8) && !b[3] && !b[2] && !b[1] && b[0] === -4 && !chAttacked(b, 4, by) && !chAttacked(b, 3, by) && !chAttacked(b, 2, by)) push(4, 2, 0, 3);
        }
      }
    } else {
      const dirs = t === 3 ? CH_B : t === 4 ? CH_R : CH_B.concat(CH_R);
      for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const to = nr * 8 + nc, tp = b[to];
          if (!tp) { if (!caps) push(sq, to); }
          else { if (chSign(tp) === -side) push(sq, to); break; }
          nr += dr; nc += dc;
        }
      }
    }
  }
  return out;
}
function chMake(s, m){
  const b = s.b.slice(), p = b[m.f], side = s.turn, t = Math.abs(p);
  let cs = s.cs, ep = -1, half = s.half + 1;
  if (t === 1 || b[m.t]) half = 0;
  b[m.t] = p; b[m.f] = 0;
  if (m.k === 2) b[m.t + (side === 1 ? 8 : -8)] = 0;
  if (m.k === 1) ep = (m.f + m.t) / 2;
  if (m.k === 3) { if (m.t > m.f) { b[m.t - 1] = b[m.t + 1]; b[m.t + 1] = 0; } else { b[m.t + 1] = b[m.t - 2]; b[m.t - 2] = 0; } }
  if (m.p) b[m.t] = side * m.p;
  if (t === 6) cs &= side === 1 ? ~3 : ~12;
  for (const q of [m.f, m.t]) { if (q === 63) cs &= ~1; else if (q === 56) cs &= ~2; else if (q === 7) cs &= ~4; else if (q === 0) cs &= ~8; }
  return { b, turn: -side, cs, ep, half };
}
function chLegal(s){
  const out = [], side = s.turn;
  for (const m of chGen(s, false)) {
    const ns = chMake(s, m);
    if (!chAttacked(ns.b, chKing(ns.b, side), -side)) out.push(m);
  }
  return out;
}
const chInCheck = s => chAttacked(s.b, chKing(s.b, s.turn), -s.turn);
function chInsufficient(b){
  let minors = 0;
  for (let i = 0; i < 64; i++) { const t = Math.abs(b[i]); if (t === 1 || t === 4 || t === 5) return false; if (t === 2 || t === 3) minors++; }
  return minors <= 1;
}
const chKey = s => s.b.join('') + '|' + s.turn + '|' + s.cs + '|' + s.ep;

function chEval(s){
  const b = s.b; let nonPawn = 0;
  for (let i = 0; i < 64; i++) { const t = Math.abs(b[i]); if (t >= 2 && t <= 5) nonPawn += CH_VAL[t]; }
  const endgame = nonPawn <= 2600;
  let score = 0;
  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!p) continue;
    const t = Math.abs(p), col = chSign(p), idx = col === 1 ? i : i ^ 56;
    score += col * (CH_VAL[t] + CH_PST[t === 6 && endgame ? 7 : t][idx]);
  }
  return score * s.turn;
}
const chOrder = (s, ms) => {
  const b = s.b;
  ms.forEach(m => { const cap = Math.abs(b[m.t]); m.o = (cap ? 10 * CH_VAL[cap] - CH_VAL[Math.abs(b[m.f])] / 10 : 0) + (m.k === 2 ? 900 : 0) + (m.p ? CH_VAL[m.p] : 0); });
  return ms.sort((a, c) => c.o - a.o);
};
const chS = { nodes: 0, deadline: 0, abort: false };
function chTick(){ if ((++chS.nodes & 1023) === 0 && Date.now() > chS.deadline) chS.abort = true; return chS.abort; }
function chQ(s, alpha, beta, ply){
  if (chTick()) return 0;
  const stand = chEval(s);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (ply > 6) return alpha;
  const side = s.turn;
  for (const m of chOrder(s, chGen(s, true))) {
    const ns = chMake(s, m);
    if (chAttacked(ns.b, chKing(ns.b, side), -side)) continue;
    const v = -chQ(ns, -beta, -alpha, ply + 1);
    if (chS.abort) return 0;
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}
function chNeg(s, depth, alpha, beta, ply){
  if (chTick()) return 0;
  const side = s.turn, inChk = chAttacked(s.b, chKing(s.b, side), -side);
  if (inChk && ply < 8) depth++;
  if (depth <= 0) return chQ(s, alpha, beta, 0);
  let legal = 0;
  for (const m of chOrder(s, chGen(s, false))) {
    const ns = chMake(s, m);
    if (chAttacked(ns.b, chKing(ns.b, side), -side)) continue;
    legal++;
    const v = -chNeg(ns, depth - 1, -beta, -alpha, ply + 1);
    if (chS.abort) return 0;
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  if (!legal) return inChk ? -30000 + ply : 0;
  return alpha;
}
function chSearch(s, maxDepth, ms, noise){
  const moves = chLegal(s);
  if (!moves.length) return null;
  if (moves.length === 1) return moves[0];
  chS.deadline = Date.now() + ms; chS.abort = false; chS.nodes = 0;
  chOrder(s, moves);
  let best = moves[0];
  for (let depth = 1; depth <= maxDepth; depth++) {
    let alpha = -Infinity, bestV = -Infinity, bestM = null;
    for (const m of moves) {
      const ns = chMake(s, m);
      let v = noise
        ? -chNeg(ns, depth - 1, -Infinity, Infinity, 1) + (Math.random() - .5) * 2 * noise
        : -chNeg(ns, depth - 1, -Infinity, -alpha, 1);
      if (chS.abort) break;
      if (v > bestV) { bestV = v; bestM = m; }
      if (v > alpha) alpha = v;
    }
    if (chS.abort) break;
    best = bestM;
    moves.splice(moves.indexOf(best), 1); moves.unshift(best);
    if (bestV > 29000) break;
  }
  return best;
}

function chPiece(t, cx, cy, sz, white){
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sz / 100, sz / 100);
  const fill = white ? '#fbfaf5' : '#23263f', line = white ? '#2a2d46' : '#e4e7ff';
  ctx.fillStyle = fill; ctx.strokeStyle = line; ctx.lineWidth = 3.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const poly = pts => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  const disc = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke(); };
  const base = (w, y) => { ctx.beginPath(); ctx.roundRect(-w, y, 2 * w, 11, 4); ctx.fill(); ctx.stroke(); };
  if (t === 1) { poly([[-12, -4], [12, -4], [20, 28], [-20, 28]]); disc(0, -18, 14); base(26, 28); }
  else if (t === 2) {
    poly([[-22, 30], [-20, 10], [-8, -4], [-26, -4], [-31, -15], [-14, -34], [-8, -44], [1, -35], [14, -30], [25, -8], [27, 30]]);
    ctx.fillStyle = line; ctx.beginPath(); ctx.arc(-12, -22, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = fill;
    base(30, 28);
  }
  else if (t === 3) { poly([[-18, 28], [-12, 6], [12, 6], [18, 28]]); ctx.beginPath(); ctx.ellipse(0, -8, 15, 24, 0, 0, TAU); ctx.fill(); ctx.stroke(); disc(0, -36, 6.5); ctx.beginPath(); ctx.moveTo(-5, -14); ctx.lineTo(6, -26); ctx.stroke(); base(28, 28); }
  else if (t === 4) { poly([[-24, -40], [-14, -40], [-14, -31], [-5, -31], [-5, -40], [5, -40], [5, -31], [14, -31], [14, -40], [24, -40], [24, -24], [16, -18], [16, 22], [24, 30], [-24, 30], [-16, 22], [-16, -18], [-24, -24]]); base(30, 28); }
  else if (t === 5) { poly([[-28, -34], [-21, -12], [-14, -38], [-7, -12], [0, -42], [7, -12], [14, -38], [21, -12], [28, -34], [22, 24], [-22, 24]]); [-28, -14, 0, 14, 28].forEach((x, i) => disc(x, [-36, -40, -44, -40, -36][i], 4.5)); base(30, 24); }
  else if (t === 6) { poly([[-26, -12], [-13, -24], [13, -24], [26, -12], [19, 24], [-19, 24]]); ctx.beginPath(); ctx.roundRect(-4.5, -50, 9, 28, 3); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(-13, -42, 26, 9, 3); ctx.fill(); ctx.stroke(); base(30, 24); }
  ctx.restore();
}

function chess(api, signal, lv){
  const X0 = 12, Y0 = 88, SQ = 42, BTN = [[12, 478, 106, 40, 'Undo'], [127, 478, 106, 40, 'Hint'], [242, 478, 106, 40, 'New game']];
  const LV = [{ name: 'Easy', depth: 1, ms: 300, noise: 120, base: 100 }, { name: 'Medium', depth: 3, ms: 800, noise: 15, base: 300 }, { name: 'Hard', depth: 6, ms: 1500, noise: 0, base: 700 }];
  let phase = 'play', s = chStart(), hist = [], undo = [], sel = -1, selMoves = [], legal = [], last = null, hintMove = null, hints = 0, inChk = false;
  let thinkT = 0, promoMoves = null, promoIdx = 0, endT = 0, final = null, ended = false, cursor = 52, moves = 0, showCur = false;
  const PROMO = [5, 4, 3, 2], promoRect = i => [30 + i * 75, 220, 66, 80];
  function newGame(){
    s = chStart(); hist = [chKey(s)]; undo = []; sel = -1; selMoves = []; legal = chLegal(s); last = null; hintMove = null; hints = 0; inChk = false; moves = 0; phase = 'play'; final = null; api.score(0);
  }
  function refresh(){
    hist.push(chKey(s)); legal = chLegal(s); inChk = chInCheck(s);
    let kind = 'ok';
    if (!legal.length) kind = inChk ? 'mate' : 'stalemate';
    else if (s.half >= 100) kind = 'fifty';
    else if (chInsufficient(s.b)) kind = 'material';
    else if (hist.filter(k => k === hist[hist.length - 1]).length >= 3) kind = 'repeat';
    if (kind === 'ok') return false;
    const base = LV[lv].base; let score, msg;
    if (kind === 'mate' && s.turn === -1) { score = base + Math.max(0, 100 - moves) - hints * 30; score = Math.max(score, Math.round(base / 2)); msg = 'Checkmate. You win!'; }
    else if (kind === 'mate') { score = 0; msg = 'Checkmate. You lose.'; }
    else { score = Math.round(base / 3); msg = { stalemate: 'Stalemate. Draw.', fifty: 'Draw by the 50-move rule.', material: 'Draw: not enough pieces.', repeat: 'Draw by repetition.' }[kind]; }
    final = { score, msg }; phase = 'over'; endT = .9; api.score(score);
    return true;
  }
  function playerMove(m){
    undo.push({ s, hist: hist.slice(), last, moves });
    s = chMake(s, m); last = [m.f, m.t]; sel = -1; selMoves = []; hintMove = null; moves++;
    if (!refresh()) { phase = 'think'; thinkT = .3; }
  }
  function aiMove(){
    const L = LV[lv], m = chSearch(s, L.depth, L.ms, L.noise);
    if (!m) return;
    s = chMake(s, m); last = [m.f, m.t];
    if (!refresh()) phase = 'play';
  }
  function doUndo(){
    if (phase !== 'play' || !undo.length) return;
    const u = undo.pop(); s = u.s; hist = u.hist; last = u.last; moves = u.moves; legal = chLegal(s); inChk = chInCheck(s); sel = -1; selMoves = []; hintMove = null;
  }
  function doHint(){ if (phase !== 'play') return; hintMove = chSearch(s, 3, 700, 0); hints++; }
  function activate(sq){
    if (phase !== 'play') return;
    if (sel >= 0) {
      const ms = selMoves.filter(m => m.t === sq);
      if (ms.length) { if (ms.length > 1) { promoMoves = ms; promoIdx = 0; phase = 'promo'; } else playerMove(ms[0]); return; }
    }
    if (s.b[sq] > 0 && sel !== sq) { sel = sq; selMoves = legal.filter(m => m.f === sq); }
    else { sel = -1; selMoves = []; }
  }
  function choosePromo(i){ const m = promoMoves.find(x => x.p === PROMO[i]); phase = 'play'; promoMoves = null; if (m) playerMove(m); }
  newGame();
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (phase === 'promo') { for (let i = 0; i < 4; i++) if (inRect(p, promoRect(i))) choosePromo(i); return; }
    BTN.forEach((b, i) => { if (inRect(p, b)) { if (i === 0) doUndo(); else if (i === 1) doHint(); else newGame(); } });
    const c = Math.floor((p.x - X0) / SQ), r = Math.floor((p.y - Y0) / SQ);
    if (c >= 0 && c < 8 && r >= 0 && r < 8) { cursor = r * 8 + c; activate(cursor); }
  }, { signal });
  loop(signal, dt => {
    if (phase === 'think') { thinkT -= dt; if (thinkT <= 0) aiMove(); }
    if (phase === 'over') { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    clear();
    text('Chess · ' + LV[lv].name, 14, 28, 16, '#e8ebff', 'left');
    const status = phase === 'think' ? 'Thinking…' : phase === 'over' ? final.msg : inChk ? 'Check!' : 'Your move';
    text(status, W - 14, 28, 16, inChk || phase === 'over' ? '#ffd75c' : '#8d94c4', 'right');
    const start = { 1: 8, 2: 2, 3: 2, 4: 2, 5: 1 }, have = { '1': {}, '-1': {} };
    for (const k of [1, -1]) for (let t = 1; t <= 5; t++) have[k][t] = 0;
    for (let i = 0; i < 64; i++) if (s.b[i] && Math.abs(s.b[i]) < 6) have[chSign(s.b[i])][Math.abs(s.b[i])]++;
    [[-1, 62], [1, 446]].forEach(([col, y]) => {
      let x = 20;
      for (const t of [5, 4, 3, 2, 1]) for (let n = 0; n < start[t] - have[col][t]; n++) { chPiece(t, x, y + 8, 22, col === 1); x += 14; }
    });
    const kingSq = inChk ? chKing(s.b, s.turn) : -1;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const sq = r * 8 + c, x = X0 + c * SQ, y = Y0 + r * SQ;
      ctx.fillStyle = (r + c) % 2 ? '#6a72b5' : '#c5cbf2'; ctx.fillRect(x, y, SQ, SQ);
      if (last && (sq === last[0] || sq === last[1])) { ctx.fillStyle = 'rgba(255,215,92,.38)'; ctx.fillRect(x, y, SQ, SQ); }
      if (hintMove && (sq === hintMove.f || sq === hintMove.t)) { ctx.fillStyle = 'rgba(92,255,154,.5)'; ctx.fillRect(x, y, SQ, SQ); }
      if (sq === sel) { ctx.fillStyle = 'rgba(255,215,92,.6)'; ctx.fillRect(x, y, SQ, SQ); }
      if (sq === kingSq) { ctx.fillStyle = 'rgba(255,60,90,.55)'; ctx.fillRect(x, y, SQ, SQ); }
      const p = s.b[sq];
      if (p) chPiece(Math.abs(p), x + SQ / 2, y + SQ / 2 + 1, SQ * .86, p > 0);
    }
    selMoves.forEach(m => {
      const x = X0 + (m.t & 7) * SQ + SQ / 2, y = Y0 + (m.t >> 3) * SQ + SQ / 2;
      if (s.b[m.t] || m.k === 2) { ctx.strokeStyle = 'rgba(20,24,50,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, SQ / 2 - 3, 0, TAU); ctx.stroke(); }
      else circle(x, y, 6, 'rgba(20,24,50,.55)');
    });
    if ((padConnected || showCur) && phase === 'play') { const x = X0 + (cursor & 7) * SQ, y = Y0 + (cursor >> 3) * SQ; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, SQ - 3, SQ - 3); }
    BTN.forEach((b, i) => button(b[0], b[1], b[2], b[3], b[4], i === 0 && !undo.length ? '#232850' : '#3b4380'));
    if (phase === 'promo') {
      rr(14, 176, 332, 150, 16, 'rgba(10,12,28,.94)'); text('Promote to', W / 2, 198, 16, '#e8ebff');
      PROMO.forEach((t, i) => { const r = promoRect(i); rr(r[0], r[1], r[2], r[3], 12, i === promoIdx ? '#4f7cff' : '#2c3263'); chPiece(t, r[0] + r[2] / 2, r[1] + r[3] / 2, 52, true); });
    }
  });
  return {
    dir: d => {
      showCur = true;
      if (phase === 'promo') promoIdx = clamp(promoIdx + (d === 'r' ? 1 : d === 'l' ? -1 : 0), 0, 3);
      else { const x = clamp((cursor & 7) + VEC[d][0], 0, 7), y = clamp((cursor >> 3) + VEC[d][1], 0, 7); cursor = y * 8 + x; }
    },
    a: () => { if (phase === 'promo') choosePromo(promoIdx); else activate(cursor); },
    x: doUndo, y: doHint, undo: doUndo
  };
}
