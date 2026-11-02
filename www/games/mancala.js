/* ---------------- MANCALA ---------------- */
function mcSow(b0, pit, side, noFrames){
  const b = b0.slice(), mine = side === 0 ? 6 : 13, theirs = side === 0 ? 13 : 6;
  let n = b[pit], i = pit; b[pit] = 0;
  const frames = noFrames ? null : [b.slice()];
  while (n > 0) { i = (i + 1) % 14; if (i === theirs) continue; b[i]++; n--; if (frames) frames.push(b.slice()); }
  let extra = false, cap = 0;
  if (i === mine) extra = true;
  else if (((side === 0 && i <= 5) || (side === 1 && i >= 7 && i <= 12)) && b[i] === 1 && b[12 - i] > 0) {
    cap = b[12 - i] + 1; b[mine] += cap; b[i] = 0; b[12 - i] = 0; if (frames) frames.push(b.slice());
  }
  let over = false;
  const empty0 = b[0] + b[1] + b[2] + b[3] + b[4] + b[5] === 0, empty1 = b[7] + b[8] + b[9] + b[10] + b[11] + b[12] === 0;
  if (empty0 || empty1) {
    for (let k = 0; k < 6; k++) { b[6] += b[k]; b[k] = 0; b[13] += b[7 + k]; b[7 + k] = 0; }
    over = true; if (frames) frames.push(b.slice());
  }
  return { b, extra: extra && !over, over, last: i, cap, frames };
}
const mcS = { nodes: 0, deadline: 0, abort: false };
function mcSearch(b, side, depth, alpha, beta){
  if ((++mcS.nodes & 1023) === 0 && Date.now() > mcS.deadline) mcS.abort = true;
  if (mcS.abort) return 0;
  const mine = side === 0 ? 6 : 13, theirs = side === 0 ? 13 : 6, lo = side === 0 ? 0 : 7;
  if (depth <= 0) return b[mine] - b[theirs];
  let best = -999, any = false;
  for (let k = 5; k >= 0; k--) {
    const pit = lo + k; if (!b[pit]) continue;
    any = true;
    const r = mcSow(b, pit, side, true);
    let v;
    if (r.over) v = r.b[mine] - r.b[theirs];
    else if (r.extra) v = mcSearch(r.b, side, depth - 1, alpha, beta);
    else v = -mcSearch(r.b, 1 - side, depth - 1, -beta, -alpha);
    if (mcS.abort) return 0;
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return any ? best : b[mine] - b[theirs];
}
function mcPick(b, side, depth, ms, noise){
  const lo = side === 0 ? 0 : 7, mine = side === 0 ? 6 : 13, theirs = side === 0 ? 13 : 6, pits = [];
  for (let k = 5; k >= 0; k--) if (b[lo + k]) pits.push(lo + k);
  if (!pits.length) return -1;
  if (Math.random() < noise) return pits[rand(pits.length)];
  mcS.deadline = Date.now() + ms; mcS.abort = false; mcS.nodes = 0;
  let best = pits[0];
  for (let d = 1; d <= depth; d++) {
    let bv = -Infinity, bp = -1;
    for (const pit of pits) {
      const r = mcSow(b, pit, side, true);
      let v;
      if (r.over) v = r.b[mine] - r.b[theirs];
      else if (r.extra) v = mcSearch(r.b, side, d - 1, -Infinity, Infinity);
      else v = -mcSearch(r.b, 1 - side, d - 1, -Infinity, Infinity);
      if (mcS.abort) break;
      if (v > bv) { bv = v; bp = pit; }
    }
    if (mcS.abort || bp < 0) break;
    best = bp;
  }
  return best;
}
function mancala(api, signal, lv){
  const L = [{ depth: 2, ms: 200, noise: .4, base: 100 }, { depth: 7, ms: 700, noise: 0, base: 250 }, { depth: 12, ms: 1300, noise: 0, base: 500 }][lv];
  const PX = i => 70 + i * 44, ROWY = [210, 330];
  let hist = [], b = [4,4,4,4,4,4,0,4,4,4,4,4,4,0], turn = 0, anim = null, cursor = 2, wait = 0, msg = 'Your move', last = -1, final = null, endT = 0, ended = false, over = false, showCur = false, flash = 0;
  const pitPos = i => i <= 5 ? [PX(i), ROWY[1]] : i >= 7 && i <= 12 ? [PX(12 - i), ROWY[0]] : i === 6 ? [330, 270] : [30, 270];
  function play(pit, side){
    const r = mcSow(b, pit, side);
    anim = { frames: r.frames, i: 0, t: 0, r, side, pit };
    last = pit;
  }
  function finishAnim(){
    const { r, side } = anim; anim = null; b = r.b;
    if (r.cap) { msg = (side === 0 ? 'You captured ' : 'Computer captured ') + r.cap; flash = 1.2; }
    if (r.over) {
      over = true;
      const me = b[6], cpu = b[13], win = me > cpu;
      const score = me * 10 + (win ? L.base : 0) + (win ? (me - cpu) * 5 : 0);
      final = { score, msg: win ? 'You win ' + me + ' – ' + cpu : me === cpu ? 'Tie ' + me + ' – ' + cpu : 'You lose ' + me + ' – ' + cpu };
      msg = final.msg; endT = 1.2; api.score(score);
      return;
    }
    if (r.extra) { msg = side === 0 ? 'Extra turn!' : 'Computer goes again'; flash = 1; turn = side; }
    else turn = 1 - side;
    if (turn === 1) wait = .5; else if (!r.cap) msg = 'Your move';
    api.score(b[6] * 10);
  }
  const humanPlay = pit => { if (!anim && !over && turn === 0 && pit >= 0 && pit <= 5 && b[pit]) { hist.push(b.slice()); play(pit, 0); } };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    for (let i = 0; i < 6; i++) { const c = pitPos(i); if (Math.hypot(p.x - c[0], p.y - c[1]) < 26) { cursor = i; humanPlay(i); return; } }
  }, { signal });
  loop(signal, dt => {
    if (flash > 0) flash -= dt;
    if (over) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    else if (anim) { anim.t += dt; while (anim && anim.t > .13) { anim.t -= .13; anim.i++; if (anim.i >= anim.frames.length) finishAnim(); } }
    else if (turn === 1) { wait -= dt; if (wait <= 0) { const p = mcPick(b, 1, L.depth, L.ms, L.noise); if (p >= 0) play(p, 1); } }
    const shown = anim ? anim.frames[Math.min(anim.i, anim.frames.length - 1)] : b;
    clear();
    text('Mancala · ' + LEVELS[lv], 14, 28, 16, '#e8ebff', 'left');
    text(msg, W / 2, 80, 16, flash > 0 || over ? '#ffd75c' : '#8d94c4');
    rr(8, 150, 344, 240, 24, '#4a2f1d');
    for (let i = 0; i < 14; i++) {
      const [x, y] = pitPos(i), store = i === 6 || i === 13;
      if (store) { rr(x - 22, y - 80, 44, 160, 22, '#2e1c10'); text(shown[i], x, y, 26, '#fff'); text(i === 6 ? 'YOU' : 'CPU', x, y + 62, 11, '#c9a07a'); continue; }
      const active = i <= 5 && turn === 0 && !anim && !over && shown[i] > 0;
      circle(x, y, 24, last === i && !anim ? '#6b4a2f' : '#2e1c10');
      if (active) { ctx.strokeStyle = 'rgba(255,215,92,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.stroke(); }
      const n = shown[i];
      for (let k = 0; k < Math.min(n, 9); k++) { const a = k * 2.4, rad = k === 0 ? 0 : 8 + (k > 5 ? 5 : 0); circle(x + Math.cos(a) * rad, y + Math.sin(a) * rad - 3, 3.6, ['#ffd75c', '#ff9a5c', '#5cc8ff', '#5cff9a'][k % 4]); }
      text(n, x, y + 14, 12, '#e8ebff');
      if ((padConnected || showCur) && i === cursor && turn === 0 && !over) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 29, 0, TAU); ctx.stroke(); }
    }
    text('Computer', W / 2, 168, 12, '#c9a07a'); text('You', W / 2, 372, 12, '#c9a07a');
    text('Last stone in your store = extra turn  ·  empty pit = capture', W / 2, 440, 12, '#6c73a6');
  });
  return {
    dir: d => { showCur = true; if (d === 'l') cursor = Math.max(0, cursor - 1); else if (d === 'r') cursor = Math.min(5, cursor + 1); },
    a: () => humanPlay(cursor),
    undo: () => { if (!anim && !over && turn === 0 && hist.length) { b = hist.pop(); msg = 'Your move'; last = -1; } }
  };
}
