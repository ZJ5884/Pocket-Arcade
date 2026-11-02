function wordle(api, signal, lv){
  const ROWS = [7, 6, 5][lv], TS = 44, GAP = 6, X0 = 58, Y0 = 50, KW = 31, KH = 32;
  const answers = WORDLE_ANS.split(' ');
  const ans = pickFrom(answers);
  let rows = [], curW = '', keyState = {}, msg = '', msgT = 0, shake = 0, revealT = 99, revealRow = -1, done = false, endT = 0, ended = false, final = null, score = 0, cr = 1, cc = 0, showCur = false;
  const say = (m, t) => { msg = m; msgT = t || 1.6; };
  function keyRect(r, c){
    const row = LETTER_ROWS[r], n = row.length, w = row.split('').map(ch => ch === '*' || ch === '#' ? 46 : KW);
    const total = w.reduce((a, b) => a + b, 0) + (n - 1) * 4; let x = (W - total) / 2;
    for (let i = 0; i < c; i++) x += w[i] + 4;
    return [x, 420 + r * (KH + 5), w[c], KH];
  }
  function submit(){
    if (done || revealT < 1.5) return;
    if (curW.length < 5) { shake = .3; say('Not enough letters'); return; }
    if (!wordleOK().has(curW)) { shake = .3; say('Not in word list'); return; }
    if (lv === 2) { const e = wordleHardCheck(curW, rows); if (e) { shake = .3; say(e, 2); return; } }
    const ev = wordleEval(curW, ans);
    rows.push({ w: curW, ev }); revealRow = rows.length - 1; revealT = 0;
    ev.forEach((s, i) => { const c = curW[i]; if ((keyState[c] || -1) < s) keyState[c] = s; });
    const won = curW === ans; curW = '';
    if (won) { done = true; endT = 2; score = 100 + (ROWS - rows.length) * 40 + [0, 50, 100][lv]; api.score(score); final = { score, msg: 'Solved in ' + rows.length + (rows.length === 1 ? ' guess' : ' guesses') + '\nThe word was ' + ans.toUpperCase() }; }
    else if (rows.length >= ROWS) { done = true; endT = 2; final = { score: 0, msg: 'The word was ' + ans.toUpperCase() }; }
  }
  function typeLetter(ch){ if (!done && curW.length < 5 && revealT >= 1.5) curW += ch; }
  function back(){ if (!done) curW = curW.slice(0, -1); }
  function press(ch){ if (ch === '*') submit(); else if (ch === '#') back(); else typeLetter(ch); }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    for (let r = 0; r < 3; r++) for (let c = 0; c < LETTER_ROWS[r].length; c++) if (inRect(p, keyRect(r, c))) { cr = r; cc = c; press(LETTER_ROWS[r][c]); return; }
  }, { signal });
  const COL = ['#3a3f55', '#c9a227', '#2f9e5b'];
  loop(signal, dt => {
    if (revealT < 99) revealT += dt;
    if (msgT > 0) msgT -= dt; if (shake > 0) shake -= dt;
    if (done) { endT -= dt; if (endT <= 0 && !ended && revealT >= 1.5) { ended = true; api.end(final.score, final.msg); } }
    clear();
    text(msgT > 0 ? msg : 'Guess the 5-letter word', W / 2, 28, 16, msgT > 0 ? '#ffd75c' : '#8d94c4');
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < 5; c++) {
      const x = X0 + c * (TS + GAP), y = Y0 + r * (TS + 6), row = rows[r];
      let fill = '#232850', letter = '', border = '#3b4380';
      if (row) {
        letter = row.w[c];
        const t = r === revealRow ? clamp((revealT - c * .22) / .3, 0, 1) : 1;
        if (t >= .5) { fill = COL[row.ev[c]]; border = fill; } else { fill = '#232850'; border = '#5b63a8'; }
        const sc = r === revealRow ? Math.abs(Math.cos(t * Math.PI)) : 1;
        ctx.save(); ctx.translate(x + TS / 2, y + TS / 2); ctx.scale(1, Math.max(.05, sc)); rr(-TS / 2, -TS / 2, TS, TS, 6, fill); text(letter.toUpperCase(), 0, 1, 24, '#fff'); ctx.restore();
        continue;
      }
      if (r === rows.length && !done) { letter = curW[c] || ''; if (letter) border = '#8d94c4'; }
      const sx = r === rows.length && shake > 0 ? Math.sin(shake * 60) * 4 : 0;
      rr(x + sx, y, TS, TS, 6, fill); ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x + sx + 1, y + 1, TS - 2, TS - 2, 6); ctx.stroke();
      if (letter) text(letter.toUpperCase(), x + sx + TS / 2, y + TS / 2 + 1, 24, '#fff');
    }
    for (let r = 0; r < 3; r++) for (let c = 0; c < LETTER_ROWS[r].length; c++) {
      const ch = LETTER_ROWS[r][c], rc = keyRect(r, c), st = keyState[ch];
      rr(rc[0], rc[1], rc[2], rc[3], 6, st === undefined ? '#3b4380' : COL[st]);
      text(ch === '*' ? 'Enter' : ch === '#' ? 'Del' : ch.toUpperCase(), rc[0] + rc[2] / 2, rc[1] + rc[3] / 2 + 1, ch === '*' || ch === '#' ? 12 : 15, '#fff');
      if ((padConnected || showCur) && r === cr && c === cc && !done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.roundRect(rc[0] - 1, rc[1] - 1, rc[2] + 2, rc[3] + 2, 7); ctx.stroke(); }
    }
  });
  return {
    key: e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      if (/^[a-zA-Z]$/.test(e.key)) { typeLetter(e.key.toLowerCase()); return true; }
      if (e.key === 'Enter') { submit(); return true; }
      if (e.key === 'Backspace') { back(); return true; }
      return false;
    },
    dir: d => { showCur = true; if (d === 'l' || d === 'r') cc = clamp(cc + (d === 'l' ? -1 : 1), 0, LETTER_ROWS[cr].length - 1); else { const nr = clamp(cr + (d === 'u' ? -1 : 1), 0, 2); cc = Math.min(LETTER_ROWS[nr].length - 1, Math.round(cc * (LETTER_ROWS[nr].length - 1) / Math.max(1, LETTER_ROWS[cr].length - 1))); cr = nr; } },
    a: () => press(LETTER_ROWS[cr][cc]), x: back, y: submit,
    dbg: () => ({ ans, rows, curW, done, score, setAns: w => { /* test helper */ }, ROWS })
  };
}
