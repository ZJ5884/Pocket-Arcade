/* ---------------- STAR DEFENSE ---------------- */
function defense(api, signal, lv){
  const EW = 30, EH = 22, SY = 496;
  const ROWCOL = ['#ff5c7a', '#ff9a5c', '#ffd75c', '#5cff9a', '#5cc8ff'];
  let px = W / 2, tx = null, lives = [5, 3, 2][lv], score = 0, wave = 1, bullets = [], bombs = [], en = [], dirx = 1, fireT = 0, bombT = 1.2, inv = 0, dead = false, endT = 0, total = 1, ended = false, tt = 0;
  const stars = Array.from({ length: 30 }, () => ({ x: rand(W), y: rand(H), s: .3 + Math.random() }));
  function build(){
    en = []; const rows = Math.min(5, 3 + ((wave - 1) >> 1));
    for (let r = 0; r < rows; r++) for (let c = 0; c < 7; c++) en.push({ x: 26 + c * 44, y: 60 + r * 34, r, c, alive: true });
    total = en.length; dirx = 1; bullets = []; bombs = [];
  }
  build();
  canvas.addEventListener('pointerdown', e => { capture(e); tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointermove', e => { if (tx !== null) tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointerup', () => { tx = null; }, { signal });
  const die = () => { dead = true; endT = .6; };
  loop(signal, dt => {
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Reached wave ' + wave); } return; }
    tt += dt; if (inv > 0) inv -= dt;
    px = clamp(px + axis() * 320 * dt, 20, W - 20);
    if (tx !== null) px = clamp(px + clamp(tx - px, -560 * dt, 560 * dt), 20, W - 20);
    fireT -= dt; if (fireT <= 0) { fireT = [.26, .32, .4][lv]; bullets.push({ x: px, y: SY - 14 }); }
    bullets.forEach(b => { b.y -= 560 * dt; }); bullets = bullets.filter(b => b.y > -10 && !b.dead);
    const alive = en.filter(e => e.alive), n = alive.length;
    const sp = (28 + wave * 7) * [.75, 1, 1.3][lv] * (1 + (total - n) / total * 2.4);
    let edge = false;
    alive.forEach(e => { e.x += dirx * sp * dt; if (e.x < 8 || e.x + EW > W - 8) edge = true; });
    if (edge) { dirx = -dirx; alive.forEach(e => { e.y += 16; e.x = clamp(e.x, 8, W - 8 - EW); }); }
    if (alive.some(e => e.y + EH >= SY - 24)) { die(); return; }
    bombT -= dt;
    if (bombT <= 0 && n) {
      const front = alive.filter(e => !alive.some(o => o.c === e.c && o.r > e.r)), e = front[rand(front.length)];
      bombs.push({ x: e.x + EW / 2, y: e.y + EH });
      bombT = Math.max(.35, [1.6, 1.2, .9][lv] - wave * .08) * (.6 + Math.random() * .8);
    }
    bombs.forEach(b => { b.y += (170 + wave * 10) * dt; });
    bombs = bombs.filter(b => b.y < H + 10);
    for (const b of bullets) for (const e of alive) {
      if (e.alive && b.x > e.x && b.x < e.x + EW && b.y > e.y && b.y < e.y + EH) { e.alive = false; b.dead = true; score += 10 + 10 * Math.max(0, 2 - e.r); api.score(score); break; }
    }
    for (const b of bombs) if (inv <= 0 && Math.abs(b.x - px) < 18 && b.y > SY - 12 && b.y < SY + 12) {
      b.y = H + 50; lives--; inv = 1.6; if (lives <= 0) { die(); return; }
    }
    if (!en.some(e => e.alive)) { wave++; score += 100; api.score(score); build(); }
    clear();
    stars.forEach(s => { s.y += s.s * 30 * dt; if (s.y > H) s.y = 0; circle(s.x, s.y, s.s, 'rgba(255,255,255,.55)'); });
    en.forEach(e => {
      if (!e.alive) return;
      const col = ROWCOL[e.r % 5], wob = Math.sin(tt * 6 + e.c) * 2;
      rr(e.x, e.y, EW, EH - 4, 9, col);
      circle(e.x + 9, e.y + 8, 3.4, '#10132a'); circle(e.x + EW - 9, e.y + 8, 3.4, '#10132a');
      rr(e.x + 4, e.y + EH - 5, 6, 5 + wob / 2, 2, col); rr(e.x + EW - 10, e.y + EH - 5, 6, 5 - wob / 2, 2, col);
    });
    bullets.forEach(b => rr(b.x - 2, b.y - 8, 4, 12, 2, '#fff'));
    bombs.forEach(b => circle(b.x, b.y, 5, '#ff5c7a'));
    if (inv <= 0 || Math.floor(tt * 14) % 2) {
      ctx.fillStyle = '#7dffc4'; ctx.beginPath(); ctx.moveTo(px, SY - 18); ctx.lineTo(px + 18, SY + 10); ctx.lineTo(px - 18, SY + 10); ctx.closePath(); ctx.fill();
      rr(px - 6, SY + 2, 12, 10, 3, '#4fd8a0');
    }
    text('Wave ' + wave, 50, 24, 15, '#8d94c4'); text('♥'.repeat(Math.max(0, lives)), W - 50, 24, 16, '#ff5c7a');
  });
  return {};
}
