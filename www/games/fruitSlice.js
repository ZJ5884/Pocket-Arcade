/* ---------------- FRUIT SLICE ---------------- */
function fruitSlice(api, signal, lv){
  const FR = [['🍉', '#ff5c7a'], ['🍊', '#ffa94d'], ['🍋', '#ffe066'], ['🍎', '#ff6b6b'], ['🍍', '#ffd43b'], ['🥝', '#8ce99a']];
  let items = [], halves = [], trail = [], score = 0, lives = 3, spawnT = .8, over = false, endT = 0, down = false, blade = false, cx = W / 2, cy = H / 2, combo = 0, pops = [], boom = 0;
  const bombP = [.1, .16, .22][lv], G = 780;
  function launch(){
    const bomb = Math.random() < bombP, x = 50 + Math.random() * (W - 100), f = FR[rand(FR.length)];
    items.push({ x, y: H + 24, vx: (W / 2 - x) * (.25 + Math.random() * .35), vy: -(660 + Math.random() * 110 + lv * 20), bomb, e: bomb ? '💣' : f[0], c: bomb ? '#999' : f[1], r: 26, rot: 0, vr: (Math.random() - .5) * 6 });
  }
  function slice(p0, p1){
    for (const it of items) {
      if (it.cut) continue;
      const dx = p1.x - p0.x, dy = p1.y - p0.y, l2 = dx * dx + dy * dy || 1;
      const t = clamp(((it.x - p0.x) * dx + (it.y - p0.y) * dy) / l2, 0, 1), d = Math.hypot(p0.x + dx * t - it.x, p0.y + dy * t - it.y);
      if (d < it.r + 4 && l2 > 16) {
        it.cut = true;
        if (it.bomb) { over = true; endT = .9; boom = .6; buzz('over'); beep(90, .4); }
        else {
          combo++; const pts = 10 + Math.min(combo, 8) * 2; score += pts; api.score(score); beep(600 + Math.min(combo, 10) * 50, .06); buzz();
          pops.push({ x: it.x, y: it.y - 24, t: .5, s: '+' + pts });
          const a = Math.atan2(dy, dx);
          halves.push({ x: it.x, y: it.y, vx: it.vx - Math.sin(a) * 80, vy: it.vy - 60, e: it.e, s: -1, t: 1.2 }, { x: it.x, y: it.y, vx: it.vx + Math.sin(a) * 80, vy: it.vy - 60, e: it.e, s: 1, t: 1.2 });
        }
      }
    }
  }
  const addPt = p => { const last = trail[trail.length - 1]; trail.push({ x: p.x, y: p.y, t: .22 }); if (last && (down || blade) && !over) slice(last, p); };
  canvas.addEventListener('pointerdown', e => { down = true; capture(e); trail = []; addPt(pt(e)); }, { signal });
  canvas.addEventListener('pointermove', e => { if (down) addPt(pt(e)); }, { signal });
  const up = () => { down = false; combo = 0; };
  canvas.addEventListener('pointerup', up, { signal }); canvas.addEventListener('pointercancel', up, { signal });
  loop(signal, dt => {
    if (!over) {
      spawnT -= dt;
      if (spawnT <= 0) { const n = 1 + (Math.random() < .35 + lv * .1 ? 1 : 0) + (score > 300 && Math.random() < .3 ? 1 : 0); for (let i = 0; i < n; i++) launch(); spawnT = Math.max(.7, [1.5, 1.25, 1.05][lv] - score / 900) * (.8 + Math.random() * .5); }
      if (blade) { cx = clamp(cx + axis() * 420 * dt, 0, W); cy = clamp(cy + axisY() * 420 * dt, 0, H); addPt({ x: cx, y: cy }); }
      else { cx = clamp(cx + axis() * 300 * dt, 0, W); cy = clamp(cy + axisY() * 300 * dt, 0, H); }
    } else { endT -= dt; if (endT <= 0) { api.end(score, ''); endT = 99; } }
    items.forEach(i => { i.x += i.vx * dt; i.y += i.vy * dt; i.vy += G * dt; i.rot += i.vr * dt; });
    for (const i of items) if (!i.cut && i.vy > 0 && i.y > H + 30) { i.cut = true; i.miss = true; if (!i.bomb && !over) { lives--; combo = 0; if (lives <= 0) { over = true; endT = .6; } } }
    items = items.filter(i => !i.cut);
    halves.forEach(h => { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += G * dt; h.t -= dt; }); halves = halves.filter(h => h.t > 0 && h.y < H + 40);
    trail.forEach(p => p.t -= dt); trail = trail.filter(p => p.t > 0);
    pops.forEach(p => { p.t -= dt; p.y -= 30 * dt; }); pops = pops.filter(p => p.t > 0);
    if (boom > 0) boom -= dt;
    clear();
    items.forEach(i => { ctx.save(); ctx.translate(i.x, i.y); ctx.rotate(i.rot); text(i.e, 0, 0, 46); ctx.restore(); });
    halves.forEach(h => { ctx.save(); ctx.beginPath(); ctx.rect(h.x - (h.s < 0 ? 30 : 0), h.y - 30, 30, 60); ctx.clip(); text(h.e, h.x, h.y, 46); ctx.restore(); });
    if (trail.length > 1) { ctx.lineCap = 'round'; for (let i = 1; i < trail.length; i++) { ctx.strokeStyle = 'rgba(255,255,255,' + clamp(trail[i].t * 4.5, 0, 1) + ')'; ctx.lineWidth = 2 + trail[i].t * 22; ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke(); } ctx.lineCap = 'butt'; }
    pops.forEach(p => text(p.s, p.x, p.y, 18, '#ffd75c'));
    if (padConnected) crosshair(cx, cy, blade ? '#ff7a8a' : '#fff');
    text('♥'.repeat(Math.max(0, lives)), 50, 22, 18, '#ff6b8a');
    if (boom > 0) { ctx.fillStyle = 'rgba(255,255,255,' + boom + ')'; ctx.fillRect(0, 0, W, H); }
    if (!score && !over) text('Swipe to slice. Skip the bombs.', W / 2, 510, 14, '#6c73a6');
  });
  return { a: () => { blade = true; trail = []; }, aUp: () => { blade = false; combo = 0; }, dbg: () => ({ items, score, lives }) };
}
