/* ---------------- WHACK ---------------- */
function whack(api, signal, lv){
  const TIME = 45;
  const holes = Array.from({ length: 9 }, (_, i) => ({ x: 70 + (i % 3) * 110, y: 190 + ((i / 3) | 0) * 120, up: false, t: 0, dur: 0, kind: 'mole', hit: 0 }));
  let score = 0, timeLeft = TIME, spawnT = .6, cursor = 4, combo = 0, flash = [], endT = 0, dead = false, ended = false;
  function pop(){
    const free = holes.filter(h => !h.up && h.hit <= 0);
    if (!free.length) return;
    const h = free[rand(free.length)], prog = 1 - timeLeft / TIME;
    h.up = true; h.t = 0; h.dur = Math.max(.55, 1.3 - prog * .7) * [1.5, 1, .75][lv] * (.8 + Math.random() * .4); h.kind = Math.random() < [.08, .18, .28][lv] ? 'bomb' : 'mole';
  }
  function smack(i){
    const h = holes[i];
    if (dead || !h) return;
    if (!h.up) { combo = 0; return; }
    h.up = false; h.hit = .35;
    if (h.kind === 'mole') { combo++; const pts = 100 + Math.min(5, combo - 1) * 20; score += pts; flash.push({ x: h.x, y: h.y - 70, t: .6, s: '+' + pts, c: '#ffd75c' }); }
    else { combo = 0; score = Math.max(0, score - 200); flash.push({ x: h.x, y: h.y - 70, t: .6, s: '-200', c: '#ff5c7a' }); }
    api.score(score);
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    let best = -1, bd = 60;
    holes.forEach((h, i) => { const d = Math.hypot(p.x - h.x, p.y - (h.y - 25)); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { cursor = best; smack(best); }
  }, { signal });
  loop(signal, dt => {
    if (!dead) {
      timeLeft -= dt; spawnT -= dt;
      const prog = 1 - timeLeft / TIME;
      if (spawnT <= 0) { pop(); spawnT = Math.max([.4, .28, .2][lv], [1.0, .8, .6][lv] - prog * .5) * (.6 + Math.random() * .8); }
      holes.forEach(h => { if (h.up) { h.t += dt; if (h.t >= h.dur) { h.up = false; if (h.kind === 'mole') combo = 0; } } if (h.hit > 0) h.hit -= dt; });
      if (timeLeft <= 0) { dead = true; endT = .5; }
    } else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, ''); } }
    flash.forEach(f => { f.t -= dt; f.y -= 40 * dt; }); flash = flash.filter(f => f.t > 0);
    clear();
    text('Time ' + Math.max(0, Math.ceil(timeLeft)), 60, 28, 18, timeLeft < 10 ? '#ff7a8a' : '#e8ebff');
    text(combo > 1 ? 'Combo x' + combo : '', W - 70, 28, 16, '#ffd75c');
    holes.forEach((h, i) => {
      ctx.fillStyle = '#0c0e1c'; ctx.beginPath(); ctx.ellipse(h.x, h.y, 44, 15, 0, 0, TAU); ctx.fill();
      const rise = h.up ? Math.min(1, h.t / .12, (h.dur - h.t) / .12) : (h.hit > 0 ? h.hit / .35 * .4 : 0);
      if (rise > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(h.x - 60, h.y - 140, 120, 140 + 4); ctx.clip();
        const cy = h.y + 22 - rise * 62;
        if (h.kind === 'bomb' && (h.up || h.hit <= 0)) {
          circle(h.x, cy, 28, '#2b2f40'); ctx.strokeStyle = '#ffb27a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(h.x + 12, cy - 24); ctx.lineTo(h.x + 22, cy - 38); ctx.stroke(); circle(h.x + 22, cy - 38, 4, '#ff5c7a');
        } else {
          circle(h.x, cy, 32, h.hit > 0 ? '#c9a07a' : '#9a6b43'); circle(h.x - 11, cy - 6, 4.5, '#10132a'); circle(h.x + 11, cy - 6, 4.5, '#10132a');
          ctx.fillStyle = '#e8a0a0'; ctx.beginPath(); ctx.ellipse(h.x, cy + 6, 8, 5, 0, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
      ctx.fillStyle = '#2b2f58'; ctx.beginPath(); ctx.ellipse(h.x, h.y + 3, 50, 12, 0, 0, Math.PI); ctx.fill();
      if (padConnected && i === cursor) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(h.x, h.y - 8, 56, 40, 0, 0, TAU); ctx.stroke(); }
    });
    flash.forEach(f => text(f.s, f.x, f.y, 22, f.c));
    text('Avoid the bombs', W / 2, 520, 13, '#6c73a6');
  });
  return {
    dir: d => { const x = clamp(cursor % 3 + VEC[d][0], 0, 2), y = clamp(((cursor / 3) | 0) + VEC[d][1], 0, 2); cursor = y * 3 + x; },
    a: () => smack(cursor)
  };
}
