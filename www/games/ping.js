/* ---------------- PING (pong) ---------------- */
function ping(api, signal, lv){
  const PW = [92, 72, 58][lv], PH = 12, TOP = 44, BOT = 496, BR = 7, WIN = 7;
  let px = W / 2, ax = W / 2, ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 }, serveT = .9, serveDir = 1, ps = 0, as = 0, tx = null, aiErr = 0, endT = 0, dead = false, ended = false, final = '';
  canvas.addEventListener('pointerdown', e => { capture(e); tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointermove', e => { if (tx !== null) tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointerup', () => { tx = null; }, { signal });
  function bounce(paddleX, dirY){
    const rel = clamp((ball.x - paddleX) / (PW / 2), -1, 1), sp = Math.min(620, Math.hypot(ball.vx, ball.vy) * 1.06), a = rel * 1.0;
    ball.vx = sp * Math.sin(a); ball.vy = dirY * sp * Math.cos(a);
  }
  function point(playerScored){
    if (playerScored) { ps++; api.score(ps * 100); } else as++;
    serveDir = playerScored ? -1 : 1;
    ball.x = W / 2; ball.y = H / 2; ball.vx = ball.vy = 0; serveT = .9;
    if (ps >= WIN || as >= WIN) {
      dead = true; endT = .9;
      const s = ps * 100 + (ps >= WIN ? 300 : 0); api.score(s);
      final = (ps >= WIN ? 'You won ' : 'You lost ') + ps + ' – ' + as;
      final = s + '|' + final;
    }
  }
  loop(signal, dt => {
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; const [s, m] = final.split('|'); api.end(+s, m); } return; }
    px = clamp(px + axis() * 430 * dt, PW / 2, W - PW / 2);
    if (tx !== null) px = clamp(px + clamp(tx - px, -620 * dt, 620 * dt), PW / 2, W - PW / 2);
    if (serveT > 0) {
      serveT -= dt;
      if (serveT <= 0) { const a = (Math.random() - .5) * .8; ball.vx = Math.sin(a) * 300; ball.vy = serveDir * Math.cos(a) * 300; }
    } else {
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      if (ball.x < BR) { ball.x = BR; ball.vx = Math.abs(ball.vx); }
      if (ball.x > W - BR) { ball.x = W - BR; ball.vx = -Math.abs(ball.vx); }
      if (ball.vy > 0 && ball.y + BR >= BOT && ball.y + BR <= BOT + PH + 10 && Math.abs(ball.x - px) < PW / 2 + BR) { ball.y = BOT - BR; bounce(px, -1); aiErr = (Math.random() - .5) * [100, 60, 20][lv]; }
      if (ball.vy < 0 && ball.y - BR <= TOP && ball.y - BR >= TOP - PH - 10 && Math.abs(ball.x - ax) < PW / 2 + BR) { ball.y = TOP + BR; bounce(ax, 1); }
      if (ball.y > H + 10) point(false); else if (ball.y < -10) point(true);
    }
    const aim = ball.vy < 0 ? ball.x + aiErr : W / 2, sp = [150, 190, 240][lv] + ps * [8, 12, 16][lv];
    ax = clamp(ax + clamp(aim - ax, -sp * dt, sp * dt), PW / 2, W - PW / 2);
    clear();
    ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let x = 10; x < W; x += 30) ctx.fillRect(x, H / 2 - 1, 16, 2);
    text(as, W - 40, H / 2 - 40, 44, 'rgba(255,255,255,.18)'); text(ps, W - 40, H / 2 + 40, 44, 'rgba(255,255,255,.18)');
    rr(ax - PW / 2, TOP - PH, PW, PH, 6, '#ff7a8a'); rr(px - PW / 2, BOT, PW, PH, 6, '#7dffc4');
    circle(ball.x, ball.y, BR, '#fff');
    text('First to ' + WIN, 60, 22, 13, '#8d94c4');
  });
  return {};
}
