/* ---------------- CANNON SHOT ---------------- */
function cannonShot(api, signal, lv){
  const SHOTS = [7, 6, 5][lv], GX = 40;
  let terr = [], tx = 280, wind = 0, ang = 0.9, pow = 55, shots = SHOTS, level = 1, score = 0, proj = null, trail = [], boom = null, msg = '', msgT = 0, over = false, endT = 0, hit = false, charge = 0, charging = false, wait = 0;
  const ground = x => terr[clamp(Math.round(x), 0, W - 1)];
  function build(){
    const ph = Math.random() * 6, amp = 25 + Math.random() * 35 + Math.min(level, 6) * 6, fq = .012 + Math.random() * .012;
    terr = Array.from({ length: W }, (_, x) => 380 - Math.sin(x * fq + ph) * amp - Math.sin(x * fq * 2.3 + ph * 2) * amp * .35);
    tx = 200 + rand(130);
    for (let x = 0; x < W; x++) { if (Math.abs(x - GX) < 22) terr[x] = terr[GX]; if (Math.abs(x - tx) < 20) terr[x] = terr[tx]; }
    wind = Math.round((Math.random() * 2 - 1) * [20, 35, 55][lv] * Math.min(1 + level * .12, 2));
    shots = SHOTS; hit = false;
  }
  build();
  function fire(power){
    if (proj || boom || over || wait > 0) return;
    const sp = 4.4 * (power || pow), by = ground(GX) - 22;
    proj = { x: GX + Math.cos(ang) * 28, y: by - Math.sin(ang) * 28, vx: Math.cos(ang) * sp, vy: -Math.sin(ang) * sp }; trail = []; shots--; beep(200, .12); buzz();
  }
  sling(signal, () => !proj && !boom && !over && wait <= 0, (vx, vy, len) => { ang = clamp(Math.atan2(-vy, vx), .08, 1.5); pow = clamp(len * .6, 15, 100); }, (vx, vy, len) => { if (len > 14) { ang = clamp(Math.atan2(-vy, vx), .08, 1.5); pow = clamp(len * .6, 15, 100); fire(pow); } });
  function explode(x, y){ boom = { x, y, t: .5 }; beep(100, .3); buzz('over');
    const d = Math.hypot(x - tx, y - (ground(tx) - 10));
    if (d < 34) { hit = true; const pts = 100 + shots * 25 + level * 10; score += pts; api.score(score); msg = 'Direct hit! +' + pts; msgT = 1.5; wait = 1.6; }
    else if (shots <= 0) { over = true; endT = 1.2; msg = 'Out of shots'; msgT = 2; }
  }
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt;
    if (!over && !proj && !boom && wait <= 0) {
      ang = clamp(ang - axisY() * .9 * dt, .08, 1.5); pow = clamp(pow + axis() * 30 * dt, 15, 100);
      if (charging) { charge = Math.min(1, charge + dt * .8); pow = 15 + charge * 85; }
    }
    if (wait > 0) { wait -= dt; if (wait <= 0 && hit) { level++; build(); } }
    if (proj) {
      for (let s = 0; s < 3; s++) {
        proj.vy += 520 * dt / 3; proj.vx += wind * 2.2 * dt / 3; proj.x += proj.vx * dt / 3 * 1; proj.y += proj.vy * dt / 3;
        if (proj.x < -40 || proj.x > W + 40 || proj.y > H + 40) { proj = null; if (shots <= 0) { over = true; endT = 1; msg = 'Out of shots'; msgT = 2; } break; }
        if (proj.y >= ground(proj.x) || Math.hypot(proj.x - tx, proj.y - (ground(tx) - 10)) < 14) { const p = proj; proj = null; explode(p.x, p.y); break; }
      }
      if (proj) { trail.push([proj.x, proj.y]); if (trail.length > 40) trail.shift(); }
    }
    if (boom) { boom.t -= dt; if (boom.t <= 0) boom = null; }
    if (over) { endT -= dt; if (endT <= 0) { api.end(score, 'Reached target ' + level); endT = 99; } }
    clear();
    ctx.fillStyle = '#2f6b4a'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x < W; x += 3) ctx.lineTo(x, terr[x]); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d8a5e'; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x < W; x += 3) ctx.lineTo(x, terr[x] + 8); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    const gy = ground(GX) - 12;
    ctx.save(); ctx.translate(GX, gy - 6); ctx.rotate(-ang); rr(0, -6, 34, 12, 4, '#8d94c4'); ctx.restore(); circle(GX, gy, 14, '#5a6199');
    const ty = ground(tx); rr(tx - 18, ty - 22, 36, 22, 5, '#ff5c7a'); rr(tx - 8, ty - 32, 16, 10, 3, '#ff8a9a');
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    if (proj) circle(proj.x, proj.y, 5, '#ffd75c');
    if (boom) { ctx.globalAlpha = boom.t * 2; circle(boom.x, boom.y, 38 * (1 - boom.t), '#ff9a5c'); circle(boom.x, boom.y, 20 * (1 - boom.t), '#ffd75c'); ctx.globalAlpha = 1; }
    text('Target ' + level, 50, 24, 16, '#e8ebff'); text('Shots ' + shots, W - 50, 24, 16, shots <= 1 ? '#ff7a8a' : '#e8ebff');
    text('Wind ' + (wind === 0 ? 'calm' : (wind > 0 ? '→ ' : '← ') + Math.abs(wind)), W / 2, 24, 14, '#8fd8ff');
    text('Angle ' + Math.round(ang * 57.3) + '°   Power ' + Math.round(pow), W / 2, 500, 15, '#b9bfe8');
    rr(40, 515, 280, 8, 4, '#232850'); rr(40, 515, 280 * (pow - 15) / 85, 8, 4, '#ffd75c');
    if (msgT > 0) text(msg, W / 2, 140, 22, '#ffd75c');
    if (level === 1 && shots === SHOTS && !proj) text('Drag back from anywhere to aim, release to fire', W / 2, 70, 13, '#8d94c4');
  });
  return { dir: d => {}, a: () => { if (!charging) { charging = true; charge = 0; } }, aUp: () => { if (charging) { charging = false; fire(pow); charge = 0; } }, dbg: () => ({ shots, level, score, ang, pow, wind, tx, fire }) };
}
