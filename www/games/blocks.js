/* ---------------- BLOCKS ---------------- */
const PIECES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]]
};
const PCOLOR = { I:'#4fd8ff', O:'#ffd75c', T:'#b36bff', S:'#5cff9a', Z:'#ff5c7a', J:'#5c7cff', L:'#ff9a5c' };
function rotM(m){ const n = m.length; return m.map((_, y) => m.map((__, x) => m[n - 1 - x][y])); }
function clearLines(board){
  let n = 0;
  for (let r = board.length - 1; r >= 0; r--) {
    if (board[r].every(Boolean)) { board.splice(r, 1); board.unshift(Array(board[0].length).fill(null)); n++; r++; }
  }
  return n;
}
function blocks(api, signal, lv){
  const COLS = 10, ROWS = 20, CS = 25, BX = 15, BY = 20;
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  if (lv === 2) for (let r = ROWS - 4; r < ROWS; r++) { const hole = rand(COLS); for (let c = 0; c < COLS; c++) if (c !== hole && Math.random() < .85) board[r][c] = 'ILJTSZO'[rand(7)]; }
  let bag = [], cur = null, next = null, score = 0, shown = -1, lines = 0, level = [1, 1, 5][lv], acc = 0, dead = false, hT = 0, hDir = 0, hRep = 0;
  const pull = () => {
    if (!bag.length) { bag = Object.keys(PIECES); for (let i = bag.length - 1; i > 0; i--) { const j = rand(i + 1); [bag[i], bag[j]] = [bag[j], bag[i]]; } }
    return bag.pop();
  };
  const hit = (m, x, y) => {
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m.length; c++) {
      if (!m[r][c]) continue;
      const nx = x + c, ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
    return false;
  };
  function spawn(){
    const k = next || pull(); next = pull();
    const m = PIECES[k].map(r => r.slice());
    cur = { k, m, x: ((COLS - m.length) / 2) | 0, y: k === 'I' ? -1 : 0 };
    if (hit(cur.m, cur.x, cur.y)) { dead = true; api.end(score, 'Lines ' + lines + '  ·  Level ' + level); }
  }
  function lock(){
    cur.m.forEach((row, r) => row.forEach((v, c) => { if (v && cur.y + r >= 0) board[cur.y + r][cur.x + c] = cur.k; }));
    const n = clearLines(board);
    if (n) { score += [0, 100, 300, 500, 800][n] * level; lines += n; level = [1, 1, 5][lv] + Math.floor(lines / [12, 10, 8][lv]); }
    spawn();
  }
  const move = dx => { if (!dead && !hit(cur.m, cur.x + dx, cur.y)) cur.x += dx; };
  function rotate(){
    if (dead) return;
    const m = rotM(cur.m);
    for (const k of [0, -1, 1, -2, 2]) if (!hit(m, cur.x + k, cur.y)) { cur.m = m; cur.x += k; return; }
  }
  function down(){ if (dead) return; if (!hit(cur.m, cur.x, cur.y + 1)) cur.y++; else lock(); }
  function hard(){ if (dead) return; let d = 0; while (!hit(cur.m, cur.x, cur.y + 1)) { cur.y++; d++; } score += d * 2; lock(); }
  const ghostY = () => { let y = cur.y; while (!hit(cur.m, cur.x, y + 1)) y++; return y; };
  const cell = (x, y, col) => rr(x + 1, y + 1, CS - 2, CS - 2, 4, col);
  spawn();

  let tx = null, ty = 0, lastX = 0, moved = false;
  canvas.addEventListener('pointerdown', e => { const p = pt(e); capture(e); tx = p.x; ty = p.y; lastX = p.x; moved = false; }, { signal });
  canvas.addEventListener('pointermove', e => {
    if (tx === null || dead) return;
    const p = pt(e);
    while (p.x - lastX >= CS) { move(1); lastX += CS; moved = true; }
    while (lastX - p.x >= CS) { move(-1); lastX -= CS; moved = true; }
  }, { signal });
  canvas.addEventListener('pointerup', e => {
    if (tx === null || dead) { tx = null; return; }
    const p = pt(e), dy = p.y - ty;
    if (!moved && dy > 70 && Math.abs(p.x - tx) < 50) hard();
    else if (!moved && Math.abs(dy) < 20) rotate();
    tx = null;
  }, { signal });

  loop(signal, dt => {
    if (dead) return;
    const ax = axis(), hd = Math.abs(ax) > .5 ? Math.sign(ax) : 0;
    if (hd !== hDir) { hDir = hd; hT = 0; hRep = 0; }
    else if (hd) { hT += dt; if (hT > .2) { hRep += dt; while (hRep > .055) { hRep -= .055; move(hd); } } }
    const soft = axisY() > .5;
    acc += dt;
    const iv = soft ? .045 : Math.max(.07, [1.0, .8, .6][lv] - (level - 1) * .07);
    while (acc >= iv && !dead) { acc -= iv; down(); if (soft) score += 1; }
    if (dead) return;
    if (score !== shown) { shown = score; api.score(score); }

    clear();
    rr(BX - 4, BY - 4, COLS * CS + 8, ROWS * CS + 8, 10, '#10132a');
    ctx.fillStyle = '#161a36';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if ((r + c) % 2) ctx.fillRect(BX + c * CS, BY + r * CS, CS, CS);
    board.forEach((row, r) => row.forEach((k, c) => { if (k) cell(BX + c * CS, BY + r * CS, PCOLOR[k]); }));
    const gy = ghostY();
    ctx.globalAlpha = .25;
    cur.m.forEach((row, r) => row.forEach((v, c) => { if (v && gy + r >= 0) cell(BX + (cur.x + c) * CS, BY + (gy + r) * CS, PCOLOR[cur.k]); }));
    ctx.globalAlpha = 1;
    cur.m.forEach((row, r) => row.forEach((v, c) => { if (v && cur.y + r >= 0) cell(BX + (cur.x + c) * CS, BY + (cur.y + r) * CS, PCOLOR[cur.k]); }));
    text('NEXT', 318, 36, 13, '#8d94c4');
    PIECES[next].forEach((row, r) => row.forEach((v, c) => { if (v) rr(288 + c * 16, 56 + r * 16, 15, 15, 3, PCOLOR[next]); }));
    text('LEVEL', 318, 170, 13, '#8d94c4'); text(level, 318, 194, 26);
    text('LINES', 318, 245, 13, '#8d94c4'); text(lines, 318, 269, 26);
  });
  return {
    dir: d => { if (d === 'l') move(-1); else if (d === 'r') move(1); else if (d === 'u') rotate(); else down(); },
    a: rotate, x: hard, y: hard
  };
}
