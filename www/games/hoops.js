/* ---------------- HOOPS (basketball) ---------------- */
function hoops(api, signal, lv){
  const G = 1000, R = 11, SX = 55, FLOOR = 490, SY = FLOOR - R, RIM = [26, 22, 19][lv];
  let score = 0, timeLeft = [75, 60, 45][lv], state = 'ready', ang = 1.1, pow = .55, charging = false, ct = 0;
  let ball = { x: SX, y: SY, vx: 0, vy: 0 }, flyT = 0, touched = false, scored = false, flash = 0, flashTxt = '', t0 = 0, dead = false;
  let hoop = { x: 270, y: 230, baseY: 230 };
  function newHoop(){ hoop.x = 240 + rand(70); hoop.baseY = 170 + rand(130); hoop.y = hoop.baseY; }
  newHoop();
  const speedOf = p => 420 + 680 * p;
  function shoot(a, p){
    if (state !== 'ready' || dead) return;
    const v = speedOf(p);
    ball.vx = Math.cos(a) * v; ball.vy = -Math.sin(a) * v;
    state = 'fly'; flyT = 0; touched = false; scored = false; charging = false;
  }
  sling(signal, () => state === 'ready',
    (vx, vy, len) => { if (len > 8) { ang = clamp(Math.atan2(-vy, vx), .35, 1.5); pow = clamp(len / 130, .15, 1); } },
    (vx, vy, len) => { if (len > 28) shoot(ang, pow); });
  function step(h){
    const py = ball.y;
    ball.vy += G * h; ball.x += ball.vx * h; ball.y += ball.vy * h;
    if (ball.y > FLOOR - R) { ball.y = FLOOR - R; ball.vy = -ball.vy * .55; ball.vx *= .9; if (Math.abs(ball.vy) < 60) ball.vy = 0; }
    const bx = hoop.x + RIM + 8;
    if (ball.vx > 0 && ball.x + R > bx && ball.x - R < bx + 7 && ball.y > hoop.y - 85 && ball.y < hoop.y + 14) {
      ball.x = bx - R; ball.vx = -ball.vx * .55; touched = true;
    }
    for (const rx of [hoop.x - RIM, hoop.x + RIM]) {
      const dx = ball.x - rx, dy = ball.y - hoop.y, d = Math.hypot(dx, dy), m = R + 3;
      if (d < m && d > 0) {
        const nx = dx / d, ny = dy / d;
        ball.x = rx + nx * m; ball.y = hoop.y + ny * m;
        const vn = ball.vx * nx + ball.vy * ny;
        if (vn < 0) { ball.vx -= 1.6 * vn * nx; ball.vy -= 1.6 * vn * ny; }
        touched = true;
      }
    }
    if (!scored && py < hoop.y && ball.y >= hoop.y && ball.vy > 0 && Math.abs(ball.x - hoop.x) < RIM - 5) {
      scored = true;
      score += touched ? 2 : 3; api.score(score);
      flashTxt = touched ? '+2' : 'SWISH +3'; flash = 1;
    }
  }
  function resetBall(){
    state = 'ready'; ball.x = SX; ball.y = SY; ball.vx = ball.vy = 0;
    if (scored) newHoop();
    scored = false;
  }
  function trajectory(){
    const v = speedOf(pow), vx = Math.cos(ang) * v, vy = -Math.sin(ang) * v, pts = [];
    for (let i = 1; i <= [18, 12, 5][lv]; i++) { const t = i * .035; pts.push([SX + vx * t, SY + vy * t + .5 * G * t * t]); }
    return pts;
  }
  loop(signal, dt => {
    if (dead) return;
    t0 += dt; timeLeft -= dt;
    const amp = [0, Math.min(45, score * 3), Math.min(70, 10 + score * 4)][lv];
    hoop.y = hoop.baseY + Math.sin(t0 * 1.3) * amp;
    if (state === 'ready') {
      ang = clamp(ang - axisY() * 1.1 * dt, .35, 1.5);
      if (charging) { ct += dt; let tr = ct % 2; tr = tr < 1 ? tr : 2 - tr; pow = .2 + .8 * tr; }
    } else {
      flyT += dt;
      for (let i = 0; i < 4; i++) step(dt / 4);
      if (ball.x > W + 40 || ball.x < -40 || ball.y > H + 40 || flyT > 2.6 || (scored && ball.y > hoop.y + 90)) resetBall();
    }
    if (timeLeft <= 0 && state === 'ready') { dead = true; api.end(score, 'Time!'); return; }
    if (flash > 0) flash -= dt;

    clear();
    ctx.fillStyle = '#2b2f58'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = '#e8ebff'; ctx.fillRect(hoop.x + RIM + 8, hoop.y - 85, 7, 99);
    ctx.fillStyle = '#c9ceef'; ctx.fillRect(hoop.x + RIM + 4, hoop.y - 55, 4, 40);
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5;
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(hoop.x - RIM + i * RIM / 2, hoop.y); ctx.lineTo(hoop.x - RIM * .64 + i * RIM * .32, hoop.y + 34); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(hoop.x - RIM * .64, hoop.y + 17); ctx.lineTo(hoop.x + RIM * .64, hoop.y + 17); ctx.stroke();
    ctx.strokeStyle = '#ff7a3c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hoop.x - RIM, hoop.y); ctx.lineTo(hoop.x + RIM, hoop.y); ctx.stroke(); ctx.lineCap = 'butt';
    if (state === 'ready') trajectory().forEach(p => circle(p[0], p[1], 3, 'rgba(255,255,255,.75)'));
    circle(ball.x, ball.y, R, '#ff8a3d');
    ctx.strokeStyle = '#7a3512'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ball.x - R, ball.y); ctx.lineTo(ball.x + R, ball.y); ctx.moveTo(ball.x, ball.y - R); ctx.lineTo(ball.x, ball.y + R); ctx.stroke();
    text('Time ' + Math.max(0, Math.ceil(timeLeft)), 50, 26, 18, timeLeft < 10 ? '#ff7a8a' : '#e8ebff');
    text('Points ' + score, W - 55, 26, 18, '#e8ebff');
    if (state === 'ready') {
      rr(12, 400, 14, 80, 5, '#252a4d'); rr(12, 480 - 80 * pow, 14, 80 * pow, 5, charging ? '#ffd75c' : '#4f7cff');
      text(charging ? 'Release!' : 'Hold A or drag back', W/2, 515, 14, '#8d94c4');
    }
    if (flash > 0) text(flashTxt, W/2, 120, 30, '#ffd75c');
  });
  return { a: () => { if (state === 'ready' && !dead) { charging = true; ct = 0; pow = .2; } },
           aUp: () => { if (charging) shoot(ang, pow); } };
}
