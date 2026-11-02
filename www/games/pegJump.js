/* ---------------- PEG JUMP ---------------- */
function pegJump(api, signal, lv){
  const CS = 44, X0 = 26, Y0 = 110, OK = (x, y) => x >= 0 && x < 7 && y >= 0 && y < 7 && (x > 1 && x < 5 || y > 1 && y < 5);
  const peg = new Set(); for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if (OK(x, y)) peg.add(y * 7 + x);
  const hole = lv === 2 ? [3, 1] : [3, 3]; peg.delete(hole[1] * 7 + hole[0]);
  let cx = 3, cy = 3, sel = null, hist = [], over = false, endT = 0, msg = '', jumped = 0;
  const has = (x, y) => peg.has(y * 7 + x);
  const targets = (x, y) => [[2, 0], [-2, 0], [0, 2], [0, -2]].map(([dx, dy]) => [x + dx, y + dy, x + dx / 2, y + dy / 2]).filter(([tx, ty, mx, my]) => OK(tx, ty) && !has(tx, ty) && has(mx, my));
  const anyMove = () => { for (const i of peg) if (targets(i % 7, (i / 7) | 0).length) return true; return false; };
  function click(x, y){
    if (over || !OK(x, y)) return;
    if (sel) {
      const t = targets(sel[0], sel[1]).find(q => q[0] === x && q[1] === y);
      if (t) {
        hist.push(new Set(peg)); peg.delete(sel[1] * 7 + sel[0]); peg.delete(t[3] * 7 + t[2]); peg.add(y * 7 + x); sel = null; jumped++; beep(440 + jumped * 12, .05);
        const left = peg.size; api.score((32 - (left - 1)) * 10);
        if (!anyMove()) { over = true; endT = .7; }
        return;
      }
    }
    if (has(x, y) && targets(x, y).length) sel = [x, y]; else { sel = null; beep(160, .06); }
  }
  function undo(){ if (lv === 2 || !hist.length || over) return; const h = hist.pop(); peg.clear(); h.forEach(i => peg.add(i)); sel = null; jumped--; api.score((32 - (peg.size - 1)) * 10); }
  canvas.addEventListener('pointerdown', e => { const p = pt(e), x = Math.floor((p.x - X0) / CS), y = Math.floor((p.y - Y0) / CS); if (OK(x, y)) { cx = x; cy = y; click(x, y); } }, { signal });
  api.score(0);
  loop(signal, dt => {
    if (over) { endT -= dt; if (endT <= 0) { const left = peg.size; api.end((32 - (left - 1)) * 10 + (left === 1 ? 200 : 0), left === 1 ? 'Perfect: one peg left!' : left + ' pegs left'); endT = 99; } }
    clear();
    text('Jump pegs to remove them', W / 2, 40, 18, '#e8ebff');
    text('Pegs left ' + peg.size, W / 2, 75, 15, '#b9bfe8');
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      if (!OK(x, y)) continue;
      const px = X0 + x * CS + CS / 2, py = Y0 + y * CS + CS / 2;
      circle(px, py, 18, '#10132a');
      if (has(x, y)) circle(px, py, 15, sel && sel[0] === x && sel[1] === y ? '#ffd75c' : '#e9a36b');
      if (sel && targets(sel[0], sel[1]).some(q => q[0] === x && q[1] === y)) circle(px, py, 8, '#5cff9a');
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X0 + cx * CS + CS / 2, Y0 + cy * CS + CS / 2, 21, 0, TAU); ctx.stroke();
    text(lv === 2 ? 'No undo on Hard' : 'Undo takes back your last jump', W / 2, 505, 13, '#6c73a6');
  });
  return {
    dir: d => { let x = cx, y = cy; do { x += VEC[d][0]; y += VEC[d][1]; } while (x >= 0 && x < 7 && y >= 0 && y < 7 && !OK(x, y)); if (OK(x, y)) { cx = x; cy = y; } },
    a: () => click(cx, cy), x: undo, undo, y: () => { sel = null; },
    dbg: () => ({ peg, targets, click, anyMove })
  };
}
