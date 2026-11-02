/* ---------------- STACK ---------------- */
function stack(api, signal, lv){
  const LH = 24, BASE = 480;
  let layers = [{ x: 90, w: 180 }], mv = { x: 0, w: 180, dir: 1 }, score = 0, combo = 0, cam = 0, deb = [], dead = false, endT = 0, flash = 0, ended = false;
  const spd = () => Math.min([330, 430, 520][lv], [100, 130, 160][lv] + layers.length * [5, 7, 9][lv]);
  function nextBlock(){
    const w = layers[layers.length - 1].w, left = layers.length % 2 === 0;
    mv = { x: left ? 0 : W - w, w, dir: left ? 1 : -1 };
  }
  function drop(){
    if (dead) return;
    const top = layers[layers.length - 1], i = layers.length;
    const left = Math.max(mv.x, top.x), right = Math.min(mv.x + mv.w, top.x + top.w), ow = right - left;
    if (ow <= 0) { deb.push({ x: mv.x, w: mv.w, i, dy: 0, vy: 0 }); dead = true; endT = 1; return; }
    if (Math.abs(mv.x - top.x) < [9, 5, 3][lv]) { layers.push({ x: top.x, w: top.w }); combo++; flash = .6; score += 1 + combo; }
    else {
      if (mv.x < top.x) deb.push({ x: mv.x, w: top.x - mv.x, i, dy: 0, vy: 0 });
      else if (mv.x + mv.w > top.x + top.w) deb.push({ x: top.x + top.w, w: mv.x + mv.w - (top.x + top.w), i, dy: 0, vy: 0 });
      layers.push({ x: left, w: ow }); combo = 0; score += 1;
    }
    api.score(score); nextBlock();
  }
  canvas.addEventListener('pointerdown', drop, { signal });
  const sy = i => BASE - i * LH + cam;
  const colorOf = i => 'hsl(' + ((i * 14 + 200) % 360) + ',65%,58%)';
  loop(signal, dt => {
    if (!dead) {
      mv.x += mv.dir * spd() * dt;
      if (mv.x < 0) { mv.x = 0; mv.dir = 1; } else if (mv.x + mv.w > W) { mv.x = W - mv.w; mv.dir = -1; }
    } else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Height ' + (layers.length - 1)); } }
    cam += (Math.max(0, layers.length - 9) * LH - cam) * Math.min(1, dt * 5);
    if (flash > 0) flash -= dt;
    deb.forEach(d => { d.vy += 1500 * dt; d.dy += d.vy * dt; });
    deb = deb.filter(d => d.dy < 700);
    clear();
    layers.forEach((l, i) => rr(l.x, sy(i), l.w, LH - 2, 4, colorOf(i)));
    deb.forEach(d => rr(d.x, sy(d.i) + d.dy, d.w, LH - 2, 4, colorOf(d.i)));
    if (!dead) rr(mv.x, sy(layers.length), mv.w, LH - 2, 4, colorOf(layers.length));
    text(score, W / 2, 50, 44, 'rgba(255,255,255,.85)');
    if (flash > 0) text('PERFECT' + (combo > 1 ? ' x' + combo : ''), W / 2, 100, 22, '#ffd75c');
    if (layers.length === 1 && !dead) text('Press A or tap to drop', W / 2, 520, 16, '#8d94c4');
  });
  return { a: drop };
}
