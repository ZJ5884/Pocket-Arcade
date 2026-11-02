/* ---------------- BREAKOUT ---------------- */
function breakout(api, signal, lv){
  const cols = 8, bw = 40, bh = 18, ox = 20, oy = 70, py = 500, br = 6, pw0 = [104, 76, 56][lv];
  const rowColors = ['#ff5c7a','#ff9a5c','#ffd75c','#5cff9a','#5cc8ff','#9a7cff'];
  let px = W/2, lives = [5, 3, 2][lv], score = 0, level = 1, launched = false, balls = [], bricks = [], drops = [], dead = false, wideT = 0, slowT = 0, stickT = 0;
  const pw = () => wideT > 0 ? pw0 * 1.6 : pw0;
  const clampP = v => clamp(v, pw()/2, W - pw()/2);
  const speed = () => ([240, 300, 360][lv] + level * 30) * (slowT > 0 ? .7 : 1);
  function build(){ bricks = []; for (let r = 0; r < 6; r++) for (let c = 0; c < cols; c++) bricks.push({ x: ox + c * bw, y: oy + r * (bh + 4), r, alive: true }); }
  function reset(){ launched = false; balls = [{ x: px, y: py - br, vx: 0, vy: 0 }]; }
  function launch(){
    if (launched || dead) return;
    launched = true;
    const a = -Math.PI/2 + (Math.random() - .5) * .6, sp = speed();
    balls[0].vx = Math.cos(a) * sp; balls[0].vy = Math.sin(a) * sp;
  }
  build(); reset();
  canvas.addEventListener('pointermove', e => { px = clampP(pt(e).x); }, { signal });
  canvas.addEventListener('pointerdown', e => { px = clampP(pt(e).x); launch(); }, { signal });
  function dropPU(b){
    if (Math.random() > .14) return;
    drops.push({ x: b.x + bw / 2, y: b.y, k: ['wide', 'multi', 'slow', 'life'][rand(4)] });
  }
  function grab(k){
    beep(900, .1); buzz('win');
    if (k === 'wide') wideT = 12;
    else if (k === 'slow') slowT = 10;
    else if (k === 'life') lives = Math.min(7, lives + 1);
    else if (k === 'multi' && launched) {
      const src = balls[0]; if (!src) return; const sp = Math.hypot(src.vx, src.vy) || speed();
      for (const off of [-.5, .5]) { const a = Math.atan2(src.vy, src.vx) + off; balls.push({ x: src.x, y: src.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); }
    }
  }
  loop(signal, dt => {
    if (dead) return;
    if (wideT > 0) wideT -= dt; if (slowT > 0) slowT -= dt;
    px = clampP(px + axis() * 460 * dt);
    if (!launched) { balls[0].x = px; balls[0].y = py - br; }
    else {
      for (const ba of balls) {
        ba.x += ba.vx * dt; ba.y += ba.vy * dt;
        if (ba.x < br) { ba.x = br; ba.vx = Math.abs(ba.vx); }
        if (ba.x > W - br) { ba.x = W - br; ba.vx = -Math.abs(ba.vx); }
        if (ba.y < br) { ba.y = br; ba.vy = Math.abs(ba.vy); }
        if (ba.vy > 0 && ba.y + br >= py && ba.y + br <= py + 14 && Math.abs(ba.x - px) < pw()/2 + br) {
          const sp = Math.hypot(ba.vx, ba.vy) * 1.01, a = (ba.x - px) / (pw()/2);
          ba.vx = sp * Math.sin(a); ba.vy = -sp * Math.cos(a); ba.y = py - br;
        }
        for (const b of bricks) {
          if (!b.alive) continue;
          if (ba.x + br > b.x && ba.x - br < b.x + bw && ba.y + br > b.y && ba.y - br < b.y + bh) {
            b.alive = false; score += 10; api.score(score); dropPU(b);
            const o1 = Math.min(ba.x + br - b.x, b.x + bw - (ba.x - br)), o2 = Math.min(ba.y + br - b.y, b.y + bh - (ba.y - br));
            if (o1 < o2) ba.vx = -ba.vx; else ba.vy = -ba.vy;
            break;
          }
        }
      }
      /* slow-ball power: keep the speed capped while it lasts */
      if (slowT > 0) for (const ba of balls) { const sp = Math.hypot(ba.vx, ba.vy), cap = speed() * 1.1; if (sp > cap) { ba.vx *= cap / sp; ba.vy *= cap / sp; } }
      balls = balls.filter(ba => ba.y <= H + 10);
      if (!balls.length) {
        lives--; wideT = 0; slowT = 0; drops = [];
        if (lives <= 0) { dead = true; api.end(score); } else reset();
      }
      if (bricks.every(b => !b.alive)) { level++; build(); drops = []; reset(); }
    }
    drops.forEach(d => d.y += 110 * dt);
    drops = drops.filter(d => { if (d.y > py - 6 && d.y < py + 16 && Math.abs(d.x - px) < pw()/2 + 10) { grab(d.k); return false; } return d.y < H + 20; });
    clear();
    bricks.forEach(b => b.alive && rr(b.x + 1, b.y, bw - 2, bh, 4, rowColors[b.r]));
    drops.forEach(d => { const c = { wide: '#5cc8ff', multi: '#ff9a5c', slow: '#b36bff', life: '#ff6b8a' }[d.k]; rr(d.x - 13, d.y - 9, 26, 18, 9, c); text({ wide: 'W', multi: '3', slow: 'S', life: '♥' }[d.k], d.x, d.y + 1, 12, '#10132a'); });
    rr(px - pw()/2, py, pw(), 12, 6, wideT > 0 ? '#5cc8ff' : '#e8ebff');
    balls.forEach(ba => circle(ba.x, ba.y, br, '#fff'));
    text('Lives: ' + lives + '   Level ' + level, W/2, 30, 16, '#8d94c4');
    if (wideT > 0) text('Wide ' + Math.ceil(wideT), 40, 530, 12, '#5cc8ff'); if (slowT > 0) text('Slow ' + Math.ceil(slowT), W - 40, 530, 12, '#b36bff');
    if (!launched) text('Press A or tap to launch', W/2, 380, 18, '#b9bfe8');
  });
  return { a: launch, dbg: () => ({ balls, drops, lives, score }) };
}
