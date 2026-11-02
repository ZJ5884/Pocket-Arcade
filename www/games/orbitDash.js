/* ---------------- ORBIT DASH ---------------- */
function orbitDash(api, signal, lv){
  const CX = W / 2, CY = 260, R = [62, 112, 162];
  let ang = -Math.PI / 2, orb = 0, tOrb = 0, rad = R[0], blocks = [], coins = [], t = 0, dist = 0, score = 0, coinN = 0, spawn = 1, speed = [1.5, 1.8, 2.1][lv], over = false, endT = 0, dir = 1, trail = [], cT = 2, flash = 0;
  function sw(){ if (over) return; orb = (orb + 1) % 3; if (orb === 0 && tOrb === 2) { /* fall back from outer */ } tOrb = orb; beep(300 + orb * 120, .04); }
  function sw2(d){ if (over) return; orb = clamp(orb + d, 0, 2); beep(300 + orb * 120, .04); }
  canvas.addEventListener('pointerdown', () => { if (over) return; orb = orb === 2 ? 0 : orb + 1; beep(300 + orb * 120, .04); }, { signal });
  function mkBlock(){
    const o = rand(3), a = ang + dir * (1.6 + Math.random() * 2.2);
    blocks.push({ o, a, w: .3 + Math.random() * .22, life: 7, grow: 0 });
    if (Math.random() < [.3, .45, .6][lv]) blocks.push({ o: (o + 1 + rand(2)) % 3, a: a + (Math.random() - .5) * .3, w: .3, life: 7, grow: 0 });
    if (blocks.slice(-2).length === 2 && blocks[blocks.length - 1].o !== blocks[blocks.length - 2].o) { const l = blocks[blocks.length - 1], p = blocks[blocks.length - 2]; const used = new Set([l.o, p.o]); if (used.size === 2 && Math.abs(l.a - p.a) < .5) { const free = [0, 1, 2].find(k => !used.has(k)); /* leave one lane free */ } }
  }
  loop(signal, dt => {
    if (!over) {
      t += dt; speed += dt * .02; dist += dt;
      ang += dir * speed * dt; rad += (R[orb] - rad) * Math.min(1, dt * 14);
      spawn -= dt; if (spawn <= 0) { mkBlock(); spawn = Math.max(.55, [1.6, 1.3, 1.05][lv] - t / 90); }
      cT -= dt; if (cT <= 0) { coins.push({ o: rand(3), a: ang + dir * (1.2 + Math.random() * 2.6), life: 8 }); cT = 1.6 + Math.random(); }
      blocks.forEach(b => { b.life -= dt; b.grow = Math.min(1, b.grow + dt * 3); }); blocks = blocks.filter(b => b.life > 0);
      coins.forEach(c => c.life -= dt); coins = coins.filter(c => c.life > 0);
      const norm = a => { a = a % TAU; return a < 0 ? a + TAU : a; };
      for (const b of blocks) if (b.grow > .8 && Math.abs(rad - R[b.o]) < 16) { let d = Math.abs(norm(ang) - norm(b.a)); if (d > Math.PI) d = TAU - d; if (d < b.w / 2 + 10 / R[b.o]) { over = true; endT = .8; flash = .6; buzz('over'); beep(100, .3); } }
      coins = coins.filter(c => { let d = Math.abs(norm(ang) - norm(c.a)); if (d > Math.PI) d = TAU - d; if (Math.abs(rad - R[c.o]) < 20 && d < 16 / R[c.o] + .05) { coinN++; beep(980, .06); return false; } return true; });
      const s = Math.floor(dist * 10) + coinN * 25; if (s !== score) { score = s; api.score(score); }
      trail.push([CX + Math.cos(ang) * rad, CY + Math.sin(ang) * rad]); if (trail.length > 18) trail.shift();
    } else { endT -= dt; if (endT <= 0) { api.end(score, Math.floor(dist) + ' s · ' + coinN + ' coins'); endT = 99; } }
    if (flash > 0) flash -= dt;
    clear();
    for (let o = 0; o < 3; o++) { ctx.strokeStyle = o === orb ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(CX, CY, R[o], 0, TAU); ctx.stroke(); }
    circle(CX, CY, 8, '#ffd75c');
    for (const b of blocks) { ctx.strokeStyle = b.life < 1.2 && Math.floor(b.life * 8) % 2 ? 'rgba(255,92,122,.4)' : '#ff5c7a'; ctx.lineWidth = 14 * b.grow; ctx.beginPath(); ctx.arc(CX, CY, R[b.o], b.a - b.w / 2, b.a + b.w / 2); ctx.stroke(); }
    coins.forEach(c => { circle(CX + Math.cos(c.a) * R[c.o], CY + Math.sin(c.a) * R[c.o], 8, '#ffd75c'); });
    trail.forEach(([x, y], i) => { ctx.globalAlpha = i / trail.length * .6; circle(x, y, 3 + i * .2, '#5cff9a'); }); ctx.globalAlpha = 1;
    if (!over) circle(CX + Math.cos(ang) * rad, CY + Math.sin(ang) * rad, 8, '#5cff9a');
    text(String(score), W / 2, 28, 24, '#fff'); text('🪙 ' + coinN, W - 50, 28, 15, '#ffd75c');
    text(t < 4 ? 'Tap or press A to hop to the next ring' : '', W / 2, 520, 15, '#b9bfe8');
    if (flash > 0) { ctx.fillStyle = 'rgba(255,92,122,' + flash * .5 + ')'; ctx.fillRect(0, 0, W, H); }
  });
  return { a: () => { if (!over) { orb = orb === 2 ? 0 : orb + 1; beep(300 + orb * 120, .04); } }, dir: d => { if (d === 'u' || d === 'r') sw2(1); else sw2(-1); }, dbg: () => ({ blocks, orb, score }) };
}
