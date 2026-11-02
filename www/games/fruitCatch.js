/* ---------------- FRUIT CATCH ---------------- */
function fruitCatch(api, signal, lv){
  let wide = 0, slow = 0, bx = W / 2, tx = null, items = [], score = 0, lives = 3, spawn = .6, t = 0, over = false, endT = 0, pops = [], combo = 0, hurt = 0;
  const FR = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍐'];
  const bombP = [.1, .17, .24][lv], sp0 = [120, 150, 180][lv];
  canvas.addEventListener('pointerdown', e => { tx = pt(e).x; capture(e); }, { signal });
  canvas.addEventListener('pointermove', e => { if (tx !== null) tx = pt(e).x; }, { signal });
  canvas.addEventListener('pointerup', () => { tx = null; }, { signal });
  function lose(){ lives--; hurt = .4; combo = 0; buzz('over'); if (lives <= 0 && !over) { over = true; endT = .7; } }
  loop(signal, dt => {
    t += dt;
    if (!over) {
      bx += axis() * 380 * dt;
      if (tx !== null) bx += clamp(tx - bx, -700 * dt, 700 * dt);
      bx = clamp(bx, 40, W - 40);
      if (slow > 0) spawn -= 0;
      spawn -= dt;
      if (spawn <= 0) {
        const bomb = Math.random() < bombP, pu = !bomb && Math.random() < .07 ? ['wide', 'slow', 'life'][rand(3)] : null;
        items.push({ pu, x: 28 + Math.random() * (W - 56), y: -20, vy: (sp0 + Math.min(score, 600) * .25) * (.85 + Math.random() * .4), bomb, e: bomb ? '💣' : pu ? { wide: '⭐', slow: '❄️', life: '❤️' }[pu] : FR[rand(FR.length)], rot: Math.random() * 6 });
        spawn = Math.max(.34, [.95, .8, .65][lv] - score / 1200) * (.7 + Math.random() * .6);
      }
      for (const it of items) {
        it.y += it.vy * dt * (slow > 0 ? .5 : 1); it.rot += dt * 2;
        if (!it.gone && it.y > H - 74 && it.y < H - 40 && Math.abs(it.x - bx) < (wide > 0 ? 74 : 46)) {
          it.gone = true;
          if (it.pu) { beep(900, .12); buzz('win'); if (it.pu === 'wide') wide = 9; else if (it.pu === 'slow') slow = 7; else lives = Math.min(5, lives + 1); pops.push({ x: it.x, y: it.y - 20, t: .8, s: { wide: 'Wide basket', slow: 'Slow fall', life: '+1 life' }[it.pu], c: '#5cff9a' }); }
          else if (it.bomb) { lose(); pops.push({ x: it.x, y: it.y, t: .5, s: 'Ouch', c: '#ff5c7a' }); }
          else { combo++; const p = 10 + Math.min(combo, 10); score += p; api.score(score); beep(500 + Math.min(combo, 12) * 40, .05); pops.push({ x: it.x, y: it.y - 20, t: .5, s: '+' + p, c: '#ffd75c' }); }
        } else if (!it.gone && it.y > H + 20) { it.gone = true; if (!it.bomb && !it.pu) lose(); }
      }
      items = items.filter(i => !i.gone);
    } else { endT -= dt; if (endT <= 0) { api.end(score, ''); endT = 99; } }
    pops.forEach(p => { p.t -= dt; p.y -= 40 * dt; }); pops = pops.filter(p => p.t > 0);
    if (hurt > 0) hurt -= dt; if (wide > 0) wide -= dt; if (slow > 0) slow -= dt;
    clear();
    items.forEach(i => { ctx.save(); ctx.translate(i.x, i.y); ctx.rotate(Math.sin(i.rot) * .4); text(i.e, 0, 0, 30); ctx.restore(); });
    const y = H - 56, hw = wide > 0 ? 72 : 44;
    ctx.fillStyle = hurt > 0 ? '#ff5c7a' : '#c98a4b'; ctx.beginPath(); ctx.moveTo(bx - hw, y - 14); ctx.lineTo(bx + hw, y - 14); ctx.lineTo(bx + hw - 10, y + 20); ctx.lineTo(bx - hw + 10, y + 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let k = -hw + 14; k < hw - 4; k += 16) ctx.fillRect(bx + k, y - 10, 3, 28);
    if (wide > 0) text('Wide ' + Math.ceil(wide), 40, 515, 12, '#5cff9a'); if (slow > 0) text('Slow ' + Math.ceil(slow), W - 40, 515, 12, '#5cc8ff');
    pops.forEach(p => text(p.s, p.x, p.y, 18, p.c));
    text('♥'.repeat(Math.max(0, lives)), 50, 22, 18, '#ff6b8a');
    text(combo > 2 ? 'Streak ' + combo : '', W - 60, 22, 15, '#ffd75c');
  });
  return { dbg: () => ({ items, score, lives }) };
}
