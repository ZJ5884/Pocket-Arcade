/* ---------------- DOUGH EMPIRE (idle clicker with worlds, upgrades and ascension) ---------------- */
function doughEmpire(api, signal, lv){
  const KEY = 'pa_dough_v1', COSTM = [.8, 1, 1.25][lv];
  const F = [1, 3, 9, 27, 81], BC = [15, 100, 1100, 12000, 130000, 1.4e6, 2e7, 3.3e8], BP = [.1, 1, 8, 47, 260, 1400, 7800, 44000];
  const UC = [0, 1e5, 1e7, 1e9, 1e11];
  const WORLDS = [
    { name: 'Cozy Bakery', cur: 'cookies', col: '#c68642', chip: '#5a3414', bg: '#2a1c14', b: [['Cursor', '👆'], ['Grandma', '👵'], ['Clay Oven', '♨️'], ['Bakery', '🏠'], ['Wheat Mill', '🌾'], ['Factory', '🏭'], ['Cookie Bank', '🏦'], ['Wizard Tower', '🧙']] },
    { name: 'Candy Kingdom', cur: 'candies', col: '#e75a9a', chip: '#fff3a8', bg: '#2d1530', b: [['Lollipop Lad', '🍭'], ['Gummy Farm', '🐻'], ['Choco River', '🍫'], ['Sugar Mine', '⛏️'], ['Taffy Press', '🍬'], ['Caramel Cannon', '💥'], ['Jelly Reactor', '☢️'], ['Candy Castle', '🏰']] },
    { name: 'Frost Valley', cur: 'ice crumbs', col: '#8fd3f4', chip: '#ffffff', bg: '#12253a', b: [['Snowball Tosser', '⛄'], ['Ice Oven', '🧊'], ['Penguin Crew', '🐧'], ['Igloo Bakery', '🛖'], ['Glacier Mill', '🏔️'], ['Aurora Forge', '🌌'], ['Blizzard Plant', '🌨️'], ['Frost Palace', '❄️']] },
    { name: 'Orbital Oven', cur: 'stardust', col: '#b79cff', chip: '#ffe27a', bg: '#141233', b: [['Rover', '🤖'], ['Moon Oven', '🌙'], ['Rocket', '🚀'], ['Space Station', '🛰️'], ['Asteroid Quarry', '☄️'], ['Nebula Mixer', '🌀'], ['Black Hole Bank', '⚫'], ['Star Forge', '⭐']] },
    { name: 'Dream Dimension', cur: 'dreams', col: '#7de3c5', chip: '#ff9ad5', bg: '#102b2a', b: [['Lucid Spoon', '🥄'], ['Pillow Golem', '🛏️'], ['Dream Weaver', '🕸️'], ['Moon Whale', '🐋'], ['Cloud Kitchen', '☁️'], ['Time Loop', '⏳'], ['Reality Oven', '🔮'], ['Infinite Bakery', '♾️']] }
  ];
  const TH = [1, 10, 25, 50, 100], TM = [10, 100, 1e3, 2e4, 5e5], TN = ['Polished', 'Trained', 'Overclocked', 'Legendary', 'Mythic'];
  const CKN = ['Firm Grip', 'Both Hands', 'Sugar Gloves', 'Golden Thumb', 'Titan Fingers', 'Mythic Touch'], CKC = [100, 500, 1e4, 1e5, 1e7, 1e9];
  const PCN = ['Greedy Fingers', 'Echo Taps', 'Thousand Hands', 'Ghost Clicks'], PCC = [5e3, 5e5, 5e7, 5e9];
  const GLN = ['Better Recipes', 'Secret Spices', 'Master Chefs', 'Golden Ovens', 'World Wonder'], GLC = [3e3, 3e5, 3e7, 3e9, 3e11];
  const SHOP = [
    ['Strong Hands', 'Clicks +50% per level', 20, 1], ['Sweet Spot', 'All output +10% per level', 50, 1], ['Pantry', 'Start each run with a stash', 10, 1], ['Lucky Stars', 'Golden cookies come sooner', 10, 2],
    ['Haggler', 'Buildings 2% cheaper per level', 20, 2], ['Night Shift', 'Longer, better offline earnings', 8, 2], ['Portal Key', 'Start runs with more worlds open', 4, 3], ['Golden Touch', 'Golden effects stronger', 8, 3]
  ];
  let S;
  const UPS = [];
  WORLDS.forEach((wd, w) => {
    wd.b.forEach((b, i) => TH.forEach((th, k) => UPS.push({ id: w + 'b' + i + 't' + k, w, name: b[0] + ' ' + TN[k], desc: b[0] + ' output x2', cost: BC[i] * F[w] * TM[k], req: () => S.worlds[w].b[i] >= th })));
    CKN.forEach((n, k) => UPS.push({ id: w + 'c' + k, w, name: n, desc: 'Clicks x2', cost: CKC[k] * F[w], req: () => S.worlds[w].life >= CKC[k] * F[w] * .1 }));
    PCN.forEach((n, k) => UPS.push({ id: w + 'p' + k, w, name: n, desc: 'Clicks add 2% of output', cost: PCC[k] * F[w], req: () => S.worlds[w].life >= PCC[k] * F[w] * .1 }));
    GLN.forEach((n, k) => UPS.push({ id: w + 'g' + k, w, name: n, desc: 'This world +15% output', cost: GLC[k] * F[w], req: () => S.worlds[w].life >= GLC[k] * F[w] * .1 }));
  });
  const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n){
    if (!isFinite(n)) return '∞';
    if (n < 1000) return n < 10 ? n.toFixed(1).replace(/\.0$/, '') : String(Math.floor(n));
    const e = Math.floor(Math.log10(n) / 3); if (e >= SUF.length) return n.toExponential(2).replace('+', '');
    const v = n / Math.pow(1000, e); return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + SUF[e];
  }
  const freshWorlds = () => WORLDS.map(() => ({ cur: 0, life: 0, b: Array(8).fill(0), up: {} }));
  const fresh = () => ({ w: 0, worlds: freshWorlds(), crumbs: 0, crumbsAll: 0, asc: 0, shop: Array(SHOP.length).fill(0), unl: [true, false, false, false, false], lifeAll: 0, t: Date.now() });
  function load(){
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.worlds && d.worlds.length === WORLDS.length && d.shop && d.unl) { d.shop = SHOP.map((_, i) => d.shop[i] || 0); d.worlds.forEach(x => { x.b = x.b || Array(8).fill(0); x.up = x.up || {}; }); return d; }
    } catch (e) {}
    return fresh();
  }
  S = load();
  const save = () => { try { S.t = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  signal.addEventListener('abort', save);

  let P = { cps: [], click: [], each: [] }, frenzy = 0, cfren = 0, gold = null, goldT = 40 + Math.random() * 30, pulse = 0, fx = [], parts = [], tab = 0, bulk = 0, scroll = 0, sel = 0, cursorOn = false, confirmT = 0, banner = null, saveT = 5, calcT = 0, drag = null, msg = '', msgT = 0;
  const BULK = [1, 10, 100, 'Max'];
  function calc(){
    const cm = 1 + .02 * S.crumbsAll, sp = 1 + .1 * S.shop[1], buff = frenzy > 0 ? 7 : 1;
    for (let w = 0; w < WORLDS.length; w++) {
      const wd = S.worlds[w]; let g = 1, wb = 1, cp = 1, cl = 1, frac = 0;
      for (let k = 0; k < 5; k++) if (wd.up[w + 'g' + k]) g += .15;
      for (let v = 0; v < WORLDS.length; v++) if (v !== w) wb *= 1 + Math.log10(1 + S.worlds[v].life) * .02;
      for (let k = 0; k < 6; k++) if (wd.up[w + 'c' + k]) cl *= 2;
      for (let k = 0; k < 4; k++) if (wd.up[w + 'p' + k]) frac += .02;
      const each = []; let tot = 0;
      for (let i = 0; i < 8; i++) { let m = 1; for (let k = 0; k < 5; k++) if (wd.up[w + 'b' + i + 't' + k]) m *= 2; const e = BP[i] * F[w] * m * g * cm * sp * wb * buff; each.push(e); tot += e * wd.b[i]; }
      P.each[w] = each; P.cps[w] = tot; P.click[w] = (F[w] + tot * frac) * cl * (1 + .5 * S.shop[0]) * (cfren > 0 ? 20 : 1);
    }
  }
  calc();
  /* offline earnings */
  (function offline(){
    const el = Math.min((Date.now() - S.t) / 1000, 3600 * (1 + S.shop[5]) * 2), eff = .5 + .05 * S.shop[5];
    if (el > 30) { let add = []; P.cps.forEach((c, w) => { const g = c * el * eff; S.worlds[w].cur += g; S.worlds[w].life += g; S.lifeAll += g; if (g >= 1) add.push('+' + fmt(g) + ' ' + WORLDS[w].cur); }); if (add.length) banner = { t: 5, txt: 'While you were away: ' + add.slice(0, 2).join(', ') }; }
  })();

  const bcost = (w, i, owned) => BC[i] * F[w] * COSTM * Math.pow(.98, S.shop[4]) * Math.pow(1.15, owned);
  function bulkN(i){
    const wd = S.worlds[S.w], owned = wd.b[i], c0 = bcost(S.w, i, owned), sum = n => c0 * (Math.pow(1.15, n) - 1) / .15;
    let n = BULK[bulk];
    if (n === 'Max') { n = 0; while (n < 1000 && sum(n + 1) <= wd.cur) n++; if (n === 0) n = 1; }
    return { n, cost: sum(n) };
  }
  const ucost = u => u.cost * COSTM;
  const upList = () => UPS.filter(u => u.w === S.w && !S.worlds[S.w].up[u.id] && u.req()).sort((a, b) => a.cost - b.cost);
  const shopCost = i => Math.ceil(SHOP[i][3] * Math.pow(1.6, S.shop[i]));
  const runLife = () => S.worlds.reduce((s, x) => s + x.life, 0);
  const ascGain = () => Math.floor(Math.sqrt(runLife() / 1e7));
  const say = (t, x, y, col) => fx.push({ t: 1, s: t, x, y, col: col || '#fff' });

  function earn(w, v){ const wd = S.worlds[w]; wd.cur += v; wd.life += v; S.lifeAll += v; }
  const CX = W / 2, CY = 128, CR = 62;
  function click(x, y){
    const v = P.click[S.w]; earn(S.w, v); pulse = 1; beep(520 + rand(120), .015);
    say('+' + fmt(v), x + (Math.random() - .5) * 30, y - 10, WORLDS[S.w].chip === '#ffffff' ? '#fff' : '#ffe9b0');
    for (let i = 0; i < 3; i++) parts.push({ x, y, vx: (Math.random() - .5) * 160, vy: -60 - Math.random() * 120, t: .6 });
  }
  function grab(){
    if (!gold) return; const gt = 1 + .25 * S.shop[7], r = Math.random(); const gx = gold.x, gy = gold.y; gold = null; buzz('win');
    if (r < .45) { frenzy = 30 * gt; say('Frenzy! x7 for ' + Math.round(frenzy) + 's', gx, gy, '#ffd75c'); }
    else if (r < .75) { cfren = 15 * gt; say('Click frenzy! x20', gx, gy, '#ffd75c'); }
    else { const w = S.w, g = Math.min(S.worlds[w].cur * .15, P.cps[w] * 900) + 13 * F[w]; const gg = g * gt; earn(w, gg); say('Lucky! +' + fmt(gg), gx, gy, '#ffd75c'); }
    calc();
  }
  function buyBuilding(i){
    const wd = S.worlds[S.w], { n, cost } = bulkN(i);
    if (wd.cur < cost) { beep(120, .05); return; }
    wd.cur -= cost; wd.b[i] += n; calc(); beep(660, .05); buzz();
  }
  function act(it){ if (it && it.act) it.act(); }
  function items(){
    const wd = S.worlds[S.w], W0 = WORLDS[S.w], out = [];
    if (tab === 0) {
      let hi = -1; wd.b.forEach((n, i) => { if (n) hi = i; });
      for (let i = 0; i <= Math.min(7, hi + 1); i++) { const bn = bulkN(i); out.push({ icon: W0.b[i][1], title: W0.b[i][0] + '  ×' + wd.b[i], sub: fmt(P.each[S.w][i]) + '/s each · total ' + fmt(P.each[S.w][i] * wd.b[i]) + '/s', label: fmt(bn.cost), note: bn.n > 1 ? '×' + bn.n : '', ok: wd.cur >= bn.cost, act: () => buyBuilding(i) }); }
    } else if (tab === 1) {
      upList().forEach(u => { const c = ucost(u); out.push({ icon: '⬆️', title: u.name, sub: u.desc, label: fmt(c), ok: wd.cur >= c, act: () => { if (wd.cur < c) { beep(120, .05); return; } wd.cur -= c; wd.up[u.id] = 1; calc(); beep(880, .06); buzz('win'); } }); });
    } else if (tab === 2) {
      WORLDS.forEach((x, i) => {
        const unl = S.unl[i], cps = P.cps[i];
        if (unl) out.push({ icon: i === S.w ? '📍' : '🌍', title: x.name, sub: fmt(Math.floor(S.worlds[i].cur)) + ' ' + x.cur + ' · ' + fmt(cps) + '/s', label: i === S.w ? 'Here' : 'Go', ok: i !== S.w, act: () => { S.w = i; tab = 0; scroll = 0; sel = 0; beep(500, .05); } });
        else { const c = UC[i] * COSTM, prev = S.worlds[i - 1].cur; out.push({ icon: '🔒', title: x.name, sub: 'Costs ' + fmt(c) + ' ' + WORLDS[i - 1].cur, label: fmt(c), ok: S.unl[i - 1] && prev >= c, act: () => { if (!S.unl[i - 1] || S.worlds[i - 1].cur < c) { beep(120, .05); return; } S.worlds[i - 1].cur -= c; S.unl[i] = true; S.w = i; tab = 0; scroll = 0; buzz('win'); beep(880, .15); say('New world: ' + x.name, CX, CY, '#ffd75c'); } }); }
      });
    } else {
      const g = ascGain();
      out.push({ icon: '🌟', title: 'Ascend', sub: g >= 1 ? 'Reset the run for ' + g + ' crumbs (+2% output each, forever)' : 'Earn more to ascend (' + fmt(runLife()) + ' / 10M this run)', label: g >= 1 ? '+' + g : '—', ok: g >= 1, act: () => { if (g < 1) return; if (confirmT > 0) ascend(); else { confirmT = 3; msg = 'Press again to confirm. This resets worlds and upgrades.'; msgT = 3; } } });
      SHOP.forEach((s, i) => { const lvl = S.shop[i], mx = s[2], c = shopCost(i); out.push({ icon: '🍯', title: s[0] + '  Lv ' + lvl + '/' + mx, sub: s[1], label: lvl >= mx ? 'Max' : c + ' ◆', ok: lvl < mx && S.crumbs >= c, act: () => { if (lvl >= mx || S.crumbs < c) { beep(120, .05); return; } S.crumbs -= c; S.shop[i]++; calc(); beep(880, .06); buzz('win'); } }); });
    }
    return out;
  }
  function ascend(){
    const g = ascGain(); if (g < 1) return;
    S.crumbs += g; S.crumbsAll += g; S.asc++; S.worlds = freshWorlds();
    if (S.shop[2] > 0) S.worlds[0].cur = 1000 * Math.pow(5, S.shop[2]);
    S.unl = WORLDS.map((_, i) => i <= S.shop[6]); S.w = 0; tab = 0; scroll = 0; sel = 0; confirmT = 0; frenzy = cfren = 0; gold = null; calc(); save(); buzz('win'); beep(990, .3);
    banner = { t: 4, txt: 'Ascended! +' + g + ' crumbs' };
  }
  const RH = 54, LT = 272;
  const maxScroll = () => Math.max(0, items().length * RH - (H - LT - 4));
  function keepSel(n){ sel = clamp(sel, 0, Math.max(0, n - 1)); const y = sel * RH; if (y < scroll) scroll = y; if (y + RH > scroll + (H - LT)) scroll = y + RH - (H - LT); scroll = clamp(scroll, 0, Math.max(0, n * RH - (H - LT - 4))); }
  const TABS = ['Build', 'Upgrades', 'Worlds', 'Ascend'], TX = i => 6 + i * 68;
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e); capture(e); cursorOn = false;
    if (p.y < 236) { if (gold && Math.hypot(p.x - gold.x, p.y - gold.y) < 34) { grab(); return; } if (Math.hypot(p.x - CX, p.y - CY) < CR + 14) click(p.x, p.y); return; }
    if (p.y < LT - 2) {
      for (let i = 0; i < 4; i++) if (inRect(p, [TX(i), 240, 66, 28])) { tab = i; scroll = 0; sel = 0; beep(480, .03); }
      if (inRect(p, [TX(4), 240, 78, 28])) { bulk = (bulk + 1) % 4; beep(480, .03); }
      return;
    }
    drag = { y: p.y, s: scroll, moved: false, p };
  }, { signal });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const p = pt(e); if (Math.abs(p.y - drag.y) > 8) drag.moved = true; if (drag.moved) scroll = clamp(drag.s + (drag.y - p.y), 0, maxScroll()); }, { signal });
  const up = () => { if (drag && !drag.moved) { const it = items()[Math.floor((drag.p.y - LT + scroll) / RH)]; sel = Math.max(0, Math.floor((drag.p.y - LT + scroll) / RH)); act(it); } drag = null; };
  canvas.addEventListener('pointerup', up, { signal });
  canvas.addEventListener('pointercancel', () => { drag = null; }, { signal });

  loop(signal, (dt0) => {
    const dt = Math.min(dt0, .25);
    for (let w = 0; w < WORLDS.length; w++) if (P.cps[w] > 0) earn(w, P.cps[w] * dt);
    if (frenzy > 0) { frenzy -= dt; if (frenzy <= 0) calc(); }
    if (cfren > 0) { cfren -= dt; if (cfren <= 0) calc(); }
    calcT -= dt; if (calcT <= 0) { calc(); calcT = .5; }
    if (confirmT > 0) confirmT -= dt; if (msgT > 0) msgT -= dt;
    goldT -= dt; if (goldT <= 0 && !gold) { gold = { x: 40 + Math.random() * 280, y: 70 + Math.random() * 150, t: 13 }; goldT = (60 + Math.random() * 60) * Math.pow(.92, S.shop[3]); beep(1200, .08); }
    if (gold) { gold.t -= dt; if (gold.t <= 0) gold = null; }
    saveT -= dt; if (saveT <= 0) { save(); saveT = 5; }
    pulse = Math.max(0, pulse - dt * 6);
    fx.forEach(f => { f.t -= dt; f.y -= 40 * dt; }); fx = fx.filter(f => f.t > 0);
    parts.forEach(p => { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 400 * dt; }); parts = parts.filter(p => p.t > 0);
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    const sc = Math.floor(Math.log10(1 + S.lifeAll) * 100) + S.asc * 500; api.score(sc);

    const W0 = WORLDS[S.w], wd = S.worlds[S.w];
    clear(); ctx.fillStyle = W0.bg; ctx.fillRect(0, 0, W, 236);
    text(fmt(Math.floor(wd.cur)) + ' ' + W0.cur, W / 2, 18, 22, '#fff');
    text(fmt(P.cps[S.w]) + ' per second · ' + W0.name, W / 2, 40, 12, '#c8cdf0');
    if (S.crumbs > 0 || S.asc > 0) text('◆ ' + S.crumbs, 12, 14, 13, '#ffd75c', 'left');
    if (frenzy > 0) text('Frenzy x7 ' + Math.ceil(frenzy) + 's', W - 10, 14, 12, '#ffd75c', 'right');
    if (cfren > 0) text('Clicks x20 ' + Math.ceil(cfren) + 's', W - 10, 30, 12, '#ffd75c', 'right');
    const r = CR * (1 + pulse * .07);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 14; circle(CX, CY + 2, r, W0.col); ctx.restore();
    ctx.globalAlpha = .25; circle(CX - 12, CY - 14, r * .6, '#fff'); ctx.globalAlpha = 1;
    [[-30, -22, 7], [20, -34, 6], [34, 8, 8], [-8, 22, 7], [-36, 20, 6], [6, -4, 6], [-14, -44, 5]].forEach(c => circle(CX + c[0] * r / CR, CY + c[1] * r / CR, c[2] * r / CR, W0.chip));
    parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.t * 1.6); circle(p.x, p.y, 3, W0.col); }); ctx.globalAlpha = 1;
    if (gold) { const a = 1 + Math.sin(gold.t * 8) * .08; circle(gold.x, gold.y, 26 * a, '#ffd75c'); circle(gold.x, gold.y, 17 * a, '#fff2a8'); text('★', gold.x, gold.y + 1, 22, '#c98a00'); }
    fx.forEach(f => { ctx.globalAlpha = Math.min(1, f.t * 2); text(f.s, f.x, f.y, 15, f.col); }); ctx.globalAlpha = 1;
    if (banner) { rr(10, 196, W - 20, 28, 8, 'rgba(0,0,0,.65)'); text(banner.txt, W / 2, 211, 12, '#ffe9b0'); }
    if (msgT > 0) { rr(10, 196, W - 20, 28, 8, 'rgba(0,0,0,.65)'); text(msg, W / 2, 211, 11, '#ff9a8a'); }

    const its = items(); sel = clamp(sel, 0, Math.max(0, its.length - 1)); scroll = clamp(scroll, 0, Math.max(0, its.length * RH - (H - LT - 4)));
    const upN = upList().filter(u => wd.cur >= ucost(u)).length;
    for (let i = 0; i < 4; i++) { rr(TX(i), 240, 66, 28, 9, tab === i ? '#3b4380' : '#1c2147'); text(TABS[i] + (i === 1 && upN ? ' ' + upN : ''), TX(i) + 33, 255, 12, tab === i ? '#fff' : '#9aa0cf'); }
    rr(TX(4), 240, 78, 28, 9, '#2c3566'); text('Buy ' + BULK[bulk], TX(4) + 39, 255, 12, '#fff');
    ctx.save(); ctx.beginPath(); ctx.rect(0, LT, W, H - LT); ctx.clip();
    if (!its.length) text('Nothing new yet. Keep baking.', W / 2, LT + 40, 14, '#6c73a6');
    its.forEach((it, i) => {
      const y = LT + i * RH - scroll; if (y > H || y + RH < LT) return;
      rr(8, y + 2, W - 16, RH - 6, 10, '#1d2347');
      if (cursorOn && i === sel) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(8, y + 2, W - 16, RH - 6, 10); ctx.stroke(); }
      text(it.icon, 30, y + 26, 22);
      text(it.title, 54, y + 18, 14, '#fff', 'left'); text(it.sub, 54, y + 37, 11, '#9aa0cf', 'left');
      rr(W - 92, y + 10, 78, 30, 8, it.ok ? '#2f7a5a' : '#2a2f58'); text(it.label, W - 53, y + 25, 13, it.ok ? '#fff' : '#7c83b8');
      if (it.note) text(it.note, W - 20, y + 8, 10, '#9aa0cf');
    });
    ctx.restore();
  });
  return {
    dir: d => { cursorOn = true; if (d === 'l') { tab = (tab + 3) % 4; scroll = 0; sel = 0; } else if (d === 'r') { tab = (tab + 1) % 4; scroll = 0; sel = 0; } else if (d === 'u') sel--; else sel++; keepSel(items().length); },
    a: () => { if (gold) grab(); else click(CX + (Math.random() - .5) * 40, CY - 20); },
    x: () => { cursorOn = true; const its = items(); act(its[clamp(sel, 0, its.length - 1)]); },
    y: () => { let n = S.w; do { n = (n + 1) % WORLDS.length; } while (!S.unl[n]); S.w = n; tab = 0; scroll = 0; sel = 0; beep(500, .05); },
    dbg: () => ({ S, P, calc, click, grab, items, ascend, setGold: () => { gold = { x: 100, y: 120, t: 5 }; }, UPS, fmt })
  };
}
