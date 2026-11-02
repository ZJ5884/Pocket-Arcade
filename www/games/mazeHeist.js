/* ---------------- MAZE HEIST ---------------- */
function mazeHeist(api, signal, lv){
  const GW = 15, GH = 19, CS = 24, X0 = 0, Y0 = 62;
  let m, gems, power, score = 0, lives = 3, level = 1, fright = 0, msg = '', msgT = 0, over = false, endT = 0, pl, guards = [], flash = 0;
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const open = (x, y) => x >= 0 && x < GW && y >= 0 && y < GH && !m[y * GW + x];
  function build(){
    m = Array(GW * GH).fill(1);
    const seen = new Set(); const st = [[1, 1]]; m[1 * GW + 1] = 0; seen.add('1,1');
    while (st.length) {
      const [x, y] = st[st.length - 1];
      const nb = [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dy]) => [x + dx, y + dy, x + dx / 2, y + dy / 2]).filter(([a, b]) => a > 0 && a < GW - 1 && b > 0 && b < GH - 1 && m[b * GW + a]);
      if (!nb.length) { st.pop(); continue; }
      const [a, b, wx, wy] = nb[rand(nb.length)]; m[wy * GW + wx] = 0; m[b * GW + a] = 0; st.push([a, b]);
    }
    for (let k = 0; k < 18; k++) { const x = 1 + rand(GW - 2), y = 1 + rand(GH - 2); if (m[y * GW + x] && ((open(x - 1, y) && open(x + 1, y)) || (open(x, y - 1) && open(x, y + 1)))) m[y * GW + x] = 0; }
    gems = new Set(); power = new Set();
    for (let i = 0; i < GW * GH; i++) if (!m[i]) gems.add(i);
    for (const [x, y] of [[1, 1], [GW - 2, 1], [1, GH - 2], [GW - 2, GH - 2]]) { power.add(y * GW + x); gems.delete(y * GW + x); }
  }
  const mk = (x, y) => ({ cx: x, cy: y, nx: x, ny: y, t: 0, moving: false, dir: [0, 0], want: null, hx: x, hy: y, eaten: 0 });
  function reset(){
    pl = mk(7, GH - 2); gems.delete(pl.cy * GW + pl.cx);
    guards = []; const n = [2, 3, 3][lv] + (level > 2 ? 1 : 0);
    const spots = [[1, 1], [GW - 2, 1], [7, 1], [1, 9]];
    for (let i = 0; i < Math.min(n, 4); i++) { const [x, y] = spots[i]; const gd = mk(x, y); gd.hx = x; gd.hy = y; gd.col = ['#ff5c7a', '#b36bff', '#5cc8ff', '#ff9a5c'][i]; gd.delay = i * 1.2 + 1; guards.push(gd); }
    fright = 0;
  }
  function advance(a, dt, sp, pick){
    let d = sp * dt;
    while (d > 1e-6) {
      if (!a.moving) { const dir = pick(a); if (!dir) break; a.dir = dir; a.nx = a.cx + dir[0]; a.ny = a.cy + dir[1]; a.t = 0; a.moving = true; }
      const need = 1 - a.t;
      if (d >= need) { d -= need; a.cx = a.nx; a.cy = a.ny; a.t = 0; a.moving = false; if (a.arrive) a.arrive(a); } else { a.t += d; d = 0; }
    }
  }
  const pos = a => [a.cx + (a.nx - a.cx) * a.t, a.cy + (a.ny - a.cy) * a.t];
  function pickPlayer(a){
    if (a.want && open(a.cx + a.want[0], a.cy + a.want[1])) return a.want;
    if (a.dir && (a.dir[0] || a.dir[1]) && open(a.cx + a.dir[0], a.cy + a.dir[1])) return a.dir;
    return null;
  }
  function pickGuard(a){
    const opts = DIRS.filter(d => open(a.cx + d[0], a.cy + d[1]));
    if (!opts.length) return null;
    let c = opts.filter(d => !(d[0] === -a.dir[0] && d[1] === -a.dir[1]));
    if (!c.length) c = opts;
    const [px, py] = pos(pl), chase = [.45, .65, .85][lv];
    if (fright > 0) { c.sort((p, q) => Math.hypot(a.cx + q[0] - px, a.cy + q[1] - py) - Math.hypot(a.cx + p[0] - px, a.cy + p[1] - py)); return Math.random() < .7 ? c[0] : c[rand(c.length)]; }
    if (Math.random() < chase) { c.sort((p, q) => Math.hypot(a.cx + p[0] - px, a.cy + p[1] - py) - Math.hypot(a.cx + q[0] - px, a.cy + q[1] - py)); return c[0]; }
    return c[rand(c.length)];
  }
  function eat(){
    const i = pl.cy * GW + pl.cx;
    if (gems.delete(i)) { score += 10; api.score(score); beep(700 + (score % 5) * 40, .02); }
    if (power.delete(i)) { score += 50; api.score(score); fright = 7; beep(300, .15); buzz('win'); }
    if (!gems.size && !power.size) { level++; score += 300; api.score(score); msg = 'Level ' + level; msgT = 1.4; build(); reset(); }
  }
  pl = null; build(); reset();
  pl.arrive = eat;
  function dirTo(d){ pl.want = VEC[d]; if (pl.moving && pl.dir[0] === -pl.want[0] && pl.dir[1] === -pl.want[1]) { const ox = pl.cx, oy = pl.cy; pl.cx = pl.nx; pl.cy = pl.ny; pl.nx = ox; pl.ny = oy; pl.t = 1 - pl.t; pl.dir = pl.want; } }
  swipe(signal, dirTo);
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt; if (flash > 0) flash -= dt;
    if (!over) {
      advance(pl, dt, 6.2, pickPlayer);
      if (fright > 0) fright -= dt;
      const gsp = [3.6, 4.4, 5.1][lv] + level * .12;
      for (const gd of guards) {
        if (gd.delay > 0) { gd.delay -= dt; continue; }
        advance(gd, dt, fright > 0 ? gsp * .6 : gsp, pickGuard);
        const [gx, gy] = pos(gd), [px, py] = pos(pl);
        if (Math.hypot(gx - px, gy - py) < .6) {
          if (fright > 0) { score += 200; api.score(score); beep(900, .1); gd.cx = gd.nx = gd.hx; gd.cy = gd.ny = gd.hy; gd.t = 0; gd.moving = false; gd.delay = 2; }
          else { lives--; flash = .5; buzz('over'); beep(120, .3); if (lives <= 0) { over = true; endT = .8; } else reset(); break; }
        }
      }
    } else { endT -= dt; if (endT <= 0) { api.end(score, 'Reached level ' + level); endT = 99; } }
    clear();
    text('♥'.repeat(Math.max(0, lives)), 50, 20, 18, '#ff6b8a'); text('Level ' + level, W / 2, 20, 16, '#e8ebff'); text(String(score), W - 40, 20, 16, '#b9bfe8');
    text('Grab every gem. Power cells scare the guards.', W / 2, 46, 12, '#6c73a6');
    for (let i = 0; i < GW * GH; i++) {
      const x = X0 + (i % GW) * CS, y = Y0 + ((i / GW) | 0) * CS;
      if (m[i]) { rr(x + 1, y + 1, CS - 2, CS - 2, 5, '#2b3a9a'); }
      else if (gems.has(i)) { ctx.fillStyle = '#ffd75c'; ctx.beginPath(); ctx.moveTo(x + CS / 2, y + CS / 2 - 4); ctx.lineTo(x + CS / 2 + 3, y + CS / 2); ctx.lineTo(x + CS / 2, y + CS / 2 + 4); ctx.lineTo(x + CS / 2 - 3, y + CS / 2); ctx.closePath(); ctx.fill(); }
      else if (power.has(i)) circle(x + CS / 2, y + CS / 2, 7 + Math.sin(performance.now() / 150) * 1.5, '#5cff9a');
    }
    for (const gd of guards) {
      const [gx, gy] = pos(gd), px2 = X0 + gx * CS + CS / 2, py2 = Y0 + gy * CS + CS / 2;
      ctx.globalAlpha = gd.delay > 0 ? .4 : 1;
      rr(px2 - 9, py2 - 9, 18, 18, 6, fright > 0 ? (fright < 2 && Math.floor(fright * 5) % 2 ? '#fff' : '#4a6cff') : gd.col);
      circle(px2 - 3.5, py2 - 2, 2.5, '#fff'); circle(px2 + 3.5, py2 - 2, 2.5, '#fff'); ctx.globalAlpha = 1;
    }
    const [px, py] = pos(pl), sx = X0 + px * CS + CS / 2, sy = Y0 + py * CS + CS / 2;
    if (!over) { rr(sx - 8, sy - 8, 16, 16, 4, '#5cff9a'); rr(sx - 8, sy - 3, 16, 5, 2, '#10132a'); }
    if (msgT > 0) text(msg, W / 2, 30, 18, '#ffd75c');
    if (flash > 0) { ctx.fillStyle = 'rgba(255,92,122,' + flash * .5 + ')'; ctx.fillRect(0, 0, W, H); }
  });
  return { dir: dirTo, dbg: () => ({ m, gems, guards, pl, score, lives }) };
}
