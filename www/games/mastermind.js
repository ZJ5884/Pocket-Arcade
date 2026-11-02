/* ---------------- MASTERMIND ---------------- */
function mastermind(api, signal, lv){
  const P = [4, 5, 5][lv], NC = [5, 6, 8][lv], TRIES = [10, 10, 11][lv];
  const COL = ['#ff5c7a', '#ffd75c', '#5cff9a', '#5cc8ff', '#b36bff', '#ff9a5c', '#f4f4f8', '#8a6d4a'];
  let code, rows, curRow, slot = 0, score = 0, solved = 0, msg = '', msgT = 0, over = false, endT = 0, reveal = false, wait = 0;
  const RY = 56, RH = Math.floor(400 / TRIES), PX = W / 2 - P * 22;
  function newCode(){ code = Array.from({ length: P }, () => rand(NC)); rows = []; curRow = Array(P).fill(-1); slot = 0; reveal = false; }
  newCode();
  function score2(g){
    let b = 0, w = 0; const cc = Array(NC).fill(0), gc = Array(NC).fill(0);
    for (let i = 0; i < P; i++) { if (g[i] === code[i]) b++; else { cc[code[i]]++; gc[g[i]]++; } }
    for (let c = 0; c < NC; c++) w += Math.min(cc[c], gc[c]);
    return [b, w];
  }
  function submit(){
    if (over || reveal || curRow.includes(-1)) { if (!reveal && !over) { msg = 'Fill every slot first'; msgT = 1; } return; }
    const [b, w] = score2(curRow); rows.push({ g: curRow.slice(), b, w }); beep(400 + b * 120, .06);
    if (b === P) { const pts = (TRIES - rows.length + 1) * 40 * [1, 1.5, 2][lv]; score += Math.round(pts); solved++; api.score(score); msg = 'Cracked it! +' + Math.round(pts); msgT = 1.6; reveal = true; wait = 1.6; buzz('win'); }
    else if (rows.length >= TRIES) { reveal = true; msg = 'Out of tries'; msgT = 2; wait = 2; over = true; endT = 2; buzz('over'); }
    else { curRow = Array(P).fill(-1); slot = 0; }
  }
  const cyc = (i, d) => { if (reveal || over) return; slot = i; curRow[i] = curRow[i] < 0 ? (d > 0 ? 0 : NC - 1) : (curRow[i] + d + NC) % NC; beep(300 + curRow[i] * 40, .02); };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e), y0 = RY + rows.length * RH;
    for (let i = 0; i < P; i++) if (Math.hypot(p.x - (PX + i * 44 + 22), p.y - (y0 + RH / 2)) < 22) { cyc(i, 1); return; }
    if (inRect(p, [W / 2 - 70, 480, 140, 40])) submit();
  }, { signal });
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt;
    if (reveal && !over) { wait -= dt; if (wait <= 0) newCode(); }
    if (over) { endT -= dt; if (endT <= 0) { api.end(score, solved + ' code' + (solved === 1 ? '' : 's') + ' cracked'); endT = 99; } }
    clear();
    text('Crack the code', W / 2, 24, 18, '#e8ebff');
    for (let i = 0; i < P; i++) { const x = PX + i * 44 + 22; if (reveal) circle(x, 44, 12, COL[code[i]]); else { circle(x, 44, 12, '#232850'); text('?', x, 45, 14, '#6c73a6'); } }
    const rowsAll = rows.concat(reveal && !over ? [] : [{ cur: true }]);
    rows.forEach((r, k) => {
      const y = RY + k * RH + RH / 2;
      for (let i = 0; i < P; i++) circle(PX + i * 44 + 22, y, Math.min(16, RH / 2 - 3), COL[r.g[i]]);
      for (let i = 0; i < P; i++) { const px = PX + P * 44 + 16 + (i % 3) * 12, py = y - 6 + ((i / 3) | 0) * 12; circle(px, py, 4.5, i < r.b ? '#fff' : i < r.b + r.w ? '#9aa3d8' : '#232850'); }
    });
    if (!reveal && !over) {
      const y = RY + rows.length * RH + RH / 2;
      for (let i = 0; i < P; i++) { const x = PX + i * 44 + 22; circle(x, y, Math.min(16, RH / 2 - 3), curRow[i] >= 0 ? COL[curRow[i]] : '#232850'); if (i === slot) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, Math.min(19, RH / 2), 0, TAU); ctx.stroke(); } }
    }
    for (let k = rows.length + 1; k < TRIES; k++) { const y = RY + k * RH + RH / 2; for (let i = 0; i < P; i++) circle(PX + i * 44 + 22, y, 5, '#232850'); }
    button(W / 2 - 70, 480, 140, 40, 'Check  (X)', curRow.includes(-1) ? '#232850' : '#2f8f6b');
    text('Tries left ' + (TRIES - rows.length) + '   ·   white = right place, grey = right colour', W / 2, 462, 11, '#6c73a6');
    if (msgT > 0) text(msg, W / 2, 530, 16, '#ffd75c');
  });
  return {
    dir: d => { if (d === 'l') slot = Math.max(0, slot - 1); else if (d === 'r') slot = Math.min(P - 1, slot + 1); else cyc(slot, d === 'u' ? 1 : -1); },
    a: () => cyc(slot, 1), x: submit, y: () => { if (!reveal) curRow[slot] = -1; },
    dbg: () => ({ code, rows, curRow, submit, P, NC })
  };
}
