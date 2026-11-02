/* ---------------- SPACE ROCKS ---------------- */
function spaceRocks(api, signal, lv){
  const ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, inv: 2, dead: 0 };
  let pick = [], pw = { shield: 0, rapid: 0, spread: 0 }, rocks = [], bullets = [], parts = [], score = 0, lives = 3, wave = 0, cd = 0, over = false, touch = null, waveT = 0, endT = 0, fireAuto = 0;
  const RAD = { 3: 34, 2: 20, 1: 11 }, PTS = { 3: 20, 2: 50, 1: 100 };
  function mk(x, y, s){
    const a = Math.random() * TAU, v = ((22 + Math.random() * 28 + wave * 4) * (4 - s) * .55 + 18) * [.8, 1, 1.25][lv];
    return { x, y, s, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: 0, vr: (Math.random() - .5) * 1.6, sh: Array.from({ length: 10 }, () => .78 + Math.random() * .4) };
  }
  function spawnWave(){
    wave++;
    const n = Math.min(9, [2, 3, 4][lv] + wave);
    for (let i = 0; i < n; i++) { let x, y, k = 0; do { x = Math.random() * W; y = Math.random() * H; k++; } while (Math.hypot(x - ship.x, y - ship.y) < 120 && k < 30); rocks.push(mk(x, y, 3)); }
  }
  function fire(){
    if (ship.dead > 0 || over || cd > 0) return;
    cd = pw.rapid > 0 ? .09 : .22; beep(520, .04);
    for (const off of (pw.spread > 0 ? [-.22, 0, .22] : [0])) { const a = ship.a + off; bullets.push({ x: ship.x + Math.cos(a) * 14, y: ship.y + Math.sin(a) * 14, vx: ship.vx + Math.cos(a) * 430, vy: ship.vy + Math.sin(a) * 430, t: 1.05 }); }
  }
  function boom(x, y, n, col){ for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 40 + Math.random() * 120; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: .5 + Math.random() * .4, c: col }); } }
  const wrap = o => { if (o.x < -40) o.x += W + 80; if (o.x > W + 40) o.x -= W + 80; if (o.y < -40) o.y += H + 80; if (o.y > H + 40) o.y -= H + 80; };
  canvas.addEventListener('pointerdown', e => { touch = pt(e); capture(e); fire(); }, { signal });
  canvas.addEventListener('pointermove', e => { if (touch) touch = pt(e); }, { signal });
  canvas.addEventListener('pointerup', () => { touch = null; }, { signal });
  canvas.addEventListener('pointercancel', () => { touch = null; }, { signal });
  spawnWave();
  loop(signal, dt => {
    cd -= dt;
    if (!over && ship.dead <= 0) {
      let thrust = axisY() < -.3;
      if (touch) {
        const want = Math.atan2(touch.y - ship.y, touch.x - ship.x);
        let d = want - ship.a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
        ship.a += clamp(d, -5.5 * dt, 5.5 * dt);
        thrust = Math.hypot(touch.x - ship.x, touch.y - ship.y) > 50;
        fireAuto -= dt; if (fireAuto <= 0) { fire(); fireAuto = .35; }
      } else ship.a += axis() * 4.6 * dt;
      if (thrust) { ship.vx += Math.cos(ship.a) * 230 * dt; ship.vy += Math.sin(ship.a) * 230 * dt; }
      const sp = Math.hypot(ship.vx, ship.vy); if (sp > 260) { ship.vx *= 260 / sp; ship.vy *= 260 / sp; }
      ship.vx *= 1 - .4 * dt; ship.vy *= 1 - .4 * dt;
      ship.x += ship.vx * dt; ship.y += ship.vy * dt; wrap(ship);
    }
    if (ship.dead > 0) { ship.dead -= dt; if (ship.dead <= 0 && !over) { ship.x = W / 2; ship.y = H / 2; ship.vx = ship.vy = 0; ship.a = -Math.PI / 2; ship.inv = 2.5; } }
    if (ship.inv > 0) ship.inv -= dt;
    for (const k in pw) if (pw[k] > 0) pw[k] -= dt;
    pick.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; wrap(p); });
    if (ship.dead <= 0) for (const p of pick) if (Math.hypot(p.x - ship.x, p.y - ship.y) < 22) {
      p.t = 0; beep(880, .1); buzz('win');
      if (p.k === 'life') lives = Math.min(5, lives + 1); else pw[p.k] = p.k === 'shield' ? 7 : 9;
    }
    pick = pick.filter(p => p.t > 0);
    bullets.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.t -= dt; wrap(b); });
    bullets = bullets.filter(b => b.t > 0);
    rocks.forEach(r => { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt; wrap(r); });
    for (const b of bullets) for (const r of rocks) {
      if (b.t > 0 && Math.hypot(b.x - r.x, b.y - r.y) < RAD[r.s] + 2) {
        b.t = 0; r.dead = true; score += PTS[r.s]; api.score(score); boom(r.x, r.y, 8 + r.s * 3, '#c9cdf0'); beep(200 + r.s * 60, .06);
        if (r.s > 1) { rocks.push(mk(r.x, r.y, r.s - 1), mk(r.x, r.y, r.s - 1)); }
        if (r.s > 1 && Math.random() < .16) { const k = ['shield', 'rapid', 'spread', 'life'][rand(4)]; pick.push({ x: r.x, y: r.y, vx: r.vx * .3, vy: r.vy * .3, k, t: 9 }); }
      }
    }
    rocks = rocks.filter(r => !r.dead);
    if (!over && ship.dead <= 0 && ship.inv <= 0 && pw.shield <= 0) for (const r of rocks) {
      if (Math.hypot(ship.x - r.x, ship.y - r.y) < RAD[r.s] * .85 + 8) {
        lives--; boom(ship.x, ship.y, 24, '#ffd75c'); ship.dead = 1.2; buzz('over'); beep(120, .3);
        if (lives <= 0) { over = true; endT = 1; }
        break;
      }
    }
    if (!over && !rocks.length) { waveT += dt; if (waveT > .9) { waveT = 0; spawnWave(); } }
    if (over) { endT -= dt; if (endT <= 0) { api.end(score, 'Reached wave ' + wave); endT = 99; } }
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; }); parts = parts.filter(p => p.t > 0);
    clear();
    ctx.lineWidth = 2; ctx.strokeStyle = '#c9cdf0';
    rocks.forEach(r => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = r.rot + i * TAU / 10, d = RAD[r.s] * r.sh[i]; ctx.lineTo(r.x + Math.cos(a) * d, r.y + Math.sin(a) * d); } ctx.closePath(); ctx.stroke(); });
    bullets.forEach(b => circle(b.x, b.y, 2.5, '#fff'));
    parts.forEach(p => { ctx.globalAlpha = clamp(p.t * 2, 0, 1); circle(p.x, p.y, 2, p.c); ctx.globalAlpha = 1; });
    if (ship.dead <= 0 && !over && (ship.inv <= 0 || Math.floor(ship.inv * 10) % 2 === 0)) {
      ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.a); ctx.strokeStyle = '#5cff9a'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-10, 9); ctx.lineTo(-5, 0); ctx.lineTo(-10, -9); ctx.closePath(); ctx.stroke();
      if (axisY() < -.3 || (touch && Math.hypot(touch.x - ship.x, touch.y - ship.y) > 50)) { ctx.strokeStyle = '#ff9a5c'; ctx.beginPath(); ctx.moveTo(-7, 4); ctx.lineTo(-17 - Math.random() * 5, 0); ctx.lineTo(-7, -4); ctx.stroke(); }
      ctx.restore();
    }
    pick.forEach(p => { const c = { shield: '#5cc8ff', rapid: '#ff9a5c', spread: '#b36bff', life: '#ff6b8a' }[p.k]; ctx.globalAlpha = p.t < 2 && Math.floor(p.t * 6) % 2 ? .35 : 1; circle(p.x, p.y, 11, c); text({ shield: 'S', rapid: 'R', spread: '3', life: '♥' }[p.k], p.x, p.y + 1, 12, '#10132a'); ctx.globalAlpha = 1; });
    if (pw.shield > 0 && ship.dead <= 0) { ctx.strokeStyle = 'rgba(92,200,255,' + (pw.shield < 2 ? .4 : .9) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ship.x, ship.y, 20, 0, TAU); ctx.stroke(); }
    text('Lives ' + Math.max(0, lives), 50, 20, 14, '#b9bfe8');
    { let x = 30; for (const [k, c, n] of [['shield', '#5cc8ff', 'Shield'], ['rapid', '#ff9a5c', 'Rapid'], ['spread', '#b36bff', 'Triple']]) if (pw[k] > 0) { text(n + ' ' + Math.ceil(pw[k]), x + 25, 520, 12, c); x += 80; } } text('Wave ' + wave, W - 45, 20, 14, '#b9bfe8');
  });
  return { a: fire, dbg: () => ({ rocks, ship, score, lives, wave, pick, pw }) };
}
