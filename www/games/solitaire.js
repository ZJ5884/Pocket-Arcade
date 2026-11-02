/* ---------------- SOLITAIRE ---------------- */
const SOL_SUIT = ['♠', '♥', '♦', '♣'], SOL_RANK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const solRed = c => c.s === 1 || c.s === 2;
function solDeal(){
  const deck = [];
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) deck.push({ s, r, up: false });
  for (let i = deck.length - 1; i > 0; i--) { const j = rand(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const tab = Array.from({ length: 7 }, () => []);
  for (let c = 0; c < 7; c++) for (let k = 0; k <= c; k++) { const card = deck.pop(); card.up = k === c; tab[c].push(card); }
  return { stock: deck, waste: [], found: [[], [], [], []], tab };
}
function solCanTab(card, col){
  if (!col.length) return card.r === 13;
  const t = col[col.length - 1];
  return t.up && solRed(t) !== solRed(card) && t.r === card.r + 1;
}
function solFoundIdx(found, card){
  for (let f = 0; f < 4; f++) {
    const p = found[f];
    if (p.length ? (p[p.length - 1].s === card.s && p[p.length - 1].r === card.r - 1) : card.r === 1) return f;
  }
  return -1;
}
function solitaire(api, signal, lv){
  const CW = 44, CH = 60, SX = 51, X0 = 5, TOPY = 54, TABY = 130, DOWN = 8, UP = 20;
  const DRAW = lv === 0 ? 1 : 3, PASSES = lv === 2 ? 3 : Infinity;
  let st = solDeal(), score = 0, passes = 0, moves = 0, t = 0, sel = null, hist = [], done = false, endT = 0, ended = false, final = null;
  let cz = 1, cx = 0, cd = 0, showCur = false, msg = '', msgT = 0;
  const BTNS = [[10, 498, 108, 34, 'Undo'], [126, 498, 108, 34, 'Auto'], [242, 498, 108, 34, 'Finish']];
  const snap = () => { hist.push(JSON.stringify({ st, score, passes, moves })); if (hist.length > 300) hist.shift(); };
  const colY = (c, k) => { let y = TABY; for (let i = 0; i < k; i++) y += st.tab[c][i].up ? UP : DOWN; return y; };
  const faceUp = c => st.tab[c].filter(x => x.up).length;
  function undo(){
    if (!hist.length || done) return;
    const o = JSON.parse(hist.pop()); st = o.st; score = o.score; passes = o.passes; moves = o.moves; sel = null; api.score(Math.max(0, score));
  }
  function check(){
    api.score(Math.max(0, score));
    if (st.found.every(p => p.length === 13)) { done = true; endT = .9; score += Math.max(0, 700 - Math.floor(t)); api.score(score); final = { score, msg: 'You won in ' + fmtTime(t) }; }
  }
  function drawStock(){
    snap();
    if (st.stock.length) {
      const n = Math.min(DRAW, st.stock.length);
      for (let i = 0; i < n; i++) { const c = st.stock.pop(); c.up = true; st.waste.push(c); }
      moves++;
    } else if (st.waste.length) {
      if (PASSES !== Infinity && passes >= PASSES - 1) { hist.pop(); msg = 'No more passes'; msgT = 1.2; return; }
      passes++; st.stock = st.waste.reverse(); st.stock.forEach(c => { c.up = false; }); st.waste = [];
      if (lv > 0) score = Math.max(0, score - 20);
    } else hist.pop();
    sel = null; api.score(Math.max(0, score));
  }
  const selCards = () => !sel ? [] : sel.src === 'waste' ? st.waste.slice(-1) : sel.src === 'found' ? st.found[sel.f].slice(-1) : st.tab[sel.col].slice(sel.idx);
  function removeSel(){ if (sel.src === 'waste') st.waste.pop(); else if (sel.src === 'found') st.found[sel.f].pop(); else st.tab[sel.col].splice(sel.idx); }
  function flipTop(col){ const c = st.tab[col]; if (c.length && !c[c.length - 1].up) { c[c.length - 1].up = true; score += 5; } }
  function moveToTab(col){
    const cards = selCards();
    if (!cards.length || (sel.src === 'tab' && sel.col === col) || !solCanTab(cards[0], st.tab[col])) return false;
    snap(); const from = sel; removeSel();
    st.tab[col].push(...cards);
    if (from.src === 'waste') score += 5; else if (from.src === 'found') score -= 15;
    if (from.src === 'tab') flipTop(from.col);
    moves++; sel = null; check(); return true;
  }
  function moveToFound(f){
    const cards = selCards();
    if (cards.length !== 1) return false;
    const c = cards[0]; let idx = f;
    if (idx < 0) idx = solFoundIdx(st.found, c);
    else { const p = st.found[idx]; if (!(p.length ? (p[p.length - 1].s === c.s && p[p.length - 1].r === c.r - 1) : c.r === 1)) return false; }
    if (idx < 0 || (sel.src === 'found' && sel.f === idx)) return false;
    snap(); const from = sel; removeSel(); st.found[idx].push(c);
    if (from.src !== 'found') score += 10;
    if (from.src === 'tab') flipTop(from.col);
    moves++; sel = null; check(); return true;
  }
  function autoFound(){
    let any = false, moved = true;
    while (moved && !done) {
      moved = false;
      const cand = [];
      if (st.waste.length) cand.push({ src: 'waste' });
      for (let c = 0; c < 7; c++) if (st.tab[c].length && st.tab[c][st.tab[c].length - 1].up) cand.push({ src: 'tab', col: c, idx: st.tab[c].length - 1 });
      for (const s2 of cand) { sel = s2; if (moveToFound(-1)) { moved = true; any = true; break; } }
    }
    sel = null; return any;
  }
  function finishNow(){ if (done) return; done = true; endT = .3; final = { score: Math.max(0, score), msg: 'Finished · ' + st.found.reduce((a, p) => a + p.length, 0) + ' of 52 cards home' }; api.score(final.score); }
  function target(tg){
    if (done || !tg) return;
    if (!sel) {
      if (tg.zone === 'stock') drawStock();
      else if (tg.zone === 'waste') { if (st.waste.length) sel = { src: 'waste' }; }
      else if (tg.zone === 'found') { if (st.found[tg.f].length) sel = { src: 'found', f: tg.f }; }
      else if (tg.zone === 'tab' && tg.idx >= 0 && st.tab[tg.col][tg.idx].up) sel = { src: 'tab', col: tg.col, idx: tg.idx };
      return;
    }
    if (tg.zone === 'stock') { sel = null; drawStock(); return; }
    if (tg.zone === 'tab') {
      if (sel.src === 'tab' && sel.col === tg.col) {
        if (tg.idx === sel.idx && selCards().length === 1 && moveToFound(-1)) return;
        const keep = tg.idx !== sel.idx && tg.idx >= 0 && st.tab[tg.col][tg.idx].up;
        sel = keep ? { src: 'tab', col: tg.col, idx: tg.idx } : null; return;
      }
      if (moveToTab(tg.col)) return;
      sel = null; if (tg.idx >= 0 && st.tab[tg.col][tg.idx].up) sel = { src: 'tab', col: tg.col, idx: tg.idx };
      return;
    }
    if (tg.zone === 'found') { if (!moveToFound(tg.f)) sel = null; return; }
    if (tg.zone === 'waste') { if (sel.src === 'waste') { if (!moveToFound(-1)) sel = null; } else sel = null; return; }
    sel = null;
  }
  function hit(p){
    if (p.y >= TOPY && p.y <= TOPY + CH) {
      const slot = Math.floor((p.x - X0) / SX);
      if (slot === 0) return { zone: 'stock' };
      if (slot === 1) return { zone: 'waste' };
      if (slot >= 3 && slot <= 6) return { zone: 'found', f: slot - 3 };
      return null;
    }
    if (p.y >= TABY) {
      const c = Math.floor((p.x - X0) / SX);
      if (c < 0 || c > 6) return null;
      const col = st.tab[c];
      if (!col.length) return { zone: 'tab', col: c, idx: -1 };
      for (let k = col.length - 1; k >= 0; k--) { const y = colY(c, k); if (p.y >= y && p.y <= y + CH) return { zone: 'tab', col: c, idx: k }; }
      return { zone: 'tab', col: c, idx: -2 };
    }
    return null;
  }
  function cursorTarget(){
    if (cz === 0) { if (cx === 0) return { zone: 'stock' }; if (cx === 1) return { zone: 'waste' }; if (cx >= 3) return { zone: 'found', f: cx - 3 }; return null; }
    const col = st.tab[cx];
    if (!col.length) return { zone: 'tab', col: cx, idx: -1 };
    return { zone: 'tab', col: cx, idx: Math.max(0, col.length - 1 - cd) };
  }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    for (const b of BTNS) if (inRect(p, b)) { if (b[4] === 'Undo') undo(); else if (b[4] === 'Auto') { snap(); if (!autoFound()) hist.pop(); } else finishNow(); return; }
    target(hit(p));
  }, { signal });
  function drawCard(x, y, c, selected){
    if (!c.up) { rr(x, y, CW, CH, 6, '#3b4380'); rr(x + 4, y + 4, CW - 8, CH - 8, 4, '#4f5aa8'); return; }
    const col = solRed(c) ? '#d8344f' : '#23263f';
    rr(x, y, CW, CH, 6, '#f4f2ee');
    text(SOL_RANK[c.r], x + 11, y + 12, 14, col); text(SOL_SUIT[c.s], x + CW - 11, y + 12, 13, col); text(SOL_SUIT[c.s], x + CW / 2, y + CH / 2 + 9, 24, col);
    if (selected) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 1, y - 1, CW + 2, CH + 2, 7); ctx.stroke(); }
  }
  const slot = (x, y, label) => { ctx.strokeStyle = '#3b4380'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.roundRect(x, y, CW, CH, 6); ctx.stroke(); ctx.setLineDash([]); if (label) text(label, x + CW / 2, y + CH / 2, 20, '#4a5290'); };
  loop(signal, dt => {
    if (!done) t += dt; else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    if (msgT > 0) msgT -= dt;
    clear();
    text('Score ' + Math.max(0, score), 60, 24, 15, '#e8ebff'); text(fmtTime(t), W / 2, 24, 15, '#8d94c4'); text(msgT > 0 ? msg : 'Moves ' + moves, W - 60, 24, 14, msgT > 0 ? '#ffd75c' : '#8d94c4');
    const sx = i => X0 + i * SX;
    if (st.stock.length) { drawCard(sx(0), TOPY, { up: false }); text(st.stock.length, sx(0) + CW / 2, TOPY + CH / 2, 14, '#c9ceef'); }
    else slot(sx(0), TOPY, PASSES !== Infinity && passes >= PASSES - 1 ? '✕' : '↻');
    if (st.waste.length) { const show = st.waste.slice(-DRAW); show.forEach((c, i) => drawCard(sx(1) + i * 9, TOPY, c, sel && sel.src === 'waste' && i === show.length - 1)); } else slot(sx(1), TOPY);
    for (let f = 0; f < 4; f++) { const p = st.found[f]; if (p.length) drawCard(sx(3 + f), TOPY, p[p.length - 1], sel && sel.src === 'found' && sel.f === f); else slot(sx(3 + f), TOPY, f === 0 ? 'A' : ''); }
    for (let c = 0; c < 7; c++) {
      const col = st.tab[c];
      if (!col.length) slot(sx(c), TABY);
      col.forEach((card, k) => drawCard(sx(c), colY(c, k), card, sel && sel.src === 'tab' && sel.col === c && k >= sel.idx));
    }
    if ((padConnected || showCur) && !done) {
      let x, y;
      if (cz === 0) { x = sx(cx); y = TOPY; }
      else { const col = st.tab[cx]; x = sx(cx); y = col.length ? colY(cx, Math.max(0, col.length - 1 - cd)) : TABY; }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - 2, y - 2, CW + 4, CH + 4, 8); ctx.stroke();
    }
    BTNS.forEach(b => button(b[0], b[1], b[2], b[3], b[4], b[4] === 'Undo' && !hist.length ? '#232850' : '#3b4380'));
  });
  return {
    dir: d => {
      showCur = true;
      if (d === 'l' || d === 'r') {
        cx = clamp(cx + (d === 'l' ? -1 : 1), 0, 6);
        if (cz === 0 && cx === 2) cx = d === 'r' ? 3 : 1;
        cd = 0;
      } else if (d === 'u') { if (cz === 1) { if (cd < faceUp(cx) - 1) cd++; else { cz = 0; if (cx === 2) cx = 1; cd = 0; } } }
      else { if (cz === 0) { cz = 1; cd = 0; } else if (cd > 0) cd--; }
    },
    a: () => target(cursorTarget()),
    x: undo, undo,
    y: () => { const tg = cursorTarget(); if (!tg || done) return; if (!sel) target(tg); if (sel && !moveToFound(-1)) sel = null; },
    dbg: () => ({ st, score, done, hist: hist.length })
  };
}
