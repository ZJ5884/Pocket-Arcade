/* ---------------- ARCHERY ---------------- */
function archery(api, signal, lv){
  const CX = 180, CY = 205, RING = 11, TOTAL = 10;
  const ringColor = ['', '#f4f4f4', '#f4f4f4', '#222', '#222', '#2a82b8', '#2a82b8', '#e04040', '#e04040', '#ffd75c', '#ffd75c'];
  let score = 0, shots = 0, hits = [], wind = 0, windY = 0, cooldown = 0, label = '', labelT = 0, bulls = 0, dead = false, endT = 0;
  function newWind(){ wind = Math.round((Math.random() * 6 - 3) * [.4, 1, 1.6][lv] * 2) / 2; windY = (Math.random() * 6 - 3) * [.3, 1, 1.5][lv]; }
  newWind();
  function fire(){
    if (dead || cooldown > 0 || shots >= TOTAL) return;
    const jt = [2, 4, 6][lv], gx = aim.x + aim.sx + wind * 9 + (Math.random() - .5) * jt, gy = aim.y + aim.sy + windY + (Math.random() - .5) * jt;
    const d = Math.hypot(gx - CX, gy - CY), pts = d < RING * 10 ? 10 - Math.floor(d / RING) : 0;
    score += pts; if (pts === 10) bulls++;
    hits.push({ x: gx, y: gy }); shots++;
    label = pts ? '+' + pts : 'Miss'; labelT = 1; cooldown = .7;
    api.score(score); newWind();
    if (shots >= TOTAL) endT = .9;
  }
  const aim = makeAimer(signal, { x: CX, y: CY, x0: 40, x1: 320, y0: 70, y1: 400, speed: 110, sway: [3, 7, 11][lv], fire: [120, 462, 120, 50], onFire: fire });
  loop(signal, (dt, now) => {
    if (dead) return;
    aim.step(dt, now);
    if (cooldown > 0) cooldown -= dt;
    if (labelT > 0) labelT -= dt;
    if (endT > 0) { endT -= dt; if (endT <= 0) { dead = true; api.end(score, 'Bullseyes: ' + bulls); return; } }
    clear();
    for (let i = 10; i >= 1; i--) circle(CX, CY, RING * i, ringColor[11 - i]);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
    for (let i = 1; i <= 10; i++) { ctx.beginPath(); ctx.arc(CX, CY, RING * i, 0, TAU); ctx.stroke(); }
    hits.forEach((h, i) => { circle(h.x, h.y, i === hits.length - 1 && labelT > 0 ? 5 : 3.5, '#111'); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h.x, h.y, 3.5, 0, TAU); ctx.stroke(); });
    crosshair(aim.x + aim.sx, aim.y + aim.sy, '#ff3b5c');
    text('Arrows left: ' + (TOTAL - shots), 80, 24, 15, '#e8ebff');
    const wx = 285, wl = wind * 14;
    ctx.strokeStyle = '#6fe3a7'; ctx.fillStyle = '#6fe3a7'; ctx.lineWidth = 3;
    if (Math.abs(wl) > 1) {
      ctx.beginPath(); ctx.moveTo(wx - wl / 2, 24); ctx.lineTo(wx + wl / 2, 24); ctx.stroke();
      const dir = Math.sign(wl), tx = wx + wl / 2;
      ctx.beginPath(); ctx.moveTo(tx, 24); ctx.lineTo(tx - dir * 9, 18); ctx.lineTo(tx - dir * 9, 30); ctx.fill();
    }
    text('Wind ' + Math.abs(wind).toFixed(1), wx, 46, 12, '#6fe3a7');
    text('Aim against the wind', W/2, 436, 13, '#8d94c4');
    button(120, 462, 120, 50, 'FIRE', cooldown > 0 ? '#2c3263' : '#d9435f');
    if (labelT > 0) text(label, W/2, 82, 30, '#ffd75c');
  });
  return { a: fire };
}
