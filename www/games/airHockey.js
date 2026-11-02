/* ---------------- AIR HOCKEY ---------------- */
function airHockey(api, signal, lv){
  const PR = 24, UR = 15, GOALW = 130, WIN = 7, X0 = 8, X1 = W - 8, Y0 = 8, Y1 = H - 8;
  const me = { x: W / 2, y: H - 90, px: W / 2, py: H - 90, vx: 0, vy: 0 }, ai = { x: W / 2, y: 90, vx: 0, vy: 0 };
  let puck = { x: W / 2, y: H / 2, vx: 0, vy: 0 }, a = 0, b = 0, serve = 1, wait = 1, msg = '', msgT = 0, over = false, endT = 0, tgt = null, hits = 0;
  const AI = [{ sp: 170, react: .5 }, { sp: 250, react: .75 }, { sp: 340, react: .92 }][lv];
  function reset(dir){ puck = { x: W / 2, y: H / 2 + dir * 40, vx: 0, vy: 0 }; me.x = W / 2; me.y = H - 90; ai.x = W / 2; ai.y = 90; wait = .9; }
  function goal(side){
    if (side === 'me') { a++; msg = 'Goal!'; beep(800, .15); buzz('win'); } else { b++; msg = 'Conceded'; buzz('over'); beep(150, .2); }
    msgT = .9; api.score(a * 100 - b * 20 < 0 ? 0 : a * 100 - b * 20);
    if (a >= WIN || b >= WIN) { over = true; endT = 1; } else reset(side === 'me' ? -1 : 1);
  }
  function collide(m, r, vxm, vym){
    const dx = puck.x - m.x, dy = puck.y - m.y, d = Math.hypot(dx, dy), mind = r + UR;
    if (d < mind && d > 0) {
      const nx = dx / d, ny = dy / d;
      puck.x = m.x + nx * mind; puck.y = m.y + ny * mind;
      const rel = (puck.vx - vxm) * nx + (puck.vy - vym) * ny;
      if (rel < 0) { puck.vx -= 2 * rel * nx; puck.vy -= 2 * rel * ny; }
      puck.vx += vxm * .6; puck.vy += vym * .6;
      const sp = Math.hypot(puck.vx, puck.vy); if (sp > 720) { puck.vx *= 720 / sp; puck.vy *= 720 / sp; }
      beep(300 + Math.min(sp, 600) * .4, .03); hits++;
    }
  }
  canvas.addEventListener('pointerdown', e => { tgt = pt(e); capture(e); }, { signal });
  canvas.addEventListener('pointermove', e => { if (tgt) tgt = pt(e); }, { signal });
  canvas.addEventListener('pointerup', () => { tgt = null; }, { signal });
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt;
    if (!over) {
      const ox = me.x, oy = me.y;
      if (tgt) { const dx = tgt.x - me.x, dy = tgt.y - 40 - me.y, d = Math.hypot(dx, dy), mv = Math.min(d, 900 * dt); if (d > 0) { me.x += dx / d * mv; me.y += dy / d * mv; } }
      else { me.x += axis() * 330 * dt; me.y += axisY() * 330 * dt; }
      me.x = clamp(me.x, X0 + PR, X1 - PR); me.y = clamp(me.y, H / 2 + PR + 4, Y1 - PR);
      me.vx = (me.x - ox) / dt; me.vy = (me.y - oy) / dt;
      if (wait > 0) wait -= dt;
      else {
        /* computer */
        const ox2 = ai.x, oy2 = ai.y;
        let gx = W / 2, gy = 70;
        if (puck.y < H / 2 + 20 || puck.vy < -40) { gx = puck.x + puck.vx * .08 * AI.react; gy = clamp(puck.y - 40, 40, H / 2 - PR - 6); if (puck.y > ai.y + 10 && Math.abs(puck.x - ai.x) < 60 && puck.y < H / 2) gy = clamp(puck.y - 30, 40, H / 2 - PR - 6); }
        const ddx = gx - ai.x, ddy = gy - ai.y, dd = Math.hypot(ddx, ddy), mv = Math.min(dd, AI.sp * dt);
        if (dd > 1) { ai.x += ddx / dd * mv; ai.y += ddy / dd * mv; }
        ai.x = clamp(ai.x, X0 + PR, X1 - PR); ai.y = clamp(ai.y, Y0 + PR, H / 2 - PR - 4);
        ai.vx = (ai.x - ox2) / dt; ai.vy = (ai.y - oy2) / dt;
        for (let s = 0; s < 3; s++) {
          puck.x += puck.vx * dt / 3; puck.y += puck.vy * dt / 3;
          collide(me, PR, me.vx, me.vy); collide(ai, PR, ai.vx, ai.vy);
          if (puck.x < X0 + UR) { puck.x = X0 + UR; puck.vx = Math.abs(puck.vx); }
          if (puck.x > X1 - UR) { puck.x = X1 - UR; puck.vx = -Math.abs(puck.vx); }
          const inGoal = Math.abs(puck.x - W / 2) < GOALW / 2 - UR * .4;
          if (puck.y < Y0 + UR) { if (inGoal) { goal('me'); break; } puck.y = Y0 + UR; puck.vy = Math.abs(puck.vy); }
          if (puck.y > Y1 - UR) { if (inGoal) { goal('ai'); break; } puck.y = Y1 - UR; puck.vy = -Math.abs(puck.vy); }
        }
        puck.vx *= 1 - .35 * dt; puck.vy *= 1 - .35 * dt;
      }
    } else { endT -= dt; if (endT <= 0) { const sc = a * 100 + (a > b ? 300 + (a - b) * 20 : 0); api.score(sc); api.end(sc, (a > b ? 'You win ' : 'CPU wins ') + a + ' – ' + b); endT = 99; } }
    clear();
    ctx.fillStyle = '#0f2a4a'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    ctx.strokeStyle = '#2e5f9a'; ctx.lineWidth = 3; ctx.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
    ctx.beginPath(); ctx.moveTo(X0, H / 2); ctx.lineTo(X1, H / 2); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, H / 2, 44, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#0a1628'; ctx.fillRect(W / 2 - GOALW / 2, 0, GOALW, Y0 + 2); ctx.fillRect(W / 2 - GOALW / 2, Y1 - 2, GOALW, 10);
    text(String(b), 26, H / 2 - 24, 26, '#ff7a8a'); text(String(a), 26, H / 2 + 24, 26, '#5cff9a');
    circle(ai.x, ai.y, PR, '#ff5c7a'); circle(ai.x, ai.y, PR - 8, '#ff9aa8');
    circle(me.x, me.y, PR, '#5cc8ff'); circle(me.x, me.y, PR - 8, '#a6e3ff');
    circle(puck.x, puck.y, UR, '#f4f4f8'); circle(puck.x, puck.y, UR - 5, '#cfd2e6');
    if (msgT > 0) text(msg, W / 2, H / 2, 30, '#ffd75c');
    if (wait > 0 && !over) text('First to ' + WIN, W / 2, H / 2 + 70, 15, '#8d94c4');
  });
  return { dbg: () => ({ puck, a, b, me, ai }) };
}
