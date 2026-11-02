/* ---------------- MINI GOLF ---------------- */
function golf(api, signal, lv){
  const HOLES = [
    { par:2, start:[180,470], hole:[180,70],  walls:[[100,250,60,20],[200,250,60,20]] },
    { par:4, start:[60,480],  hole:[60,80],   walls:[[10,330,230,20],[120,170,230,20]] },
    { par:3, start:[180,480], hole:[180,70],  walls:[[80,330,40,40],[240,330,40,40],[160,220,40,40],[60,150,40,40],[260,150,40,40]] },
    { par:3, start:[60,480],  hole:[300,80],  walls:[[150,200,20,330]] },
    { par:5, start:[180,490], hole:[180,60],  walls:[[10,400,240,20],[110,280,240,20],[10,160,240,20]] },
    { par:3, start:[180,490], hole:[180,70],  walls:[[130,40,20,80],[210,40,20,80],[60,250,50,50],[250,250,50,50],[155,340,50,30]] }
  ];
  const BORDER = [[0,0,W,10],[0,H-10,W,10],[0,0,10,H],[W-10,0,10,H]];
  const BR = 6;
  let hi = 0, strokes = 0, total = 0, score = 0, ball = { x:0, y:0, vx:0, vy:0 }, state = 'aim', ang = -Math.PI/2, pow = .5, charging = false, ct = 0, sinkT = 0, dead = false, msg = '', msgT = 0;
  const parTotal = HOLES.reduce((s, h) => s + h.par, 0);
  let hole;
  function load(i){
    hole = HOLES[i]; ball.x = hole.start[0]; ball.y = hole.start[1]; ball.vx = ball.vy = 0;
    strokes = 0; state = 'aim'; ang = Math.atan2(hole.hole[1] - ball.y, hole.hole[0] - ball.x);
  }
  load(0);
  function shoot(a, p){
    if (state !== 'aim' || dead) return;
    const v = 60 + 560 * p;
    ball.vx = Math.cos(a) * v; ball.vy = Math.sin(a) * v;
    strokes++; total++; state = 'roll'; charging = false;
  }
  sling(signal, () => state === 'aim',
    (vx, vy, len) => { if (len > 6) { ang = Math.atan2(vy, vx); pow = clamp(len / 120, .08, 1); } },
    (vx, vy, len) => { if (len > 16) shoot(ang, pow); });
  function collide(r){
    const cx = clamp(ball.x, r[0], r[0] + r[2]), cy = clamp(ball.y, r[1], r[1] + r[3]);
    let dx = ball.x - cx, dy = ball.y - cy, d2 = dx * dx + dy * dy;
    if (d2 >= BR * BR) return;
    let nx, ny, pen;
    if (d2 > 1e-6) { const d = Math.sqrt(d2); nx = dx / d; ny = dy / d; pen = BR - d; }
    else {
      const l = ball.x - r[0], rt = r[0] + r[2] - ball.x, t = ball.y - r[1], b = r[1] + r[3] - ball.y, m = Math.min(l, rt, t, b);
      if (m === l) { nx = -1; ny = 0; } else if (m === rt) { nx = 1; ny = 0; } else if (m === t) { nx = 0; ny = -1; } else { nx = 0; ny = 1; }
      pen = BR + m;
    }
    ball.x += nx * pen; ball.y += ny * pen;
    const vn = ball.vx * nx + ball.vy * ny;
    if (vn < 0) { ball.vx -= 1.85 * vn * nx; ball.vy -= 1.85 * vn * ny; }
  }
  function finishHole(){
    const par = hole.par;
    const pts = Math.max(0, par + 3 - strokes) * 100 + (strokes === 1 ? 300 : 0);
    score += pts; api.score(score);
    msg = strokes === 1 ? 'Hole in one!' : strokes < par ? 'Birdie! +' + pts : strokes === par ? 'Par +' + pts : strokes > par ? '+' + (strokes - par) + ' over' : '';
    msgT = 1.4;
    if (hi >= HOLES.length - 1) { dead = true; setTimeout(() => api.end(score, 'Strokes ' + total + '  (par ' + parTotal + ')'), 900); }
    else { hi++; load(hi); }
  }
  loop(signal, dt => {
    if (dead) return;
    if (msgT > 0) msgT -= dt;
    if (state === 'aim') {
      ang += axis() * 2.2 * dt;
      if (charging) { ct += dt; let tr = ct % 2; tr = tr < 1 ? tr : 2 - tr; pow = .08 + .92 * tr; }
    } else if (state === 'roll') {
      const n = 4, h = dt / n;
      for (let i = 0; i < n && state === 'roll'; i++) {
        ball.x += ball.vx * h; ball.y += ball.vy * h;
        const f = Math.exp(-1.15 * h); ball.vx *= f; ball.vy *= f;
        for (const r of BORDER) collide(r);
        for (const r of hole.walls) collide(r);
        const sp = Math.hypot(ball.vx, ball.vy), dh = Math.hypot(ball.x - hole.hole[0], ball.y - hole.hole[1]);
        if (dh < [14, 10, 8][lv] && sp < [340, 280, 230][lv]) { state = 'sink'; sinkT = 0; }
        else if (sp < 10) { ball.vx = ball.vy = 0; state = 'aim'; if (strokes >= [10, 8, 6][lv]) { finishHole(); } else ang = Math.atan2(hole.hole[1] - ball.y, hole.hole[0] - ball.x); }
      }
    } else if (state === 'sink') {
      sinkT += dt;
      ball.x += (hole.hole[0] - ball.x) * Math.min(1, dt * 14); ball.y += (hole.hole[1] - ball.y) * Math.min(1, dt * 14);
      if (sinkT > .45) finishHole();
    }
    if (dead) { return; }

    clear();
    ctx.fillStyle = '#2f8f5b'; ctx.fillRect(10, 10, W - 20, H - 20);
    ctx.fillStyle = 'rgba(0,0,0,.07)';
    for (let y = 10; y < H - 10; y += 40) ctx.fillRect(10, y, W - 20, 20);
    ctx.fillStyle = '#5b63b8';
    BORDER.concat(hole.walls).forEach(r => { ctx.beginPath(); ctx.roundRect(r[0], r[1], r[2], r[3], 3); ctx.fill(); });
    circle(hole.hole[0], hole.hole[1], [13, 10, 8][lv], '#0c0e1c');
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hole.hole[0], hole.hole[1]); ctx.lineTo(hole.hole[0], hole.hole[1] - 30); ctx.stroke();
    ctx.fillStyle = '#ff5c7a'; ctx.beginPath(); ctx.moveTo(hole.hole[0], hole.hole[1] - 30); ctx.lineTo(hole.hole[0] + 15, hole.hole[1] - 24); ctx.lineTo(hole.hole[0], hole.hole[1] - 18); ctx.fill();
    if (state === 'aim') {
      const len = (24 + 90 * pow) * [1.8, 1, .55][lv];
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.setLineDash([2, 7]);
      ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + Math.cos(ang) * len, ball.y + Math.sin(ang) * len); ctx.stroke(); ctx.setLineDash([]);
    }
    circle(ball.x, ball.y, state === 'sink' ? BR * Math.max(.2, 1 - sinkT * 1.6) : BR, '#fff');
    text('Hole ' + (hi + 1) + '/' + HOLES.length + '   Par ' + hole.par + '   Strokes ' + strokes, W/2, 28, 15, '#fff');
    if (state === 'aim') {
      rr(18, 440, 12, 80, 5, 'rgba(0,0,0,.35)'); rr(18, 520 - 80 * pow, 12, 80 * pow, 5, charging ? '#ffd75c' : '#4f7cff');
    }
    if (msgT > 0) text(msg, W/2, 140, 28, '#ffd75c');
  });
  return { a: () => { if (state === 'aim' && !dead) { charging = true; ct = 0; pow = .08; } },
           aUp: () => { if (charging) shoot(ang, pow); } };
}
