/* ---------------- BEAT TAP ---------------- */
function beatTap(api, signal, lv){
  const LANES = 4, LW = 80, X0 = 20, HIT = 450, SPEED = [230, 280, 330][lv], BPM = [96, 112, 128][lv], DUR = 60;
  const NOTE = [330, 392, 440, 523];
  const LC = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff'];
  let notes = [], t = 0, nextBeat = 1.5, beatN = 0, score = 0, combo = 0, best = 0, hp = 60, msg = '', msgT = 0, over = false, endT = 0, press = [0, 0, 0, 0], hitsN = 0, total = 0, lastLane = -1, flashes = [];
  function spawn(){
    let l; do { l = rand(LANES); } while (l === lastLane && Math.random() < .75); lastLane = l;
    notes.push({ l, y: HIT - (SPEED * 1.6), t: 0, hit: false }); total++;
    if (lv > 0 && Math.random() < .25) { let l2 = (l + 1 + rand(3)) % LANES; notes.push({ l: l2, y: HIT - SPEED * 1.6, hit: false }); total++; }
  }
  function tap(l){
    if (over) return; press[l] = .12;
    let best = null, bd = 1e9;
    for (const n of notes) if (!n.hit && n.l === l) { const d = Math.abs(n.y - HIT); if (d < bd) { bd = d; best = n; } }
    if (best && bd < SPEED * .16) {
      best.hit = true; const perfect = bd < SPEED * .06; combo++; best2(); hitsN++;
      const pts = (perfect ? 100 : 50) * (1 + Math.min(Math.floor(combo / 10), 4)); score += pts; api.score(score); hp = Math.min(100, hp + (perfect ? 3 : 1.5));
      msg = perfect ? 'Perfect' : 'Good'; msgT = .35; beep(NOTE[l] * (perfect ? 1 : .99), .09); buzz(); flashes.push({ l, t: .25 });
    } else { combo = 0; hp -= 4; beep(110, .08); msg = 'Miss'; msgT = .3; }
  }
  const best2 = () => { if (combo > best) best = combo; };
  canvas.addEventListener('pointerdown', e => { const p = pt(e), l = Math.floor((p.x - X0) / LW); if (l >= 0 && l < LANES) tap(l); }, { signal });
  loop(signal, dt => {
    if (!over) {
      t += dt;
      if (t >= nextBeat) { beatN++; nextBeat += 60 / BPM * (lv === 2 ? .5 : 1); if (t < DUR - 3 && Math.random() < [.7, .8, .8][lv]) spawn(); }
      notes.forEach(n => { n.y += SPEED * dt; });
      for (const n of notes) if (!n.hit && n.y > HIT + SPEED * .17) { n.hit = true; n.missed = true; combo = 0; hp -= 8; msg = 'Miss'; msgT = .3; buzz('over'); }
      notes = notes.filter(n => n.y < H + 20 && !(n.hit && !n.missed && n.y > HIT + 40));
      if (hp <= 0) { over = true; endT = .8; msg = 'Out of energy'; msgT = 2; }
      else if (t > DUR && !notes.some(n => !n.hit)) { over = true; endT = .8; msg = 'Song complete'; msgT = 2; score += Math.round(hp * 5); api.score(score); }
    } else { endT -= dt; if (endT <= 0) { api.end(score, 'Best streak ' + best + ' · ' + hitsN + '/' + total + ' notes'); endT = 99; } }
    press = press.map(v => Math.max(0, v - dt)); flashes.forEach(f => f.t -= dt); flashes = flashes.filter(f => f.t > 0); if (msgT > 0) msgT -= dt;
    clear();
    for (let l = 0; l < LANES; l++) { ctx.fillStyle = l % 2 ? '#1c2148' : '#202650'; ctx.fillRect(X0 + l * LW, 0, LW, H); }
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(X0, HIT - 3, LANES * LW, 6);
    for (let l = 0; l < LANES; l++) { circle(X0 + l * LW + LW / 2, HIT, 26, press[l] > 0 ? LC[l] : 'rgba(255,255,255,.08)'); ctx.strokeStyle = LC[l]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X0 + l * LW + LW / 2, HIT, 26, 0, TAU); ctx.stroke(); }
    flashes.forEach(f => { ctx.globalAlpha = f.t * 3; circle(X0 + f.l * LW + LW / 2, HIT, 26 + (.25 - f.t) * 80, LC[f.l]); ctx.globalAlpha = 1; });
    notes.forEach(n => { if (n.hit && !n.missed) return; ctx.globalAlpha = n.missed ? .3 : 1; rr(X0 + n.l * LW + 12, n.y - 14, LW - 24, 28, 10, LC[n.l]); ctx.globalAlpha = 1; });
    text(String(score), W / 2, 22, 22, '#fff'); text(combo > 1 ? combo + ' streak' : '', W / 2, 48, 15, '#ffd75c');
    rr(10, 520, 340, 8, 4, '#232850'); rr(10, 520, 340 * clamp(hp, 0, 100) / 100, 8, 4, hp < 30 ? '#ff5c7a' : '#5cff9a');
    if (msgT > 0) text(msg, W / 2, HIT - 70, 20, msg === 'Miss' ? '#ff7a8a' : '#ffd75c');
    ['←', '↑', '↓', '→'].forEach((s, l) => text(s, X0 + l * LW + LW / 2, HIT + 52, 14, '#6c73a6'));
    if (t < 3) text('Hit each note on the circles', W / 2, 250, 16, '#b9bfe8');
  });
  return { dir: d => tap({ l: 0, u: 1, d: 2, r: 3 }[d]), a: () => tap(1), x: () => tap(0), y: () => tap(3), dbg: () => ({ notes, score, hp, tap, t }) };
}
