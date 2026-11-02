/* ---------------- SNAKES & LADDERS ---------------- */
const SL_JUMPS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100, 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
function slSteps(from, d){ const out = []; for (let k = 1; k <= d; k++) { let s = from + k; if (s > 100) s = 200 - s; out.push(s); } return out; }
function snakesladders(api, signal, lv){
  const CS = 34, X0 = 10, Y0 = 62;
  const cellXY = n => { const r = Math.floor((n - 1) / 10), c = r % 2 === 0 ? (n - 1) % 10 : 9 - ((n - 1) % 10); return [X0 + c * CS + CS / 2, Y0 + (9 - r) * CS + CS / 2]; };
  let pos = [0, 0], turn = 0, phase = 'idle', timer = 0, dice = 1, face = 1, queue = [], msg = 'Roll the dice', landed = 0, pTurns = 0, over = false, endT = 0, ended = false, final = null, lucky = false;
  const BTN = [140, 446, 170, 56];
  function rollNow(){
    if (phase !== 'idle' || over) return;
    phase = 'rolling'; timer = .55;
  }
  function settle(){
    let d1 = 1 + rand(6);
    lucky = false;
    if ((lv === 0 && turn === 0) || (lv === 2 && turn === 1)) { const d2 = 1 + rand(6); if (d2 > d1) { d1 = d2; } lucky = true; }
    dice = d1; face = d1;
    queue = slSteps(pos[turn], dice);
    if (turn === 0) pTurns++;
    phase = 'moving'; timer = .16;
    msg = (turn === 0 ? 'You rolled ' : 'Computer rolled ') + dice + (lucky ? ' (lucky dice)' : '');
  }
  function afterMove(){
    const land = pos[turn];
    if (SL_JUMPS[land]) { landed = land; phase = 'jump'; timer = .5; msg = SL_JUMPS[land] > land ? 'Ladder! Up to ' + SL_JUMPS[land] : 'Snake! Down to ' + SL_JUMPS[land]; return; }
    nextTurn();
  }
  function nextTurn(){
    if (pos[turn] === 100) {
      over = true; endT = 1;
      const win = turn === 0;
      const score = win ? [300, 500, 800][lv] + Math.max(0, 70 - pTurns) * 5 : pos[0] * 2;
      final = { score, msg: win ? 'You reached 100 in ' + pTurns + ' turns' : 'Computer reached 100 first' }; api.score(score); msg = final.msg; return;
    }
    turn = 1 - turn; phase = 'idle'; timer = turn === 1 ? .8 : 0;
    msg = turn === 0 ? 'Your turn' : 'Computer’s turn';
  }
  canvas.addEventListener('pointerdown', e => { const p = pt(e); if (turn === 0 && inRect(p, BTN)) rollNow(); }, { signal });
  loop(signal, (dt, now) => {
    if (over) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    else if (phase === 'idle' && turn === 1) { timer -= dt; if (timer <= 0) rollNow(); }
    else if (phase === 'rolling') { timer -= dt; face = 1 + (Math.floor(now / 60) % 6); if (timer <= 0) settle(); }
    else if (phase === 'moving') { timer -= dt; if (timer <= 0) { if (queue.length) { pos[turn] = queue.shift(); timer = .16; } if (!queue.length) { phase = 'landing'; timer = .25; } } }
    else if (phase === 'landing') { timer -= dt; if (timer <= 0) afterMove(); }
    else if (phase === 'jump') { timer -= dt; if (timer <= 0) { pos[turn] = SL_JUMPS[landed]; nextTurn(); } }
    clear();
    text('Snakes & Ladders · ' + LEVELS[lv], 14, 28, 16, '#e8ebff', 'left');
    for (let n = 1; n <= 100; n++) {
      const [cx, cy] = cellXY(n), r = Math.floor((n - 1) / 10), c = r % 2 === 0 ? (n - 1) % 10 : 9 - ((n - 1) % 10);
      rr(cx - CS / 2, cy - CS / 2, CS - 1, CS - 1, 3, (r + c) % 2 ? '#232850' : '#1b1f40');
      text(n, cx - CS / 2 + 5, cy - CS / 2 + 7, 8, '#5b63a8', 'left');
    }
    for (const k in SL_JUMPS) {
      const a = cellXY(+k), b = cellXY(SL_JUMPS[k]), up = SL_JUMPS[k] > +k;
      ctx.lineCap = 'round';
      if (up) {
        const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), nx = -dy / len * 4, ny = dx / len * 4;
        ctx.strokeStyle = '#c98f4a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(a[0] + nx, a[1] + ny); ctx.lineTo(b[0] + nx, b[1] + ny); ctx.moveTo(a[0] - nx, a[1] - ny); ctx.lineTo(b[0] - nx, b[1] - ny); ctx.stroke();
        ctx.lineWidth = 2; const steps = Math.floor(len / 14);
        for (let s = 1; s < steps; s++) { const f = s / steps; ctx.beginPath(); ctx.moveTo(a[0] + dx * f + nx, a[1] + dy * f + ny); ctx.lineTo(a[0] + dx * f - nx, a[1] + dy * f - ny); ctx.stroke(); }
      } else {
        ctx.strokeStyle = '#3dbf7a'; ctx.lineWidth = 5;
        const mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * .18, my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * .18;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, b[0], b[1]); ctx.stroke();
        circle(a[0], a[1], 5, '#ff5c7a');
      }
      ctx.lineCap = 'butt';
    }
    [0, 1].forEach(k => {
      const p = pos[k], [x, y] = p ? cellXY(p) : [X0 + 12 + k * 22, Y0 + 10 * CS + 14];
      circle(x + (k ? 6 : -6), y + (k ? 5 : -5), 9, k ? '#ffd75c' : '#ff5c7a');
      ctx.strokeStyle = '#10132a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + (k ? 6 : -6), y + (k ? 5 : -5), 9, 0, TAU); ctx.stroke();
    });
    text(msg, W / 2, 430, 15, over || phase === 'jump' ? '#ffd75c' : '#b9bfe8');
    rr(60, 446, 56, 56, 12, '#f4f2ee');
    const dots = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    dots[face].forEach(d => circle(88 + d[0] * 14, 474 + d[1] * 14, 4.5, '#23263f'));
    button(BTN[0], BTN[1], BTN[2], BTN[3], turn === 0 && phase === 'idle' && !over ? 'Roll dice' : phase === 'rolling' ? 'Rolling…' : 'Wait…', turn === 0 && phase === 'idle' && !over ? '#d9435f' : '#2c3263');
    text('You ' + pos[0] + '  ·  Computer ' + pos[1], W - 60, 28, 13, '#8d94c4');
  });
  return { a: rollNow, dir: d => { if (d === 'd') rollNow(); }, dbg: () => ({ pos, turn, phase, over }) };
}
