/* ---------------- TIC TAC TOE ---------------- */
const TTT_L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function tttResult(b){
  for (const [a, c, d] of TTT_L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { w: b[a], line: [a, c, d] };
  return b.every(Boolean) ? { w: 0, line: null } : null;
}
function tttMinimax(b, turn, ai, depth){
  const r = tttResult(b);
  if (r) return r.w === ai ? 10 - depth : r.w === 0 ? 0 : depth - 10;
  let best = turn === ai ? -99 : 99;
  for (let i = 0; i < 9; i++) if (!b[i]) {
    b[i] = turn;
    const v = tttMinimax(b, 3 - turn, ai, depth + 1);
    b[i] = 0;
    best = turn === ai ? Math.max(best, v) : Math.min(best, v);
  }
  return best;
}
function tttPick(b, ai, noise){
  const empty = []; for (let i = 0; i < 9; i++) if (!b[i]) empty.push(i);
  if (Math.random() < noise) return empty[rand(empty.length)];
  let best = -99, picks = [];
  for (const i of empty) {
    b[i] = ai; const v = tttMinimax(b, 3 - ai, ai, 1); b[i] = 0;
    if (v > best) { best = v; picks = [i]; } else if (v === best) picks.push(i);
  }
  return picks[rand(picks.length)];
}
function tictactoe(api, signal, lv){
  const X0 = 30, Y0 = 150, CS = 100, ROUNDS = 10, NOISE = [.7, .22, 0][lv], MULT = [1, 2, 3][lv];
  let hist = [], b, round = 0, turn, w = 0, d = 0, l = 0, score = 0, res = null, wait = 0, cursor = 4, msg = '', dead = false, ended = false, endT = 0;
  function newRound(){ hist = []; b = Array(9).fill(0); res = null; turn = round % 2 === 0 ? 1 : 2; wait = turn === 2 ? .6 : 0; msg = turn === 1 ? 'Your move (X)' : 'Computer starts'; }
  newRound();
  function place(i, who){
    b[i] = who; res = tttResult(b);
    if (res) {
      if (res.w === 1) { w++; score += 100 * MULT; msg = 'You win!'; }
      else if (res.w === 2) { l++; msg = 'Computer wins'; }
      else { d++; score += 40 * MULT; msg = 'Draw'; }
      api.score(score); wait = 1.1;
    } else { turn = 3 - who; msg = turn === 1 ? 'Your move (X)' : 'Thinking…'; if (turn === 2) wait = .5; }
  }
  const human = i => { if (!dead && !res && turn === 1 && !b[i]) { hist.push(b.slice()); place(i, 1); } };
  const undo = () => { if (!dead && !res && turn === 1 && hist.length) { b = hist.pop(); msg = 'Your move (X)'; } };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e), c = Math.floor((p.x - X0) / CS), r = Math.floor((p.y - Y0) / CS);
    if (c >= 0 && c < 3 && r >= 0 && r < 3) { cursor = r * 3 + c; human(cursor); }
  }, { signal });
  loop(signal, dt => {
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, w + ' wins · ' + d + ' draws · ' + l + ' losses'); } return; }
    if (res) { wait -= dt; if (wait <= 0) { round++; if (round >= ROUNDS) { dead = true; endT = .2; } else newRound(); } }
    else if (turn === 2) { wait -= dt; if (wait <= 0) place(tttPick(b, 2, NOISE), 2); }
    clear();
    text('Round ' + Math.min(ROUNDS, round + 1) + ' / ' + ROUNDS, 80, 28, 17);
    text('W ' + w + '  D ' + d + '  L ' + l, W - 80, 28, 15, '#8d94c4');
    rr(X0 - 6, Y0 - 6, CS * 3 + 12, CS * 3 + 12, 18, '#1d2243');
    ctx.strokeStyle = '#3b4380'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let k = 1; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(X0 + k * CS, Y0 + 8); ctx.lineTo(X0 + k * CS, Y0 + 3 * CS - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X0 + 8, Y0 + k * CS); ctx.lineTo(X0 + 3 * CS - 8, Y0 + k * CS); ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const cx = X0 + (i % 3) * CS + CS / 2, cy = Y0 + ((i / 3) | 0) * CS + CS / 2, inLine = res && res.line && res.line.includes(i);
      if (b[i] === 1) { ctx.strokeStyle = inLine ? '#ffd75c' : '#ff5c7a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(cx - 24, cy - 24); ctx.lineTo(cx + 24, cy + 24); ctx.moveTo(cx + 24, cy - 24); ctx.lineTo(cx - 24, cy + 24); ctx.stroke(); }
      else if (b[i] === 2) { ctx.strokeStyle = inLine ? '#ffd75c' : '#5cc8ff'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(cx, cy, 27, 0, TAU); ctx.stroke(); }
      else if (padConnected && i === cursor && !res) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(cx - 40, cy - 40, 80, 80, 10); ctx.stroke(); }
    }
    ctx.lineCap = 'butt';
    text(msg, W / 2, 98, 20, res ? '#ffd75c' : '#b9bfe8');
    text('You are X  ·  Hard never loses', W / 2, 500, 12, '#6c73a6');
  });
  return {
    dir: d2 => { const x = clamp(cursor % 3 + VEC[d2][0], 0, 2), y = clamp(((cursor / 3) | 0) + VEC[d2][1], 0, 2); cursor = y * 3 + x; },
    a: () => human(cursor), undo
  };
}
