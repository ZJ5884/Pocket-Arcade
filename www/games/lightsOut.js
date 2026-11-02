/* ---------------- LIGHTS OUT ---------------- */
function lightsOut(api, signal, lv){
  const N = [4, 5, 6][lv], cs = Math.floor(300 / N), X0 = (W - N * cs) / 2, Y0 = 130;
  let hist = [], g = [], cx = 0, cy = 0, moves = 0, solved = 0, score = 0, timeLeft = [150, 120, 100][lv], flash = 0, over = false;
  const press = (x, y) => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = x + dx, b = y + dy; if (a >= 0 && a < N && b >= 0 && b < N) g[b * N + a] = !g[b * N + a]; } };
  function fresh(){
    g = Array(N * N).fill(false); moves = 0; hist = [];
    const k = [4, 7, 11][lv] + Math.min(solved, 4);
    for (let i = 0; i < k; i++) press(rand(N), rand(N));
    if (!g.some(Boolean)) press(rand(N), rand(N));
  }
  function tap(x, y){
    if (over) return;
    hist.push([x, y]); press(x, y); moves++; beep(300 + 40 * ((x + y) % 5), .04);
    if (!g.some(Boolean)) { solved++; score += 100 + Math.max(0, 12 - moves) * 5; api.score(score); flash = .6; buzz('win'); beep(880, .15); fresh(); }
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e), x = Math.floor((p.x - X0) / cs), y = Math.floor((p.y - Y0) / cs);
    if (x >= 0 && x < N && y >= 0 && y < N) { cx = x; cy = y; tap(x, y); }
  }, { signal });
  fresh();
  loop(signal, dt => {
    if (!over) { timeLeft -= dt; if (timeLeft <= 0) { over = true; api.end(score, solved + ' puzzle' + (solved === 1 ? '' : 's') + ' solved'); } }
    if (flash > 0) flash -= dt;
    clear();
    text('Turn every light off', W / 2, 40, 18, '#e8ebff');
    text('Time ' + Math.max(0, Math.ceil(timeLeft)), 60, 80, 17, timeLeft < 15 ? '#ff7a8a' : '#b9bfe8');
    text('Moves ' + moves, W - 60, 80, 17, '#b9bfe8');
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const on = g[y * N + x], px = X0 + x * cs + 3, py = Y0 + y * cs + 3;
      rr(px, py, cs - 6, cs - 6, 10, on ? '#ffd75c' : '#252a52');
      if (on) { ctx.globalAlpha = .25; rr(px - 3, py - 3, cs, cs, 13, '#ffd75c'); ctx.globalAlpha = 1; }
      if (padConnected && x === cx && y === cy) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(px - 2, py - 2, cs - 2, cs - 2, 11); ctx.stroke(); }
    }
    if (flash > 0) text('Solved!', W / 2, 470, 30, '#5cff9a');
    text('Tap a light to flip it and its neighbours', W / 2, 515, 13, '#6c73a6');
  });
  return {
    dir: d => { cx = clamp(cx + VEC[d][0], 0, N - 1); cy = clamp(cy + VEC[d][1], 0, N - 1); },
    a: () => tap(cx, cy),
    undo: () => { if (over || !hist.length) return; const [x, y] = hist.pop(); press(x, y); moves = Math.max(0, moves - 1); },
    dbg: () => ({ g, N, solved, press })
  };
}
