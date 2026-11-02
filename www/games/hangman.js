/* ---------------- HANGMAN ---------------- */
function hangman(api, signal, lv){
  const LIVES = [8, 6, 5][lv], cats = Object.keys(HANG_WORDS);
  const seen = new Set();
  let word = '', cat = '', guessed = new Set(), lost = 0, score = 0, solved = 0, cx = 0, cy = 0, showCur = false, shake = 0, wait = 0, done = false, endT = 0, ended = false, final = null, flash = '', flashT = 0;
  const ROWS = ['abcdefg', 'hijklmn', 'opqrst', 'uvwxyz'];
  function next(){
    let w, c, tries = 0;
    do { c = pickFrom(cats); w = pickFrom(HANG_WORDS[c]); tries++; } while ((seen.has(w) || (lv === 0 && w.length > 9)) && tries < 60);
    seen.add(w); word = w; cat = c; guessed = new Set(); lost = 0; wait = 0;
  }
  next();
  const rect = (r, c) => { const n = ROWS[r].length, w = 40, x0 = (W - (n * w + (n - 1) * 6)) / 2; return [x0 + c * (w + 6), 352 + r * 42, w, 36]; };
  const complete = () => word.split('').every(ch => guessed.has(ch));
  function guess(ch){
    if (done || wait > 0 || guessed.has(ch)) return;
    guessed.add(ch);
    if (word.includes(ch)) {
      const n = word.split(ch).length - 1; score += 10 * n; api.score(score); beep(520, .06);
      if (complete()) { score += 50 + (LIVES - lost) * 10 + word.length * 5; api.score(score); solved++; wait = 1.3; flash = 'Solved! +' + (50 + (LIVES - lost) * 10 + word.length * 5); flashT = 1.2; }
    } else {
      lost++; shake = .3; beep(150, .12);
      if (lost >= LIVES) { done = true; endT = 1.4; final = { score, msg: 'The word was ' + word.toUpperCase() + '\nWords solved: ' + solved }; }
    }
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    for (let r = 0; r < 4; r++) for (let c = 0; c < ROWS[r].length; c++) if (inRect(p, rect(r, c))) { cx = c; cy = r; guess(ROWS[r][c]); return; }
  }, { signal });
  loop(signal, dt => {
    if (shake > 0) shake -= dt; if (flashT > 0) flashT -= dt;
    if (wait > 0) { wait -= dt; if (wait <= 0) next(); }
    if (done) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    clear();
    text(lv === 2 ? 'Hard: no category hint' : 'Category: ' + cat, W / 2, 26, 15, '#8d94c4');
    text('Words solved ' + solved, 70, 50, 12, '#6c73a6'); text('Lives ' + (LIVES - lost), W - 60, 50, 12, LIVES - lost <= 2 ? '#ff7a8a' : '#6c73a6');
    // gallows: parts appear in proportion to lives lost
    const parts = Math.ceil(lost / LIVES * 10), ox = shake > 0 ? Math.sin(shake * 70) * 2 : 0;
    ctx.strokeStyle = '#b9bfe8'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const seg = (n, f) => { if (parts >= n) { ctx.beginPath(); f(); ctx.stroke(); } };
    seg(1, () => { ctx.moveTo(100, 235); ctx.lineTo(260, 235); });
    seg(2, () => { ctx.moveTo(130, 235); ctx.lineTo(130, 70); });
    seg(3, () => { ctx.moveTo(126, 72); ctx.lineTo(220, 72); });
    seg(4, () => { ctx.moveTo(220 + ox, 72); ctx.lineTo(220 + ox, 98); });
    ctx.strokeStyle = '#ffd75c';
    seg(5, () => { ctx.arc(220 + ox, 112, 14, 0, TAU); });
    seg(6, () => { ctx.moveTo(220 + ox, 126); ctx.lineTo(220 + ox, 176); });
    seg(7, () => { ctx.moveTo(220 + ox, 138); ctx.lineTo(198 + ox, 160); });
    seg(8, () => { ctx.moveTo(220 + ox, 138); ctx.lineTo(242 + ox, 160); });
    seg(9, () => { ctx.moveTo(220 + ox, 176); ctx.lineTo(202 + ox, 206); });
    seg(10, () => { ctx.moveTo(220 + ox, 176); ctx.lineTo(238 + ox, 206); });
    ctx.lineCap = 'butt';
    if (done) { text('Game over', 190, 252, 14, '#ff7a8a'); }
    // word
    const n = word.length, step = Math.min(28, (W - 30) / n), sx = (W - n * step) / 2 + step / 2;
    for (let i = 0; i < n; i++) {
      const ch = word[i], known = guessed.has(ch) || done;
      ctx.strokeStyle = '#5b63a8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx + i * step - step * .38, 300); ctx.lineTo(sx + i * step + step * .38, 300); ctx.stroke();
      if (known) text(ch.toUpperCase(), sx + i * step, 288, 22, guessed.has(ch) ? '#fff' : '#ff7a8a');
    }
    if (flashT > 0) text(flash, W / 2, 322, 16, '#6fe3a7');
    for (let r = 0; r < 4; r++) for (let c = 0; c < ROWS[r].length; c++) {
      const ch = ROWS[r][c], rc = rect(r, c), used = guessed.has(ch), hit = used && word.includes(ch);
      rr(rc[0], rc[1], rc[2], rc[3], 8, used ? (hit ? '#2f9e5b' : '#2a2e45') : '#3b4380');
      text(ch.toUpperCase(), rc[0] + rc[2] / 2, rc[1] + rc[3] / 2 + 1, 17, used && !hit ? '#5b617f' : '#fff');
      if ((padConnected || showCur) && r === cy && c === cx && !done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(rc[0] - 1, rc[1] - 1, rc[2] + 2, rc[3] + 2, 9); ctx.stroke(); }
    }
  });
  return {
    key: e => { if (e.ctrlKey || e.metaKey || e.altKey) return false; if (/^[a-zA-Z]$/.test(e.key)) { guess(e.key.toLowerCase()); return true; } return false; },
    dir: d => { showCur = true; if (d === 'l' || d === 'r') cx = clamp(cx + (d === 'l' ? -1 : 1), 0, ROWS[cy].length - 1); else { cy = clamp(cy + (d === 'u' ? -1 : 1), 0, 3); cx = Math.min(cx, ROWS[cy].length - 1); } },
    a: () => guess(ROWS[cy][cx]),
    dbg: () => ({ word, guessed, lost, LIVES, solved, done, score, guess, setWord: w => { word = w; guessed = new Set(); lost = 0; wait = 0; } })
  };
}
