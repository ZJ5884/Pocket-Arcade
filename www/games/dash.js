/* ---------------- DASH (endless runner) ---------------- */
function dash(api, signal, lv){
  const GR = 430, PX = 70, PW = 30;
  let y = GR, vy = 0, d = 0, speed = [220, 260, 300][lv], obs = [], gap = 500, score = 0, tt = 0, dead = false, endT = 0, duckHold = false, ended = false;
  const stars = Array.from({ length: 18 }, () => ({ x: rand(W), y: rand(300), s: Math.random() * .5 + .2 }));
  const onGround = () => y >= GR - .01;
  const jump = () => { if (!dead && onGround()) vy = -760; };
  const cut = () => { if (vy < -280) vy = -280; };
  function spawn(){
    if (d > [4000, 2500, 1200][lv] && Math.random() < .28) obs.push({ x: W + 20, w: 34, h: 16, top: GR - 52, kind: 'bird' });
    else {
      const w = 20 + rand(16), h = 30 + rand(32), cnt = Math.random() < .3 ? 2 : 1;
      for (let k = 0; k < cnt; k++) obs.push({ x: W + 20 + k * (w + 4), w, h, top: GR - h, kind: 'cactus' });
      gap += cnt > 1 ? w + 4 : 0;
    }
  }
  canvas.addEventListener('pointerdown', e => { capture(e); if (pt(e).y > 400) duckHold = true; else jump(); }, { signal });
  canvas.addEventListener('pointerup', () => { duckHold = false; cut(); }, { signal });
  loop(signal, dt => {
    if (dead) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, ''); } return; }
    tt += dt; d += speed * dt; speed = Math.min([520, 620, 720][lv], [220, 260, 300][lv] + d / [70, 55, 42][lv]);
    const wantDuck = duckHold || axisY() > .5;
    if (y < GR || vy < 0) { vy += 2200 * dt + (wantDuck ? 3000 * dt : 0); y += vy * dt; if (y >= GR) { y = GR; vy = 0; } }
    const duck = onGround() && wantDuck, ph = duck ? 24 : 44, pw = duck ? 40 : PW;
    gap -= speed * dt;
    if (gap <= 0) { gap = speed * ([1.1, .85, .7][lv] + Math.random() * .9) + 80; spawn(); }
    obs.forEach(o => { o.x -= speed * dt; });
    obs = obs.filter(o => o.x + o.w > -10);
    const bx = PX + 5, bw = pw - 10, by = y - ph + 4, bh = ph - 6;
    for (const o of obs) if (bx < o.x + o.w - 3 && bx + bw > o.x + 3 && by < o.top + o.h - 2 && by + bh > o.top + 2) { dead = true; endT = .7; }
    const s = Math.floor(d / 10); if (s !== score) { score = s; api.score(score); }
    clear();
    stars.forEach(st => { st.x -= speed * st.s * .08 * dt; if (st.x < 0) st.x = W; circle(st.x, st.y, st.s * 2, 'rgba(255,255,255,.5)'); });
    ctx.fillStyle = '#2b2f58'; ctx.fillRect(0, GR, W, H - GR);
    ctx.fillStyle = '#4a5290'; for (let i = 0; i < 8; i++) ctx.fillRect(((i * 60 - d) % 480 + 480) % 480 - 30, GR + 14, 26, 3);
    obs.forEach(o => {
      if (o.kind === 'cactus') { rr(o.x, o.top, o.w, o.h, 6, '#2fd08a'); rr(o.x + 4, o.top + 6, o.w - 8, 4, 2, 'rgba(0,0,0,.2)'); }
      else { const f = Math.sin(tt * 18) > 0; rr(o.x, o.top, o.w, o.h, 8, '#ff7a3c'); rr(o.x + 6, o.top + (f ? -8 : 10), 18, 8, 3, '#ffb27a'); }
    });
    const run = onGround() ? Math.sin(tt * 22) : 0;
    rr(PX, y - ph, pw, ph - 6, 8, '#7dffc4');
    circle(PX + pw - 9, y - ph + 11, 4, '#10132a');
    rr(PX + 4, y - 7, 8, 7 + (run > 0 ? -3 : 0), 3, '#4fd8a0'); rr(PX + pw - 12, y - 7, 8, 7 + (run > 0 ? 0 : -3), 3, '#4fd8a0');
    if (tt < 4) text('Tap = jump  ·  hold near the bottom = duck', W / 2, 150, 14, '#8d94c4');
  });
  return { a: jump, aUp: cut, dir: d2 => { if (d2 === 'u') jump(); } };
}
