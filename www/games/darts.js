/* ---------------- DARTS ---------------- */
function darts(api, signal, lv){
  const CX = 180, CY = 215, R = 140, TOTAL = 15;
  const ORDER = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  let score = 0, thrown = 0, marks = [], cooldown = 0, label = '', labelT = 0, dead = false, endT = 0;
  function scoreAt(x, y){
    const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy);
    if (d > R) return { pts: 0, label: 'Miss' };
    if (d < 5.2) return { pts: 50, label: 'Bullseye!' };
    if (d < 13.1) return { pts: 25, label: 'Bull 25' };
    let ang = Math.atan2(dx, -dy); ang = (ang + Math.PI / 20 + TAU) % TAU;
    const n = ORDER[Math.floor(ang / (Math.PI / 10)) % 20];
    if (d >= 133.4) return { pts: n * 2, label: 'Double ' + n };
    if (d >= 81.5 && d < 88.1) return { pts: n * 3, label: 'Treble ' + n };
    return { pts: n, label: '' + n };
  }
  function fire(){
    if (dead || cooldown > 0 || thrown >= TOTAL) return;
    const jt = [2, 3, 6][lv], gx = aim.x + aim.sx + (Math.random() - .5) * jt, gy = aim.y + aim.sy + (Math.random() - .5) * jt;
    const r = scoreAt(gx, gy);
    score += r.pts; thrown++; marks.push({ x: gx, y: gy });
    label = r.label + (r.pts && r.label !== String(r.pts) && !/Bull/.test(r.label) ? '  +' + r.pts : ''); labelT = 1.1; cooldown = .5;
    api.score(score);
    if (thrown >= TOTAL) endT = .9;
  }
  const aim = makeAimer(signal, { x: CX, y: CY, x0: 30, x1: 330, y0: 70, y1: 360, speed: 120, sway: [4, 8, 13][lv], fire: [120, 462, 120, 50], onFire: fire });
  function band(i, r1, r2, color){
    const c = -Math.PI / 2 + i * Math.PI / 10;
    ctx.beginPath(); ctx.arc(CX, CY, (r1 + r2) / 2, c - Math.PI / 20, c + Math.PI / 20);
    ctx.lineWidth = r2 - r1 + .6; ctx.strokeStyle = color; ctx.stroke();
  }
  loop(signal, (dt, now) => {
    if (dead) return;
    aim.step(dt, now);
    if (cooldown > 0) cooldown -= dt;
    if (labelT > 0) labelT -= dt;
    if (endT > 0) { endT -= dt; if (endT <= 0) { dead = true; api.end(score, 'Darts thrown: ' + thrown); return; } }
    clear();
    circle(CX, CY, R + 10, '#0d0f1c');
    for (let i = 0; i < 20; i++) {
      const dark = i % 2 === 0;
      band(i, 13.1, 81.5, dark ? '#1a1a1a' : '#eadfc0');
      band(i, 81.5, 88.1, dark ? '#d83a3a' : '#2f9e5b');
      band(i, 88.1, 133.4, dark ? '#1a1a1a' : '#eadfc0');
      band(i, 133.4, R, dark ? '#d83a3a' : '#2f9e5b');
      const c = -Math.PI / 2 + i * Math.PI / 10;
      text(ORDER[i], CX + Math.cos(c) * (R + 20), CY + Math.sin(c) * (R + 20), 12, '#8d94c4');
    }
    circle(CX, CY, 13.1, '#2f9e5b'); circle(CX, CY, 5.2, '#d83a3a');
    marks.forEach(m => { circle(m.x, m.y, 3, '#fff'); circle(m.x, m.y, 1.6, '#111'); });
    crosshair(aim.x + aim.sx, aim.y + aim.sy, '#ffd75c');
    text('Darts left: ' + (TOTAL - thrown), 80, 24, 15, '#e8ebff');
    text('Total ' + score, W - 60, 24, 15, '#e8ebff');
    button(120, 462, 120, 50, 'THROW', cooldown > 0 ? '#2c3263' : '#2f9e5b');
    if (labelT > 0) text(label, W/2, 410, 24, '#ffd75c');
  });
  return { a: fire };
}
