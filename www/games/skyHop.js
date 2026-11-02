/* ---------------- SKY HOP ---------------- */
function skyHop(api, signal, lv){
  const P = { x: W / 2, y: 430, vy: -560, f: 1 };
  let jet = 0, plats = [], climbed = 0, score = 0, tx = null, over = false, topY = H - 30, endT = 0, trail = [];
  const base = [58, 72, 86][lv], PW = [74, 64, 56][lv];
  function addPlat(){
    const gap = Math.min(128, base + Math.min(34, climbed / 220)) * (.72 + Math.random() * .4);
    topY -= gap;
    const moving = climbed > 300 && Math.random() < Math.min(.4, climbed / 4000) + lv * .05;
    const r = Math.random(), pu = !moving && climbed > 150 ? (r < .1 ? 'spring' : r < .135 ? 'jet' : null) : null;
    plats.push({ x: Math.random() * (W - PW), y: topY, mv: moving ? (Math.random() < .5 ? -1 : 1) * (35 + Math.random() * 30) : 0, w: PW, pu });
  }
  plats.push({ x: W / 2 - 45, y: H - 30, mv: 0, w: 90 });
  while (topY > -80) addPlat();
  canvas.addEventListener('pointerdown', e => { tx = pt(e).x; capture(e); }, { signal });
  canvas.addEventListener('pointermove', e => { if (tx !== null) tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointerup', () => { tx = null; }, { signal });
  loop(signal, dt => {
    if (!over) {
      let vx = axis() * 280;
      if (tx !== null) vx = clamp((tx - P.x) * 6, -300, 300);
      if (vx) P.f = vx > 0 ? 1 : -1;
      P.x += vx * dt; if (P.x < -10) P.x = W + 10; if (P.x > W + 10) P.x = -10;
      const oy = P.y;
      if (jet > 0) { jet -= dt; P.vy = -640; } else P.vy += 1000 * dt;
      P.y += P.vy * dt;
      plats.forEach(p => { if (p.mv) { p.x += p.mv * dt; if (p.x < 0 || p.x + p.w > W) p.mv = -p.mv; } });
      if (P.vy > 0) for (const p of plats) if (oy + 12 <= p.y + 4 && P.y + 12 >= p.y && P.x > p.x - 8 && P.x < p.x + p.w + 8) { P.vy = p.pu === 'spring' ? -900 : -560; beep(p.pu === 'spring' ? 760 : 520, .06); if (p.pu === 'spring') buzz(); break; }
      for (const p of plats) if (p.pu === 'jet' && jet <= 0 && Math.abs(P.x - (p.x + p.w / 2)) < 22 && Math.abs(P.y - (p.y - 16)) < 22) { jet = 1.5; p.pu = null; beep(980, .2); buzz('win'); }
      if (P.y < H * .4) { const d = H * .4 - P.y; P.y += d; plats.forEach(p => p.y += d); topY += d; climbed += d; const s = Math.floor(climbed / 10); if (s > score) { score = s; api.score(score); } }
      plats = plats.filter(p => p.y < H + 30);
      while (topY > -80) addPlat();
      if (P.y > H + 40) { over = true; endT = .5; buzz('over'); }
    } else { endT -= dt; if (endT <= 0) { api.end(score, ''); endT = 99; } }
    clear();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 28; i++) ctx.fillRect((i * 97) % W, (i * 61 + climbed * .15) % H, 2, 2);
    plats.forEach(p => {
      rr(p.x, p.y, p.w, 12, 6, p.mv ? '#ffb347' : '#5cff9a');
      if (p.pu === 'spring') { const cx2 = p.x + p.w / 2; ctx.strokeStyle = '#ff6b8a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx2 - 8, p.y); for (let k = 0; k < 4; k++) ctx.lineTo(cx2 + (k % 2 ? 8 : -8), p.y - 3 - k * 4); ctx.stroke(); rr(cx2 - 10, p.y - 19, 20, 5, 2, '#ff6b8a'); }
      else if (p.pu === 'jet') { const cx2 = p.x + p.w / 2; rr(cx2 - 3, p.y - 12, 6, 12, 2, '#ffd75c'); ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx2 - 13, p.y - 16); ctx.lineTo(cx2 + 13, p.y - 16); ctx.stroke(); }
    });
    if (jet > 0) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 3; const sp = Math.sin(performance.now() / 30) * 12; ctx.beginPath(); ctx.moveTo(P.x - 14 - sp, P.y - 20); ctx.lineTo(P.x + 14 + sp, P.y - 20); ctx.stroke(); circle(P.x, P.y + 20, 6, '#ff9a5c'); }
    const sq = P.vy < 0 ? 1.08 : .94;
    ctx.save(); ctx.translate(P.x, P.y); ctx.scale(1 / sq, sq);
    rr(-13, -14, 26, 26, 9, '#7cc4ff'); circle(-5 * P.f + 3, -5, 3.5, '#10132a'); circle(5 * P.f + 3, -5, 3.5, '#10132a'); rr(-7, 3, 14, 3, 1.5, '#10132a');
    ctx.restore();
    text(score + ' m', W / 2, 22, 18, '#e8ebff');
  });
  return { dbg: () => ({ P, plats, score }) };
}
