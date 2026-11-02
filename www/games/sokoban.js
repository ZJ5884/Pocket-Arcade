/* ---------------- SOKOBAN ---------------- */
function sokoban(api, signal, lv){
  const LEVELS_S = ["######\n#@ $.#\n######", "#######\n#     #\n# .$@ #\n#     #\n#######", "####\n# .#\n#  ###\n#*@  #\n#  $ #\n#  ###\n####", "######\n#    #\n# #@ #\n# $* #\n# .* #\n#    #\n######", "  ####\n###  ####\n#     $ #\n# #  #$ #\n# . .#@ #\n#########", "########\n#      #\n# .**$@#\n#      #\n#####  #\n    ####", "########\n#  #   #\n# $  $ #\n# . @. #\n#  #   #\n########", "#######\n#     #\n# .$. #\n#  $  #\n# .$@ #\n#     #\n#######"];
  let li = [0, 2, 4][lv], score = 0, moves = 0, grid, boxes, goals, px, py, w, h, hist = [], done = false, endT = 0, cs = 40, ox = 0, oy = 0, finished = false;
  function load(){
    const rows = LEVELS_S[li].split('\n'); h = rows.length; w = Math.max(...rows.map(r => r.length));
    grid = []; boxes = new Set(); goals = new Set(); hist = []; moves = 0;
    rows.forEach((r, y) => { grid[y] = []; for (let x = 0; x < w; x++) { const c = r[x] || ' '; grid[y][x] = c === '#' ? 1 : 0; if ('.*+'.includes(c)) goals.add(x + ',' + y); if ('$*'.includes(c)) boxes.add(x + ',' + y); if ('@+'.includes(c)) { px = x; py = y; } } });
    /* only cells the player can reach are floor */
    const seen = new Set([px + ',' + py]), q = [[px, py]];
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h || grid[ny][nx] === 1 || seen.has(nx + ',' + ny)) continue; seen.add(nx + ',' + ny); q.push([nx, ny]); } }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (grid[y][x] === 0 && !seen.has(x + ',' + y)) grid[y][x] = 2;
    cs = Math.floor(Math.min(330 / w, 400 / h, 56)); ox = (W - cs * w) / 2; oy = 80 + (400 - cs * h) / 2;
    done = false;
  }
  load();
  function move(dx, dy){
    if (done) return;
    const nx = px + dx, ny = py + dy;
    if (nx < 0 || ny < 0 || nx >= w || ny >= h || grid[ny][nx] !== 0) return;
    const k = nx + ',' + ny; let pushed = null;
    if (boxes.has(k)) {
      const bx = nx + dx, by = ny + dy, bk = bx + ',' + by;
      if (bx < 0 || by < 0 || bx >= w || by >= h || grid[by][bx] !== 0 || boxes.has(bk)) { beep(120, .05); return; }
      boxes.delete(k); boxes.add(bk); pushed = [k, bk]; beep(260, .05);
    } else beep(420, .02);
    hist.push([px, py, pushed]); px = nx; py = ny; moves++;
    if ([...boxes].every(b => goals.has(b))) {
      done = true; endT = 1.2; const pts = Math.max(60, 400 - moves * 2 + (lv * 40)); score += pts; api.score(score); buzz('win'); beep(880, .2);
    }
  }
  function undo(){
    if (done || !hist.length) return;
    const [x, y, p] = hist.pop(); px = x; py = y; moves--;
    if (p) { boxes.delete(p[1]); boxes.add(p[0]); }
  }
  swipe(signal, d => move(VEC[d][0], VEC[d][1]));
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (inRect(p, [W - 100, 10, 90, 34])) undo(); else if (inRect(p, [W - 200, 10, 90, 34])) { if (!done) load(); }
  }, { signal });
  loop(signal, dt => {
    if (done) { endT -= dt; if (endT <= 0) { if (li + 1 >= LEVELS_S.length) { api.end(score, 'All ' + LEVELS_S.length + ' levels cleared'); endT = 99; } else { li++; load(); } } }
    clear();
    text('Level ' + (li + 1) + '/' + LEVELS_S.length, 14, 26, 15, '#b9bfe8', 'left'); text('Moves ' + moves, 14, 50, 14, '#8d94c4', 'left');
    button(W - 200, 10, 90, 34, 'Reset', '#3b4380'); button(W - 100, 10, 90, 34, 'Undo', '#3b4380');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = grid[y][x]; if (c === 2) continue;
      const X = ox + x * cs, Y = oy + y * cs;
      if (c === 1) { rr(X, Y, cs, cs, 4, '#3a4178'); rr(X + 2, Y + 2, cs - 4, cs / 2 - 2, 3, '#4a5290'); }
      else { rr(X + 1, Y + 1, cs - 2, cs - 2, 3, '#1f2547'); if (goals.has(x + ',' + y)) circle(X + cs / 2, Y + cs / 2, cs * .16, '#ffd75c'); }
    }
    boxes.forEach(k => { const [x, y] = k.split(',').map(Number), on = goals.has(k); rr(ox + x * cs + 4, oy + y * cs + 4, cs - 8, cs - 8, 6, on ? '#5cff9a' : '#ff9a5c'); rr(ox + x * cs + 9, oy + y * cs + 9, cs - 18, cs - 18, 4, on ? '#3bd37a' : '#d97a3c'); });
    circle(ox + px * cs + cs / 2, oy + py * cs + cs / 2, cs * .34, '#5cc8ff'); circle(ox + px * cs + cs / 2 - 4, oy + py * cs + cs / 2 - 3, 3, '#0b1020'); circle(ox + px * cs + cs / 2 + 4, oy + py * cs + cs / 2 - 3, 3, '#0b1020');
    text('Push every crate onto a dot', W / 2, 515, 14, '#6c73a6');
    if (done) text('Level clear!', W / 2, 70, 22, '#5cff9a');
  });
  return { dir: d => move(VEC[d][0], VEC[d][1]), a: () => { if (!done) load(); }, undo, dbg: () => ({ move, boxes, goals, li, undo }) };
}
