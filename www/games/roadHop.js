/* ---------------- ROAD HOP ---------------- */
function roadHop(api, signal, lv){
  const CW = 40, COLS = 9;
  const lanes = [];
  function mkLane(r){
    if (r < 2 || Math.random() > .72) {
      const trees = []; if (r >= 2) for (let c = 0; c < COLS; c++) if (Math.random() < .2) trees.push(c);
      return { t: 'grass', trees, cars: [] };
    }
    const dir = Math.random() < .5 ? -1 : 1, sp = (42 + Math.random() * 55) * [.75, 1, 1.3][lv] * (1 + Math.min(r, 90) / 130);
    const cars = []; let x = Math.random() * 80;
    const gap = [150, 125, 105][lv] + Math.random() * 90;
    while (x < W + 160) { const len = Math.random() < .3 ? 2 : 1; cars.push({ x, w: len * CW - 8, c: ['#ff5c7a', '#ffb347', '#5cb8ff', '#b36bff', '#5cff9a'][rand(5)] }); x += len * CW + gap * (.8 + Math.random() * .6); }
    return { t: 'road', dir, sp, cars, L: Math.max(W + 160, x) };
  }
  const GRASS = { t: 'grass', trees: [], cars: [] };
  const lane = r => r < 0 ? GRASS : lanes[r] || (() => { while (lanes.length <= r) lanes.push(mkLane(lanes.length)); return lanes[r]; })();
  let pc = 4, pr = 0, tr = 0, tc = 4, cam = 0, started = false, dead = false, best = 0, endT = 0, squash = 0;
  const auto = [.1, .17, .26][lv];
  function step(d){
    if (dead) return;
    let nc = tc, nr = tr;
    if (d === 'l') nc--; else if (d === 'r') nc++; else if (d === 'u') nr++; else nr--;
    if (nc < 0 || nc >= COLS || nr < 0 || nr < Math.floor(cam) - 1) return;
    const L = lane(nr); if (L.t === 'grass' && L.trees.includes(nc)) return;
    tc = nc; tr = nr; started = true; beep(400 + Math.min(nr, 40) * 8, .03);
    if (tr > best) { best = tr; api.score(best); }
  }
  let sx = 0, sy = 0;
  canvas.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; }, { signal });
  canvas.addEventListener('pointerup', e => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) step('u'); else step(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
  }, { signal });
  function die(){ dead = true; endT = .7; buzz('over'); beep(110, .3); }
  loop(signal, dt => {
    pc += (tc - pc) * Math.min(1, dt * 20); pr += (tr - pr) * Math.min(1, dt * 20);
    if (!dead) {
      if (started) cam += auto * dt * (1 + best / 60);
      cam = Math.max(cam, pr - 4);
      for (let r = Math.floor(cam) - 1; r < cam + 15; r++) { const L = lane(r); if (L.t === 'road') L.cars.forEach(c => { c.x += L.dir * L.sp * dt; if (L.dir > 0 && c.x > W + 60) c.x -= L.L; if (L.dir < 0 && c.x < -60 - c.w) c.x += L.L; }); }
      if (pr < cam - .7) die();
      const L = lane(tr);
      if (L.t === 'road' && Math.abs(pr - tr) < .5) {
        const px = pc * CW + CW / 2;
        for (const c of L.cars) if (px + 11 > c.x && px - 11 < c.x + c.w) { die(); break; }
      }
    } else { endT -= dt; if (endT <= 0) { api.end(best, ''); endT = 99; } }
    clear();
    const sy0 = r => H - 70 - (r - cam) * CW;
    for (let r = Math.floor(cam) - 2; r < cam + 15; r++) {
      const L = lane(r), y = sy0(r);
      ctx.fillStyle = L.t === 'road' ? '#2a2d4a' : (r % 2 ? '#23603f' : '#276b45'); ctx.fillRect(0, y - CW / 2, W, CW);
      if (L.t === 'road') { ctx.fillStyle = '#3d4170'; for (let x = 0; x < W; x += 36) ctx.fillRect(x, y + CW / 2 - 2, 18, 2); }
      else L.trees.forEach(c => { circle(c * CW + CW / 2, y, 15, '#164d30'); circle(c * CW + CW / 2, y - 4, 11, '#1f7a49'); });
      if (L.t === 'road') L.cars.forEach(c => { rr(c.x, y - 14, c.w, 28, 7, c.c); ctx.fillStyle = 'rgba(0,0,0,.28)'; const wx = L.dir > 0 ? c.x + c.w - 14 : c.x + 3; ctx.fillRect(wx, y - 10, 11, 20); });
    }
    const px = pc * CW + CW / 2, py = sy0(pr), hop = Math.abs(pr - tr) + Math.abs(pc - tc) > .1 ? 5 : 0;
    if (!dead) { rr(px - 12, py - 12 - hop, 24, 24, 7, '#ffd75c'); circle(px - 5, py - 14 - hop, 3, '#222'); circle(px + 5, py - 14 - hop, 3, '#222'); rr(px - 4, py - 8 - hop, 8, 5, 2, '#ff7a5c'); }
    else rr(px - 15, py - 4, 30, 8, 4, '#ffd75c');
    if (!started) text('Swipe or use the D-pad to hop', W / 2, 500, 15, '#d8dcf5');
  });
  return { dir: step, a: () => step('u'), dbg: () => ({ pr, tr, best, dead }) };
}
