/* ---------------- WORD CONNECT (connect letters to spell words) ---------------- */
function wordconnect(api, signal, lv){
  const LEN = [5, 6, 7][lv], ROUNDS = 3, CX = 180, CY = 402, RING = 80, NODE = 25;
  const list = CONNECT_PUZ[LEN].map(p => [p[0], p[1].split(' ')]);
  const used = new Set();
  let round = 0, base = '', letters = [], need = [], found = new Set(), bonus = new Set(), hinted = {}, chain = [], score = 0, cursor = 0, touching = false, msg = '', msgT = 0, shakeT = 0;
  let wait = 0, done = false, endT = 0, ended = false, final = null, wordsFound = 0, showCur = false;
  const BTN_HINT = [12, 488, 100, 36], BTN_END = [248, 488, 100, 36];
  function shuffle(){
    for (let i = letters.length - 1; i > 0; i--) { const j = rand(i + 1); [letters[i], letters[j]] = [letters[j], letters[i]]; }
    chain = [];
  }
  function nextRound(){
    let p, tries = 0;
    do { p = pickFrom(list); tries++; } while (used.has(p[0]) && tries < 40);
    used.add(p[0]); round++; base = p[0]; letters = base.split(''); shuffle();
    need = p[1].slice().sort((a, b) => a.length - b.length || (a < b ? -1 : 1)); found = new Set(); bonus = new Set(); hinted = {}; chain = []; wait = 0; cursor = 0;
  }
  nextRound();
  const say = (m, t) => { msg = m; msgT = t || 1.3; };
  const chainWord = () => chain.map(i => letters[i]).join('');
  const nodePos = i => { const a = -Math.PI / 2 + i * TAU / letters.length; return [CX + Math.cos(a) * RING, CY + Math.sin(a) * RING]; };
  function revealed(w){ return found.has(w) ? w.length : Math.min(hinted[w] || 0, w.length); }
  function wordDone(w, pts, label){
    found.add(w); score += pts; api.score(score); wordsFound++; say(label, 1.1); beep(560 + w.length * 40, .1);
    if (need.every(x => found.has(x))) { score += 50; api.score(score); wait = 1.2; say('Round clear! +50', 1.5); }
  }
  function submit(){
    if (done || wait > 0) return;
    const w = chainWord(); chain = [];
    if (w.length < 3) { if (w.length) { shakeT = .3; say('Too short'); } return; }
    if (need.includes(w)) { if (found.has(w)) { say('Already found'); return; } wordDone(w, w.length * 10, w.toUpperCase()); }
    else if (bonus.has(w)) say('Already found');
    else if (dictSet().has(w)) { bonus.add(w); score += 5; api.score(score); say('Bonus word! +5', 1.2); beep(700, .08); }
    else { shakeT = .3; say('Not in the word list'); }
  }
  function hint(){
    if (done || wait > 0) return;
    const open = need.filter(w => !found.has(w)); if (!open.length) return;
    const w = pickFrom(open); hinted[w] = (hinted[w] || 0) + 1; score = Math.max(0, score - 20); api.score(score);
    say('Hint used (-20)', 1);
    if (hinted[w] >= w.length) wordDone(w, 0, w.toUpperCase());
  }
  function finishNow(){ if (done) return; done = true; endT = .3; final = { score, msg: 'Words found: ' + wordsFound + '  ·  Bonus words: ' + bonus.size }; }
  function nodeAt(p){ for (let i = 0; i < letters.length; i++) { const q = nodePos(i); if (Math.hypot(p.x - q[0], p.y - q[1]) < NODE + 4) return i; } return -1; }
  function addNode(i){
    if (i < 0) return;
    const k = chain.indexOf(i);
    if (k === -1) chain.push(i);
    else if (k === chain.length - 2) chain.pop();
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (inRect(p, BTN_HINT)) { hint(); return; }
    if (inRect(p, BTN_END)) { finishNow(); return; }
    if (Math.hypot(p.x - CX, p.y - CY) < 26) { shuffle(); return; }
    const i = nodeAt(p); if (i >= 0) { capture(e); touching = true; chain = []; addNode(i); cursor = i; }
  }, { signal });
  canvas.addEventListener('pointermove', e => { if (touching) { const i = nodeAt(pt(e)); if (i >= 0) { addNode(i); cursor = i; } } }, { signal });
  canvas.addEventListener('pointerup', () => { if (touching) { touching = false; submit(); } }, { signal });
  canvas.addEventListener('pointercancel', () => { touching = false; chain = []; }, { signal });
  function layout(){
    const cols = []; let col = [], rowsMax = 10;
    need.forEach(w => { if (col.length >= rowsMax) { cols.push(col); col = []; } col.push(w); });
    if (col.length) cols.push(col);
    const BOX = 15, SP = 2, widths = cols.map(c => Math.max(...c.map(w => w.length)) * (BOX + SP));
    const total = widths.reduce((a, b) => a + b, 0) + (cols.length - 1) * 16;
    const height = Math.max(...cols.map(c => c.length)) * (BOX + 5);
    const sc = Math.min(1, 336 / total, 188 / height);
    return { cols, widths, total, sc, BOX, SP, height };
  }
  loop(signal, dt => {
    if (msgT > 0) msgT -= dt; if (shakeT > 0) shakeT -= dt;
    if (wait > 0) { wait -= dt; if (wait <= 0) { if (round >= ROUNDS) finishNow(); else nextRound(); } }
    if (done) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    clear();
    text('Round ' + round + ' of ' + ROUNDS, 56, 24, 14, '#8d94c4'); text('Bonus ' + bonus.size, W / 2, 24, 14, bonus.size ? '#ffd75c' : '#8d94c4'); text(found.size + ' / ' + need.length + ' words', W - 60, 24, 14, '#8d94c4');
    // word slots
    const L = layout(); ctx.save();
    const gx = (W - L.total * L.sc) / 2, gy = 40 + (188 - L.height * L.sc) / 2;
    ctx.translate(gx, gy); ctx.scale(L.sc, L.sc);
    let x = 0;
    L.cols.forEach((c, ci) => {
      c.forEach((w, r) => {
        const y = r * (L.BOX + 5), got = found.has(w), n = revealed(w);
        for (let k = 0; k < w.length; k++) {
          const bx = x + k * (L.BOX + L.SP);
          rr(bx, y, L.BOX, L.BOX, 3, got ? '#2f9e5b' : k < n ? '#4a5290' : '#232850');
          if (got || k < n) text(w[k].toUpperCase(), bx + L.BOX / 2, y + L.BOX / 2 + .5, 11, '#fff');
        }
      });
      x += L.widths[ci] + 16;
    });
    ctx.restore();
    // current word
    const cw = chainWord();
    if (cw) { const w = cw.length * 26 + 14; rr((W - w) / 2, 234, w, 32, 16, shakeT > 0 ? '#9a3a4a' : '#4f7cff'); text(cw.toUpperCase(), W / 2, 251, 20, '#fff'); }
    else text(msgT > 0 ? msg : 'Drag across letters to spell words', W / 2, 251, msgT > 0 ? 17 : 13, msgT > 0 ? '#ffd75c' : '#6c73a6');
    if (cw && msgT > 0) text(msg, W / 2, 278, 13, '#ffd75c');
    // ring
    circle(CX, CY, RING + 36, '#10132a');
    if (chain.length) {
      ctx.strokeStyle = '#4f7cff'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
      chain.forEach((i, k) => { const q = nodePos(i); if (k) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.stroke(); ctx.lineCap = 'butt';
    }
    letters.forEach((ch, i) => {
      const q = nodePos(i), on = chain.includes(i);
      circle(q[0], q[1], NODE, on ? '#4f7cff' : '#e8e4da');
      text(ch.toUpperCase(), q[0], q[1] + 1, 26, on ? '#fff' : '#1b1d24');
      if ((padConnected || showCur) && i === cursor && !touching && !done) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(q[0], q[1], NODE + 4, 0, TAU); ctx.stroke(); }
    });
    circle(CX, CY, 20, '#2c3263'); text('⟳', CX, CY + 1, 22, '#fff');
    button(BTN_HINT[0], BTN_HINT[1], BTN_HINT[2], BTN_HINT[3], 'Hint', '#3b4380'); button(BTN_END[0], BTN_END[1], BTN_END[2], BTN_END[3], 'Finish', '#3b4380');
  });
  return {
    key: e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return false;
      if (/^[a-zA-Z]$/.test(e.key)) { const ch = e.key.toLowerCase(); const i = letters.findIndex((c, k) => c === ch && !chain.includes(k)); if (i >= 0) chain.push(i); return true; }
      if (e.key === 'Enter') { submit(); return true; }
      if (e.key === 'Backspace') { chain.pop(); return true; }
      if (e.key === ' ') { shuffle(); return true; }
      return false;
    },
    dir: d => { showCur = true; if (d === 'l') cursor = (cursor + letters.length - 1) % letters.length; else if (d === 'r') cursor = (cursor + 1) % letters.length; else if (d === 'u') hint(); else chain = []; },
    a: () => { showCur = true; const k = chain.indexOf(cursor); if (k === -1) chain.push(cursor); else if (k === chain.length - 1) chain.pop(); },
    x: submit, y: shuffle,
    dbg: () => ({ base, need, found, bonus, chain, score, submit, letters, round, done, setChain: w => { chain = []; w.split('').forEach(ch => { const i = letters.findIndex((c, k) => c === ch && !chain.includes(k)); if (i >= 0) chain.push(i); }); } })
  };
}
