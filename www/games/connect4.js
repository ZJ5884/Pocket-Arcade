/* ---------------- CONNECT 4 ---------------- */
function c4Win(b, p){
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    if (b[r * 7 + c] !== p) continue;
    for (const [dx, dy] of dirs) {
      let k = 1;
      while (k < 4) { const x = c + dx * k, y = r + dy * k; if (x < 0 || x >= 7 || y < 0 || y >= 6 || b[y * 7 + x] !== p) break; k++; }
      if (k === 4) return true;
    }
  }
  return false;
}
const c4Moves = b => [3, 2, 4, 1, 5, 0, 6].filter(c => !b[c]);
function c4Drop(b, c, p){ for (let r = 5; r >= 0; r--) if (!b[r * 7 + c]) { b[r * 7 + c] = p; return r; } return -1; }
function c4Eval(b, p){
  const o = 3 - p; let s = 0;
  for (let r = 0; r < 6; r++) if (b[r * 7 + 3] === p) s += 3;
  for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    const ex = c + dx * 3, ey = r + dy * 3;
    if (ex < 0 || ex >= 7 || ey < 0 || ey >= 6) continue;
    let mine = 0, theirs = 0;
    for (let k = 0; k < 4; k++) { const v = b[(r + dy * k) * 7 + c + dx * k]; if (v === p) mine++; else if (v === o) theirs++; }
    if (mine && theirs) continue;
    if (mine === 3) s += 5; else if (mine === 2) s += 2; else if (theirs === 3) s -= 5; else if (theirs === 2) s -= 2;
  }
  return s;
}
function c4Neg(b, p, depth, alpha, beta){
  if (c4Win(b, 3 - p)) return -100000 - depth;
  const mv = c4Moves(b);
  if (!mv.length) return 0;
  if (depth === 0) return c4Eval(b, p);
  let best = -Infinity;
  for (const c of mv) {
    const r = c4Drop(b, c, p);
    const v = -c4Neg(b, 3 - p, depth - 1, -beta, -alpha);
    b[r * 7 + c] = 0;
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}
function c4Pick(b, p, depth, noise){
  const mv = c4Moves(b);
  if (Math.random() < noise) return mv[rand(mv.length)];
  let best = -Infinity, pick = mv[0];
  for (const c of mv) {
    const r = c4Drop(b, c, p);
    let v = c4Win(b, p) ? 1e6 : -c4Neg(b, 3 - p, depth - 1, -1e7, 1e7);
    b[r * 7 + c] = 0;
    v += Math.random() * .5;
    if (v > best) { best = v; pick = c; }
  }
  return pick;
}
function connect4(api, signal, lv){
  const X0 = 12, Y0 = 110, CS = 48;
  let hist = [], b = Array(42).fill(0), level = 1, score = 0, games = 0, turn = 1, col = 3, anim = null, msg = '', msgT = 0, aiT = .5, dead = false, moves = 0, endT = 0, ended = false;
  function newGame(){ hist = []; b = Array(42).fill(0); games++; turn = games % 2 ? 1 : 2; moves = 0; anim = null; aiT = .5; }
  newGame();
  function play(c){
    if (anim || dead || msgT > 0) return;
    let r = -1; for (let k = 5; k >= 0; k--) if (!b[k * 7 + c]) { r = k; break; }
    if (r < 0) return;
    anim = { c, r, y: Y0 - CS, v: 0, p: turn };
  }
  function land(){
    const { c, r, p } = anim; b[r * 7 + c] = p; anim = null; moves++;
    if (c4Win(b, p)) {
      if (p === 1) { const pts = 100 * level + Math.max(0, 42 - moves) * 2; score += pts; api.score(score); msg = 'You win!  +' + pts; msgT = 1.4; level++; }
      else { msg = 'Computer wins'; dead = true; endT = 1.2; }
    } else if (!c4Moves(b).length) { score += 20; api.score(score); msg = 'Draw  +20'; msgT = 1.2; }
    else { turn = 3 - turn; aiT = .35; }
  }
  const human = c => { if (turn === 1 && !anim && !dead && msgT <= 0) { const before = { b: b.slice(), moves }; play(c); if (anim) hist.push(before); } };
  const undo = () => { if (turn === 1 && !anim && !dead && msgT <= 0 && hist.length) { const h = hist.pop(); b = h.b; moves = h.moves; } };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e), c = Math.floor((p.x - X0) / CS);
    if (c >= 0 && c < 7) { col = c; human(c); }
  }, { signal });
  loop(signal, dt => {
    if (msgT > 0) { msgT -= dt; if (msgT <= 0 && !dead) newGame(); }
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Reached level ' + level); } }
    if (anim) {
      anim.v += 2400 * dt; anim.y += anim.v * dt;
      const ty = Y0 + anim.r * CS;
      if (anim.y >= ty) { anim.y = ty; land(); }
    } else if (!dead && msgT <= 0 && turn === 2) {
      aiT -= dt;
      if (aiT <= 0) play(c4Pick(b.slice(), 2, [[1, 2, 2, 3], [2, 3, 4, 5], [4, 5, 6, 7]][lv][Math.min(3, level - 1)], [.35, level === 1 ? .25 : 0, 0][lv]));
    }
    clear();
    text('Level ' + level, 70, 28, 18); text('Wins make it harder', W - 100, 28, 13, '#8d94c4');
    text(turn === 1 && !dead && msgT <= 0 ? 'Your turn' : turn === 2 && !dead && msgT <= 0 ? 'Thinking…' : '', W / 2, 52, 14, '#b9bfe8');
    rr(X0 - 6, Y0 - 6, CS * 7 + 12, CS * 6 + 12, 16, '#2b3a9a');
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
      const v = b[r * 7 + c];
      circle(X0 + c * CS + CS / 2, Y0 + r * CS + CS / 2, 19, v === 1 ? '#ff5c7a' : v === 2 ? '#ffd75c' : '#171b33');
    }
    if (anim) circle(X0 + anim.c * CS + CS / 2, anim.y + CS / 2, 19, anim.p === 1 ? '#ff5c7a' : '#ffd75c');
    if (turn === 1 && !anim && !dead && msgT <= 0) circle(X0 + col * CS + CS / 2, Y0 - 26, 15, 'rgba(255,92,122,.8)');
    if (msgT > 0 || dead) text(msg, W / 2, 470, 24, '#ffd75c');
  });
  return {
    dir: d => { if (d === 'l') col = Math.max(0, col - 1); else if (d === 'r') col = Math.min(6, col + 1); else if (d === 'd') human(col); },
    a: () => human(col), undo
  };
}
