/* ---------------- FLAP ---------------- */
function flap(api, signal, lv){
  const bx = 90, br = 14, gap = [185, 150, 125][lv], pw = 54, ground = H - 40;
  let y = 250, vy = 0, pipes = [], t = 1.2, score = 0, started = false, dead = false;
  const tap = () => { if (dead) return; started = true; vy = -380; };
  canvas.addEventListener('pointerdown', tap, { signal });
  function die(){ dead = true; api.end(score); }
  loop(signal, (dt, now) => {
    if (dead) return;
    if (!started) y = 250 + Math.sin(now / 200) * 6;
    else {
      vy += 1300 * dt; y += vy * dt; t += dt;
      if (t > [1.7, 1.5, 1.35][lv]) { t = 0; pipes.push({ x: W, top: 60 + rand(420 - gap), passed: false }); }
      pipes.forEach(p => p.x -= [120, 140, 165][lv] * dt);
      pipes = pipes.filter(p => p.x > -pw);
      if (y - br < 0 || y + br > ground) return die();
      for (const p of pipes) {
        if (bx + br > p.x && bx - br < p.x + pw && (y - br < p.top || y + br > p.top + gap)) return die();
        if (!p.passed && p.x + pw < bx) { p.passed = true; score++; api.score(score); }
      }
    }
    clear();
    pipes.forEach(p => { rr(p.x, -10, pw, p.top + 10, 6, '#2fd08a'); rr(p.x, p.top + gap, pw, ground - p.top - gap + 10, 6, '#2fd08a'); });
    ctx.fillStyle = '#3a3f6e'; ctx.fillRect(0, ground, W, 40);
    circle(bx, y, br, '#ffd75c');
    circle(bx + 5, y - 4, 3, '#222');
    if (!started) text('Press A or tap to flap', W/2, 380, 20, '#b9bfe8');
  });
  return { a: tap };
}
