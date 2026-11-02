/* ---------------- LANE RACER ---------------- */
function laneRacer(api, signal, lv){
  const RX = 30, RW = 300, LW = RW / 4, PW = 26, PH = 44;
  let ups = [], pw = { shield: 0, magnet: 0, slow: 0 }, upT = 7, px = W / 2, tx = null, cars = [], coins = [], dist = 0, score = 0, coinN = 0, spawn = .8, cT = 2, speed = [230, 270, 310][lv], scroll = 0, over = false, endT = 0, lastLane = -1, boost = 0;
  canvas.addEventListener('pointerdown', e => { tx = pt(e).x; capture(e); }, { signal });
  canvas.addEventListener('pointermove', e => { if (tx !== null) tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointerup', () => { tx = null; }, { signal });
  loop(signal, dt => {
    if (!over) {
      px += axis() * 300 * dt;
      if (tx !== null) px += clamp(tx - px, -520 * dt, 520 * dt);
      px = clamp(px, RX + PW / 2 + 2, RX + RW - PW / 2 - 2);
      speed = Math.min(560, speed + dt * [5, 7, 9][lv]);
      const sk = pw.slow > 0 ? .6 : 1, sp = speed * sk;
      dist += sp * dt; scroll = (scroll + sp * dt) % 60;
      const s = Math.floor(dist / 25) + coinN * 20; if (s !== score) { score = s; api.score(score); }
      spawn -= dt;
      if (spawn <= 0) {
        let l; do { l = rand(4); } while (l === lastLane && Math.random() < .7); lastLane = l;
        cars.push({ x: RX + l * LW + LW / 2, y: -60, v: speed * (.35 + Math.random() * .2), c: ['#ff5c7a', '#b36bff', '#5cb8ff', '#ffb347'][rand(4)] });
        spawn = Math.max(.34, [1.1, .95, .8][lv] - dist / 9000) * (.8 + Math.random() * .5) * 300 / speed * 1.1;
      }
      for (const k in pw) if (pw[k] > 0) pw[k] -= dt;
      upT -= dt; if (upT <= 0) { ups.push({ x: RX + rand(4) * LW + LW / 2, y: -30, k: ['shield', 'magnet', 'slow'][rand(3)] }); upT = 8 + Math.random() * 6; }
      ups.forEach(u => u.y += sp * dt); ups = ups.filter(u => u.y < H + 30);
      ups = ups.filter(u => { if (Math.abs(u.x - px) < 24 && Math.abs(u.y - 450) < 32) { pw[u.k] = u.k === 'shield' ? 6 : 8; beep(1000, .12); buzz('win'); return false; } return true; });
      cT -= dt; if (cT <= 0) { coins.push({ x: RX + rand(4) * LW + LW / 2, y: -30 }); cT = 1.5 + Math.random() * 1.5; }
      cars.forEach(c => c.y += (sp - c.v * sk) * dt); coins.forEach(c => { c.y += sp * dt; if (pw.magnet > 0 && Math.abs(c.y - 450) < 170) { c.x += clamp(px - c.x, -260 * dt, 260 * dt); } });
      cars = cars.filter(c => c.y < H + 80); coins = coins.filter(c => c.y < H + 30);
      for (const c of cars) if (Math.abs(c.x - px) < PW - 2 && Math.abs(c.y - 450) < PH - 2) { if (pw.shield > 0) { c.y = H + 200; pw.shield = 0; beep(300, .15); buzz(); continue; } over = true; endT = .7; buzz('over'); beep(100, .3); break; }
      coins = coins.filter(c => { if (Math.abs(c.x - px) < 22 && Math.abs(c.y - 450) < 30) { coinN++; beep(900, .05); return false; } return true; });
    } else { endT -= dt; if (endT <= 0) { api.end(score, Math.floor(dist / 25) + ' m · ' + coinN + ' coins'); endT = 99; } }
    clear();
    ctx.fillStyle = '#2a2d4a'; ctx.fillRect(RX, 0, RW, H);
    ctx.fillStyle = '#e8ebff'; ctx.fillRect(RX - 4, 0, 4, H); ctx.fillRect(RX + RW, 0, 4, H);
    ctx.fillStyle = '#4a4f80'; for (let l = 1; l < 4; l++) for (let y = -60 + scroll; y < H; y += 60) ctx.fillRect(RX + l * LW - 1.5, y, 3, 30);
    coins.forEach(c => { circle(c.x, c.y, 10, '#ffd75c'); circle(c.x, c.y, 6, '#f0a800'); });
    cars.forEach(c => { rr(c.x - PW / 2, c.y - PH / 2, PW, PH, 7, c.c); rr(c.x - 9, c.y - 12, 18, 10, 3, 'rgba(0,0,0,.35)'); });
    ups.forEach(u => { const c = { shield: '#5cc8ff', magnet: '#ff6b8a', slow: '#ffd75c' }[u.k]; circle(u.x, u.y, 14, c); text({ shield: 'S', magnet: 'M', slow: '⏱' }[u.k], u.x, u.y + 1, 14, '#10132a'); });
    if (pw.shield > 0) { ctx.strokeStyle = 'rgba(92,200,255,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, 450, 34, 0, TAU); ctx.stroke(); }
    if (!over) { rr(px - PW / 2, 450 - PH / 2, PW, PH, 7, '#5cff9a'); rr(px - 9, 450 - 16, 18, 10, 3, 'rgba(0,0,0,.35)'); }
    { let x = 60; for (const [k, c, n] of [['shield', '#5cc8ff', 'Shield'], ['magnet', '#ff6b8a', 'Magnet'], ['slow', '#ffd75c', 'Slow']]) if (pw[k] > 0) { text(n + ' ' + Math.ceil(pw[k]), x, 516, 12, c); x += 90; } }
    text(Math.floor(dist / 25) + ' m', 60, 20, 16, '#e8ebff'); text('🪙 ' + coinN, W - 50, 20, 16, '#ffd75c');
  });
  return { dbg: () => ({ cars, px, dist, ups, pw }) };
}
