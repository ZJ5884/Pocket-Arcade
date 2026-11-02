/* ---------------- 2048 ---------------- */
function g2048(api, signal, lv){
  let g = Array.from({length:4}, () => Array(4).fill(0)), score = 0, hist = [], left = [99, 6, 2][lv];
  const colors = { 0:'#262c55', 2:'#eee4da', 4:'#ede0c8', 8:'#f2b179', 16:'#f59563', 32:'#f67c5f', 64:'#f65e3b', 128:'#edcf72', 256:'#edcc61', 512:'#edc850', 1024:'#edc53f', 2048:'#edc22e' };
  function add(){
    const e = [];
    g.forEach((r, y) => r.forEach((v, x) => { if (!v) e.push([x, y]); }));
    if (!e.length) return;
    const [x, y] = e[rand(e.length)];
    g[y][x] = Math.random() < [1, .9, .7][lv] ? 2 : 4;
  }
  add(); add();
  function slide(r){
    const a = r.filter(Boolean);
    for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i+1]) { a[i] *= 2; score += a[i]; a.splice(i + 1, 1); }
    while (a.length < 4) a.push(0);
    return a;
  }
  const rev = r => r.slice().reverse();
  function can(){
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      if (!g[y][x]) return true;
      if (x < 3 && g[y][x] === g[y][x+1]) return true;
      if (y < 3 && g[y][x] === g[y+1][x]) return true;
    }
    return false;
  }
  function move(d){
    const before = JSON.stringify(g), snapScore = score;
    if (d === 'l') g = g.map(slide);
    else if (d === 'r') g = g.map(r => rev(slide(rev(r))));
    else {
      const t = g[0].map((_, x) => g.map(r => r[x]));
      const m = t.map(r => d === 'u' ? slide(r) : rev(slide(rev(r))));
      g = m[0].map((_, y) => m.map(r => r[y]));
    }
    if (JSON.stringify(g) !== before) { hist.push({ g: JSON.parse(before), score: snapScore }); if (hist.length > 30) hist.shift(); add(); api.score(score); draw(); if (!can()) api.end(score); }
  }
  function draw(){
    clear();
    text('2048', W/2, 60, 44, '#f2b179');
    text('Merge the tiles', W/2, 105, 15, '#8d94c4');
    rr(5, 150, 350, 350, 14, '#1d2243');
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const v = g[y][x], px = 5 + 6 + x * 86, py = 150 + 6 + y * 86;
      rr(px, py, 80, 80, 10, colors[v] || '#3c3a32');
      if (v) text(v, px + 40, py + 41, v > 999 ? 26 : v > 99 ? 32 : 38, v <= 4 ? '#6b5f50' : '#fff');
    }
  }
  function undo(){ if (!hist.length || left <= 0) return; const h = hist.pop(); g = h.g; score = h.score; left--; api.score(score); draw(); }
  swipe(signal, move);
  draw();
  return { dir: move, undo };
}
