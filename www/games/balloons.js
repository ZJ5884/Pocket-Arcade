/* ---------------- BALLOON POP ---------------- */
function balloons(api, signal, lv){
  const COL = ['#ff5c7a', '#5cb8ff', '#5cff9a', '#ffb347', '#b36bff'];
  let freeze = 0, b = [], score = 0, lives = 5, spawn = .5, t = 0, over = false, endT = 0, cx = W / 2, cy = H / 2, pops = [], bits = [], combo = 0;
  const sp0 = [70, 90, 112][lv];
  function pop(x, y){
    if (over) return;
    let best = null, bd = 1e9;
    for (const o of b) { const d = Math.hypot(o.x - x, (o.y - 4) - y); if (d < o.r + 12 && d < bd) { bd = d; best = o; } }
    if (!best) { combo = 0; return; }
    b = b.filter(o => o !== best); beep(500 + Math.min(combo, 12) * 40, .05); buzz();
    for (let i = 0; i < 8; i++) { const a = i * TAU / 8; bits.push({ x: best.x, y: best.y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110, t: .35, c: best.c }); }
    if (best.k === 'spike') { lives--; combo = 0; pops.push({ x: best.x, y: best.y, t: .6, s: 'Ouch', c: '#ff5c7a' }); if (lives <= 0) { over = true; endT = .6; } return; }
    if (best.k === 'freeze') { freeze = 6; beep(980, .15); pops.push({ x: best.x, y: best.y, t: .9, s: 'Freeze!', c: '#5cc8ff' }); return; }
    if (best.k === 'heart') { lives = Math.min(7, lives + 1); beep(980, .15); pops.push({ x: best.x, y: best.y, t: .9, s: '+1 life', c: '#ff6b8a' }); return; }
    if (best.k === 'burst') { let n = 0; b = b.filter(o => { if (o.k === 'spike' || o.y > H - 10) return true; n++; for (let i = 0; i < 4; i++) bits.push({ x: o.x, y: o.y, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, t: .35, c: o.c }); return false; }); score += n * 10; api.score(score); beep(300, .25); buzz('win'); pops.push({ x: best.x, y: best.y, t: .9, s: 'Burst +' + n * 10, c: '#ffd75c' }); return; }
    combo++; const p = best.k === 'gold' ? 50 : 10 + Math.min(combo, 8) * 2; score += p; api.score(score);
    pops.push({ x: best.x, y: best.y, t: .6, s: '+' + p, c: '#ffd75c' });
  }
  canvas.addEventListener('pointerdown', e => { const p = pt(e); cx = p.x; cy = p.y; pop(p.x, p.y); }, { signal });
  loop(signal, dt => {
    t += dt;
    if (!over) {
      cx = clamp(cx + axis() * 320 * dt, 0, W); cy = clamp(cy + axisY() * 320 * dt, 0, H);
      spawn -= dt;
      if (spawn <= 0) {
        const r = Math.random(), k = r < [.07, .12, .17][lv] ? 'spike' : (r > .965 ? 'freeze' : r > .94 ? 'burst' : r > .925 ? 'heart' : r > .86 ? 'gold' : 'normal');
        b.push({ x: 30 + Math.random() * (W - 60), y: H + 40, vy: -(sp0 + Math.min(score, 800) * .12) * (.8 + Math.random() * .5), ph: Math.random() * 6, k, c: k === 'spike' ? '#555a78' : k === 'gold' ? '#ffd75c' : k === 'freeze' ? '#8fd8ff' : k === 'burst' ? '#ff8a3d' : k === 'heart' ? '#ff6b8a' : COL[rand(COL.length)], r: k === 'gold' ? 20 : 26 });
        spawn = Math.max(.28, [.8, .65, .52][lv] - score / 1500) * (.6 + Math.random() * .8);
      }
      if (freeze > 0) freeze -= dt;
      b.forEach(o => { o.y += o.vy * dt * (freeze > 0 ? .3 : 1); o.x += Math.sin(t * 2 + o.ph) * 18 * dt; });
      for (const o of b) if (o.y < -50) { o.gone = true; if (o.k !== 'spike') { lives--; combo = 0; if (lives <= 0 && !over) { over = true; endT = .6; } } }
      b = b.filter(o => !o.gone);
    } else { endT -= dt; if (endT <= 0) { api.end(score, ''); endT = 99; } }
    bits.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; }); bits = bits.filter(p => p.t > 0);
    pops.forEach(p => { p.t -= dt; p.y -= 40 * dt; }); pops = pops.filter(p => p.t > 0);
    clear();
    b.forEach(o => {
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(o.x, o.y + o.r * 1.15); ctx.lineTo(o.x + Math.sin(t * 3 + o.ph) * 5, o.y + o.r * 2.6); ctx.stroke();
      ctx.fillStyle = o.c; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.r * .86, o.r, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(o.x - o.r * .3, o.y - o.r * .35, o.r * .18, o.r * .3, .5, 0, TAU); ctx.fill();
      if (o.k === 'freeze' || o.k === 'burst' || o.k === 'heart') text({ freeze: '❄', burst: '✸', heart: '♥' }[o.k], o.x, o.y, 20, '#fff');
      if (o.k === 'spike') { ctx.strokeStyle = '#ff5c7a'; ctx.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ctx.beginPath(); ctx.moveTo(o.x + Math.cos(a) * o.r * .8, o.y + Math.sin(a) * o.r * .9); ctx.lineTo(o.x + Math.cos(a) * (o.r + 8), o.y + Math.sin(a) * (o.r + 9)); ctx.stroke(); } }
    });
    bits.forEach(p => circle(p.x, p.y, 3, p.c));
    pops.forEach(p => text(p.s, p.x, p.y, 18, p.c));
    if (padConnected) crosshair(cx, cy, '#fff');
    text('♥'.repeat(Math.max(0, lives)), 60, 22, 18, '#ff6b8a'); if (freeze > 0) text('Freeze ' + Math.ceil(freeze), W / 2, 22, 14, '#8fd8ff'); text(combo > 2 ? 'Streak ' + combo : '', W - 60, 22, 15, '#ffd75c');
    if (!score && !over) text('Pop balloons. Leave the spiky ones.', W / 2, 515, 14, '#6c73a6');
  });
  return { a: () => pop(cx, cy), dbg: () => ({ b, score, lives }) };
}
