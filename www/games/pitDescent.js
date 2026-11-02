/* ---------------- PIT DESCENT (3D incremental: descend a glowing cave, visit stations, dig fossils, farm worms, beat bosses, rebirth) ---------------- */
function pitDescent(api, signal, lv){
  const KEY = 'pa_pitdescent_v2', COSTM = [.8, 1, 1.25][lv];
  const LN = ['Dirt', 'Clay', 'Stone', 'Cavern', 'Crystal', 'Magma', 'Mantle', 'Core', 'Void'];
  const LGATE = [60, 130, 220, 330, 460, 620, 800, 1000, 1e9];
  const LCOL = [[176, 84, 46], [150, 88, 62], [104, 112, 126], [78, 70, 112], [56, 140, 156], [170, 64, 36], [130, 56, 106], [196, 104, 36], [44, 32, 84]];
  const BOSS = ['Mole King', 'Clay Golem', 'Granite Beast', 'Cave Warden', 'Crystal Wyrm', 'Magma Drake', 'Mantle Titan', 'Core Sentinel', 'The Void'];
  const FOS = ['Seed pod', 'Shell', 'Rib bone', 'Cave claw', 'Crystal tooth', 'Fire fern', 'Giant skull', 'Core relic', 'Void shard'];
  const SHY = ['Amber Drop', 'Clay Pearl', 'Granite Eye', 'Echo Stone', 'Aqua Gem', 'Ember Heart', 'Mantle Pearl', 'Core Spark', 'Void Star'];
  const NODES = [
    { t: 'Body', n: 'Legs', i: '🦵', base: 12, g: 1.15, d: '+1 cash per second per level', req: null },
    { t: 'Body', n: 'Boots', i: '🥾', base: 200, g: 1.25, d: 'Cash per second +10% per level', req: [0, 5] },
    { t: 'Body', n: 'Stomp', i: '👣', base: 20, g: 1.18, d: 'Each tap gives +2 cash', req: null },
    { t: 'Body', n: 'Momentum', i: '⚡', base: 1500, g: 1.3, d: 'Cash +1% per metre of depth, per level', req: [1, 3] },
    { t: 'Dig', n: 'Pickaxe', i: '⛏️', base: 40, g: 1.16, d: 'Dig damage +1 per level', req: null },
    { t: 'Dig', n: 'Quick Hands', i: '🧤', base: 300, g: 1.25, d: 'Dig 6% faster per level', req: [4, 5] },
    { t: 'Dig', n: 'Fossil Sense', i: '🔎', base: 150, g: 1.22, d: 'Find fossils +4% more often', req: null },
    { t: 'Dig', n: 'Brute Force', i: '💪', base: 2500, g: 1.3, d: 'Boss damage +25% per level', req: [4, 10] },
    { t: 'Luck', n: 'Luck', i: '🍀', base: 500, g: 1.3, d: 'Shinies +0.5% chance per level', req: null },
    { t: 'Luck', n: 'Collector', i: '🧺', base: 400, g: 1.25, d: 'Fossils worth +20% per level', req: null },
    { t: 'Luck', n: 'Shiny Polish', i: '✨', base: 5000, g: 1.35, d: 'Shinies +10% stronger per level', req: [8, 5] },
    { t: 'Luck', n: 'Auto-dig', i: '🤖', base: 3000, g: 1.3, d: 'Digs by itself, faster each level', req: [5, 3] }
  ];
  const WNODES = [
    { n: 'Worm Farm', i: '🪱', d: '+1 worm per second per level', base: 300, g: 1.3, cur: 'cash' },
    { n: 'Worm Value', i: '💰', d: 'Worms boost cash +50% more per level', base: 60, g: 1.4, cur: 'worms' },
    { n: 'Golden Worms', i: '🌟', d: 'Chance of a golden worm (+5% cash each)', base: 120, g: 1.45, cur: 'worms' }
  ];
  const PAD_KINDS = { cash: 'x2 Cash', fos: 'x2 Fossil Luck', worm: 'x2 Worm Value', dig: 'Dig +50% speed', shy: 'x2 Shiny Luck' };
  const PADS = [];
  [['cash', 0], ['fos', 0], ['cash', 1], ['worm', 1], ['dig', 1], ['cash', 2], ['fos', 2], ['shy', 2], ['cash', 3], ['worm', 3], ['dig', 3], ['cash', 4], ['fos', 4], ['shy', 4], ['cash', 5], ['cash', 6]].forEach((p, i) => {
    PADS.push({ id: 'pad' + i, kind: p[0], name: PAD_KINDS[p[0]] + (i > 4 ? ' ' + 'I'.repeat(Math.min(3, Math.floor(i / 5))) : ''), layer: p[1], cost: 150 * Math.pow(5.2, i) });
  });
  const TITLES = [
    ['Digger', 'Reach 10 m', () => S.best >= 10], ['Fossil Fan', 'Collect 50 fossil power', () => S.fp >= 50], ['Worm Whisperer', 'Gather 200 worms', () => S.wormsAll >= 200], ['Deep Diver', 'Reach 130 m', () => S.best >= 130],
    ['Boss Slayer', 'Beat a boss', () => S.beaten >= 0], ['Shiny Hunter', 'Find 3 shinies', () => S.shy.reduce((a, b) => a + b, 0) >= 3], ['Reborn', 'Rebirth once', () => S.rebirths >= 1], ['Core Walker', 'Beat 7 bosses', () => S.beaten >= 6]
  ];
  const STN = [];
  for (let l = 0; l < 9; l++) {
    const lo = l ? LGATE[l - 1] : 0;
    if (l === 0) STN.push({ id: 'surface', k: 'surface', n: 'The Surface', l: 0, at: 0 }, { id: 'upgrades', k: 'upgrades', n: 'Upgrades', l: 0, at: 8 });
    STN.push({ id: 'fossils' + l, k: 'fossils', n: LN[l] + ' Fossils', l, at: l ? lo + 6 : 14 });
    if (l === 0) STN.push({ id: 'worms', k: 'worms', n: 'Worms', l: 0, at: 24 }, { id: 'tree', k: 'tree', n: 'Upgrade Tree', l: 0, at: 34 }, { id: 'titles', k: 'titles', n: 'Titles', l: 0, at: 44 });
    if (l < 8) STN.push({ id: 'boss' + l, k: 'boss', n: 'Boss: ' + BOSS[l], l, at: LGATE[l] });
  }
  const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n){
    if (!isFinite(n)) return '∞'; if (n < 1000) return n < 10 ? n.toFixed(1).replace(/\.0$/, '') : String(Math.floor(n));
    const e = Math.floor(Math.log10(n) / 3); if (e >= SUF.length) return n.toExponential(2).replace('+', '');
    const v = n / Math.pow(1000, e); return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + SUF[e];
  }
  const fresh = () => ({ steps: 0, bought: 0, lvl: Array(12).fill(0), wl: [0, 0, 0], fp: 0, fos: Array(9).fill(0), shy: Array(9).fill(0), worms: 0, wormsAll: 0, golden: 0, pads: {}, title: '', auto: false, stn: 'surface', rp: 0, rebirths: 0, boss: -1, bossHp: 0, bossT: 0, beaten: -1, all: 0, best: 0, t: Date.now() });
  let S = (() => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.lvl && d.lvl.length === 12 && d.fos && d.wl) return Object.assign(fresh(), d); } catch (e) {} return fresh(); })();
  const save = () => { try { S.t = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  signal.addEventListener('abort', save);
  const layerOf = d => { let i = 0; while (i < 8 && d > LGATE[i]) i++; return i; };
  const depth = () => S.bought;
  const padN = k => PADS.filter(p => p.kind === k && S.pads[p.id]).length;
  const P = {};
  function calc(){
    const L = S.lvl, shyM = 1 + .25 * S.shy.reduce((a, b) => a + b, 0) * (1 + .1 * L[10]), fosM = 1 + .01 * S.fp, rpM = 1 + .15 * S.rp, mom = 1 + .01 * L[3] * depth();
    const wormM = 1 + S.worms * .001 * (1 + .5 * S.wl[1]) * Math.pow(2, padN('worm')), goldM = 1 + .05 * S.golden;
    const mult = shyM * fosM * rpM * mom * wormM * goldM * Math.pow(2, padN('cash'));
    P.sps = L[0] * Math.pow(1.1, L[1]) * mult; P.tap = (1 + 2 * L[2]) * Math.max(1, mult * .5);
    P.dmg = (1 + L[4]) * Math.pow(1.25, L[7]) * rpM; P.cd = Math.max(.12, .8 * Math.pow(.94, L[5]) * Math.pow(.67, padN('dig')));
    P.fch = Math.min(.9, .15 + .04 * L[6]); P.shch = (.01 + .005 * L[8]) * Math.pow(2, padN('shy')); P.fv = (1 + .2 * L[9]) * Math.pow(2, padN('fos'));
    P.auto = L[11] > 0 ? Math.max(.4, 3 - .2 * L[11]) : 0; P.layer = layerOf(depth()); P.mult = mult; P.wps = S.wl[0] * (1 + .1 * padN('worm'));
  }
  calc();
  const nodeCost = (i, l) => NODES[i].base * Math.pow(NODES[i].g, l) * COSTM;
  const stepCost = n => 10 * Math.pow(1.11, n) * COSTM;
  const locked = i => { const r = NODES[i].req; return r && S.lvl[r[0]] < r[1]; };
  const nextBoss = () => S.beaten + 1;
  const gated = () => nextBoss() < 8 && depth() >= LGATE[nextBoss()];
  const stn = id => STN.find(s => s.id === (id || S.stn)) || STN[0];
  const unlocked = s => depth() >= s.at || S.best >= s.at;
  (function off(){ const el = Math.min((Date.now() - S.t) / 1000, 7200); if (el > 30) { calc(); const g = P.sps * el * .5, w = P.wps * el * .5; S.steps += g; S.all += g; S.worms += w; S.wormsAll += w; } })();

  const BULK = [1, 10, 100, 'Max'];
  let bulk = 0, scroll = 0, sel = 0, cursorOn = false, confirmT = 0, msg = '', msgT = 0, saveT = 5, calcT = 0, drag = null, fx = [], marks = [], digT = 0, autoT = 0, autoB = 0, yaw = 0, camD = depth(), pulse = 0, shake = 0, bobT = 0, bob = 0, banner = 2.5, wormT = 0, camY = 0;
  let modal = false, mscroll = 0, msel = 0;
  const say = (t, x, y, c) => fx.push({ t: 1, s: t, x, y, c: c || '#fff' });
  function bulkCount(cost1, cur, wallet){ let n = BULK[bulk]; if (n === 'Max') { n = 0; let s = 0; while (n < 400) { const c = cost1(cur + n); if (s + c > wallet) break; s += c; n++; } if (n === 0) n = 1; } let tot = 0; for (let k = 0; k < n; k++) tot += cost1(cur + k); return { n, cost: tot }; }
  function dig(){
    const st = stn(); if (st.k !== 'fossils' && st.k !== 'boss') return;
    if (digT > 0) return;
    if (st.k === 'boss') {
      if (S.boss < 0 && gated() && st.l === nextBoss()) startBoss();
      if (S.boss < 0) return;
      digT = P.cd; pulse = 1; shake = .12; beep(220 + rand(60), .03);
      const d = P.dmg; S.bossHp -= d; say('-' + fmt(d), 170 + (Math.random() - .5) * 80, 130, '#ff9a8a'); if (S.bossHp <= 0) winBoss(); return;
    }
    digT = P.cd; pulse = 1; shake = .12; beep(220 + rand(60), .03);
    const l = st.l;
    if (Math.random() < P.fch) { const v = (1 + l) * P.fv; S.fos[l]++; S.fp += v; say(FOS[l] + ' +' + fmt(v), 170, 140, '#efe6cf'); marks.push({ e: '🦴', a: Math.random() * 6.28, y: 2 + Math.random() * 4, t: 3 }); calc(); }
    if (Math.random() < P.shch) { S.shy[l]++; say('SHINY: ' + SHY[l], 170, 108, '#7df3ff'); marks.push({ e: '💎', a: Math.random() * 6.28, y: 3, t: 4 }); buzz('win'); beep(1000, .12); calc(); }
  }
  function winBoss(){ const l = S.boss; S.boss = -1; S.beaten = l; const f = (l + 1) * 25 * P.fv; S.fp += f; S.fos[l] += 3; msg = BOSS[l] + ' defeated! +' + fmt(f) + ' fossil power'; msgT = 3; buzz('win'); beep(880, .25); calc(); }
  function startBoss(){ const l = nextBoss(); if (l > 7) return; S.boss = l; S.bossHp = 60 * Math.pow(4.2, l); S.bossT = 50; msg = BOSS[l] + ' blocks the way!'; msgT = 3; buzz('over'); S.stn = 'boss' + l; scroll = 0; sel = 0; banner = 2.5; }
  function stomp(x, y){ S.steps += P.tap; S.all += P.tap; say('+' + fmt(P.tap), x + (Math.random() - .5) * 30, y - 6, '#bfffbf'); beep(400 + rand(80), .01); }
  function buyStep(){
    if (S.boss >= 0) { msg = 'Defeat ' + BOSS[S.boss] + ' first'; msgT = 2; beep(120, .05); return; }
    if (gated()) { startBoss(); return; }
    const { n } = bulkCount(stepCost, S.bought, S.steps);
    const cap = nextBoss() < 8 ? LGATE[nextBoss()] : 1e9, nn = Math.min(n, cap - S.bought); if (nn < 1) return;
    let c = 0; for (let k = 0; k < nn; k++) c += stepCost(S.bought + k); if (S.steps < c) { beep(120, .05); return; }
    S.steps -= c; S.bought += nn; S.best = Math.max(S.best, S.bought); calc(); beep(300, .04); buzz();
    if (gated()) startBoss();
  }
  function buyNode(i){ if (locked(i)) { beep(120, .05); return; } const { n, cost } = bulkCount(l => nodeCost(i, l), S.lvl[i], S.steps); if (S.steps < cost) { beep(120, .05); return; } S.steps -= cost; S.lvl[i] += n; calc(); beep(660, .05); buzz(); }
  function buyW(i){ const w = WNODES[i], c = w.base * Math.pow(w.g, S.wl[i]) * COSTM, cash = w.cur === 'cash'; if ((cash ? S.steps : S.worms) < c) { beep(120, .05); return; } if (cash) S.steps -= c; else S.worms -= c; S.wl[i]++; calc(); beep(660, .05); buzz(); }
  function buyPad(p){ const c = p.cost * COSTM; if (S.pads[p.id] || S.steps < c) { beep(120, .05); return; } S.steps -= c; S.pads[p.id] = 1; calc(); beep(880, .08); buzz('win'); say(p.name, W / 2, 200, '#bfffbf'); }
  const rpGain = () => Math.floor(S.best / 60);
  function rebirth(){ const g = rpGain(); if (g < 1) return; S.rp += g; S.rebirths++; S.steps = 0; S.bought = 0; S.best = 0; S.lvl = Array(12).fill(0); S.wl = [0, 0, 0]; S.pads = {}; S.boss = -1; S.beaten = -1; S.stn = 'surface'; confirmT = 0; camD = 0; calc(); save(); buzz('win'); beep(990, .3); msg = 'Reborn! +' + g + ' rebirth power'; msgT = 3; }
  function teleport(id){ const s = stn(id); if (!s || s.id !== id || !unlocked(s)) { beep(120, .05); return; } S.stn = s.id; modal = false; scroll = 0; sel = 0; banner = 2.5; beep(700, .08); buzz(); }
  const pct = s => {
    if (s.k === 'surface') return Math.round(100 * Math.min(1, depth() / LGATE[Math.min(7, P.layer)]));
    if (s.k === 'upgrades') return Math.round(100 * PADS.filter(p => S.pads[p.id]).length / PADS.length);
    if (s.k === 'fossils') return Math.round(100 * Math.min(1, S.fos[s.l] / 40));
    if (s.k === 'worms') return Math.round(100 * Math.min(1, S.wl.reduce((a, b) => a + b, 0) / 30));
    if (s.k === 'tree') return Math.round(100 * S.lvl.reduce((a, b) => a + Math.min(10, b), 0) / 120);
    if (s.k === 'titles') return Math.round(100 * TITLES.filter(t => t[2]()).length / TITLES.length);
    return S.beaten >= s.l ? 100 : 0;
  };
  const bulkRow = () => ({ icon: '🔢', title: 'Buy amount: ×' + BULK[bulk], sub: 'Select to change (1, 10, 100, Max)', label: '', ok: false, act: () => { bulk = (bulk + 1) % 4; beep(480, .03); } });
  const none = () => {};
  const availPads = () => PADS.filter(p => !S.pads[p.id] && p.layer <= P.layer).sort((a, b) => a.cost - b.cost);
  function items(){
    const out = [], st = stn(), wd = S.wl;
    if (st.k === 'surface') {
      const b = bulkCount(stepCost, S.bought, S.steps), g = rpGain();
      out.push(bulkRow());
      out.push({ icon: '👣', title: 'Buy steps  (' + depth() + ' m)', sub: S.boss >= 0 ? 'Blocked by ' + BOSS[S.boss] : gated() ? 'Boss ahead. Press to challenge' : LN[P.layer] + ' layer · boss at ' + (nextBoss() < 8 ? LGATE[nextBoss()] + ' m' : '—'), label: fmt(b.cost), note: b.n > 1 ? '×' + b.n : '', ok: S.steps >= b.cost || gated(), act: buyStep });
      out.push({ icon: '🔁', title: 'Rebirth', sub: g >= 1 ? 'Reset for ' + g + ' power (+15% each). Fossils stay.' : 'Reach 60 m (best ' + S.best + ' m)', label: g >= 1 ? '+' + g : '—', ok: g >= 1, act: () => { if (g < 1) return; if (confirmT > 0) rebirth(); else { confirmT = 3; msg = 'Press again to confirm. This resets the run.'; msgT = 3; } } });
      out.push({ icon: '📈', title: 'Total power x' + P.mult.toFixed(2), sub: 'Rebirths ' + S.rebirths + ' · best ' + S.best + ' m', label: '', ok: false, act: none });
    } else if (st.k === 'upgrades') {
      availPads().forEach(p => { const c = p.cost * COSTM; out.push({ icon: '🟩', title: p.name, sub: 'Walk-up pad · ' + LN[p.layer] + ' layer', label: fmt(c), ok: S.steps >= c, act: () => buyPad(p) }); });
      if (!out.length) out.push({ icon: '✅', title: 'All pads owned here', sub: 'Dive deeper for more pads', label: '', ok: false, act: none });
    } else if (st.k === 'fossils') {
      out.push({ icon: '⛏️', title: 'Dig ' + FOS[st.l] + 's', sub: 'Tap the view or press A · find ' + Math.round(P.fch * 100) + '% · shiny ' + (P.shch * 100).toFixed(1) + '%', label: digT > 0 ? '...' : 'Dig', ok: digT <= 0, act: dig });
      for (let l = 0; l <= Math.min(8, P.layer); l++) out.push({ icon: '🦴', title: FOS[l] + ' ×' + S.fos[l], sub: 'Shiny: ' + SHY[l] + ' ×' + S.shy[l], label: '', ok: false, act: none });
    } else if (st.k === 'worms') {
      WNODES.forEach((w, i) => { const c = w.base * Math.pow(w.g, wd[i]) * COSTM, cash = w.cur === 'cash'; out.push({ icon: w.i, title: w.n + '  Lv ' + wd[i], sub: w.d, label: fmt(c) + (cash ? '' : ' 🪱'), ok: (cash ? S.steps : S.worms) >= c, act: () => buyW(i) }); });
      out.push({ icon: '🪱', title: fmt(S.worms) + ' worms · ' + fmt(P.wps) + ' per second', sub: 'Golden worms ' + S.golden + ' (+' + (S.golden * 5) + '% cash)', label: '', ok: false, act: none });
    } else if (st.k === 'tree') {
      out.push(bulkRow());
      NODES.forEach((nd, i) => { const lk = locked(i), b = bulkCount(l => nodeCost(i, l), S.lvl[i], S.steps); out.push({ icon: lk ? '🔒' : nd.i, title: nd.t + ': ' + nd.n + '  Lv ' + S.lvl[i], sub: lk ? 'Needs ' + NODES[nd.req[0]].n + ' Lv ' + nd.req[1] : nd.d, label: lk ? 'Locked' : fmt(b.cost), note: !lk && b.n > 1 ? '×' + b.n : '', ok: !lk && S.steps >= b.cost, act: () => buyNode(i) }); });
    } else if (st.k === 'titles') {
      TITLES.forEach(t => { const got = t[2](), eq = S.title === t[0]; out.push({ icon: got ? '🏷️' : '🔒', title: t[0], sub: t[1], label: eq ? 'On' : got ? 'Equip' : '—', ok: got && !eq, act: () => { if (got) { S.title = eq ? '' : t[0]; beep(660, .05); } } }); });
    } else {
      const l = st.l, b = S.boss === l;
      out.push({ icon: '🐉', title: BOSS[l], sub: S.beaten >= l ? 'Defeated' : b ? 'HP ' + fmt(Math.max(0, S.bossHp)) + ' · ' + Math.ceil(S.bossT) + ' s left' : gated() && nextBoss() === l ? 'Ready. Press to fight' : 'Reach ' + LGATE[l] + ' m to challenge', label: S.beaten >= l ? 'Done' : 'Fight', ok: (S.beaten < l && gated() && nextBoss() === l) || b, act: dig });
      out.push({ icon: '⛏️', title: 'Damage ' + fmt(P.dmg) + ' per hit', sub: 'Tap the view or press A to attack', label: '', ok: false, act: none });
    }
    return out;
  }
  /* ----- software 3D: cracked square shaft seen from inside, lit by glowing mushrooms ----- */
  const VX = W / 2, VY = 150, F = 250, SH = 4, RH = 3, RINGS = 30, VH = 292;
  function cam(p){
    const sy = Math.sin(yaw), cyw = Math.cos(yaw), x1 = p[0] * cyw - p[2] * sy, z1 = p[0] * sy + p[2] * cyw, y = p[1] - camY - bob;
    const sp = Math.sin(1.18), cp = Math.cos(1.18);
    return [x1, y * cp + z1 * sp, -y * sp + z1 * cp];
  }
  function clipNear(poly){
    const out = [], N = .25;
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], ain = a[2] > N, bin = b[2] > N;
      if (ain) out.push(a);
      if (ain !== bin) { const t = (N - a[2]) / (b[2] - a[2]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, N]); } }
    return out;
  }
  const scr = c => [VX + c[0] / c[2] * F, VY - c[1] / c[2] * F];
  const hash = n => { let h = (n * 374761393 + 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function quad(pts, col, seed){
    const cc = pts.map(cam), c = clipNear(cc); if (c.length < 3) return;
    let z = 0; c.forEach(v => { z += v[2]; }); z /= c.length;
    const f = Math.max(0, 1 - z / 34), sc = c.map(scr);
    ctx.fillStyle = 'rgb(' + Math.floor(col[0] * f) + ',' + Math.floor(col[1] * f) + ',' + Math.floor(col[2] * f) + ')'; ctx.beginPath(); sc.forEach((s, i) => i ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1])); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,' + (.4 * f) + ')'; ctx.lineWidth = 1; ctx.stroke();
    if (c.length === 4 && cc.every(v => v[2] > .5) && f > .15) {
      const bil = (u, v) => [(1 - u) * (1 - v) * sc[0][0] + u * (1 - v) * sc[1][0] + u * v * sc[2][0] + (1 - u) * v * sc[3][0], (1 - u) * (1 - v) * sc[0][1] + u * (1 - v) * sc[1][1] + u * v * sc[2][1] + (1 - u) * v * sc[3][1]];
      ctx.strokeStyle = 'rgba(30,10,0,' + (.5 * f) + ')'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let k = 0; k < 3; k++) { let u = hash(seed * 7 + k), v = hash(seed * 11 + k * 3); const p0 = bil(u, v); ctx.moveTo(p0[0], p0[1]); for (let s = 0; s < 3; s++) { u = clamp(u + (hash(seed * 13 + k * 5 + s) - .5) * .3, 0, 1); v = clamp(v + (hash(seed * 17 + k * 5 + s) - .4) * .3, 0, 1); const p1 = bil(u, v); ctx.lineTo(p1[0], p1[1]); } }
      ctx.stroke();
    }
  }
  function mushroom(wp, sz){
    const c = cam(wp); if (c[2] < .6) return; const s = scr(c), k = Math.min(1.6, 5.5 / c[2]) * sz, f = Math.max(0, 1 - c[2] / 34);
    ctx.globalAlpha = f; const gl = ctx.createRadialGradient(s[0], s[1] - 8 * k, 1, s[0], s[1] - 8 * k, 22 * k); gl.addColorStop(0, 'rgba(255,150,50,.55)'); gl.addColorStop(1, 'rgba(255,150,50,0)'); ctx.fillStyle = gl; ctx.fillRect(s[0] - 24 * k, s[1] - 30 * k, 48 * k, 48 * k);
    ctx.fillStyle = '#d9c7a0'; ctx.fillRect(s[0] - 2.5 * k, s[1] - 9 * k, 5 * k, 10 * k);
    ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.ellipse(s[0], s[1] - 10 * k, 10 * k, 6 * k, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffd08a'; ctx.beginPath(); ctx.arc(s[0] - 3 * k, s[1] - 12 * k, 1.5 * k, 0, TAU); ctx.arc(s[0] + 3 * k, s[1] - 13 * k, 1.2 * k, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  function spore(wp){ const c = cam(wp); if (c[2] < .6) return; const s = scr(c), r = Math.min(7, 40 / c[2]), f = Math.max(0, 1 - c[2] / 34); ctx.globalAlpha = f; const g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], r * 2.4); g.addColorStop(0, 'rgba(120,255,255,.95)'); g.addColorStop(1, 'rgba(60,220,255,0)'); ctx.fillStyle = g; ctx.fillRect(s[0] - r * 2.4, s[1] - r * 2.4, r * 4.8, r * 4.8); ctx.globalAlpha = 1; }

  const UI = { tele: [8, 98, 46, 46], fos: [8, 150, 46, 46], auto: [W / 2 - 52, 266, 104, 22], mbtn: [250, 296, 100, 22], tbtn: [140, 296, 104, 22] };
  const LT = 324, RH2 = 54, VIS = H - LT;
  const maxScroll = () => Math.max(0, items().length * RH2 - VIS);
  const padRects = () => stn().k === 'upgrades' ? availPads().slice(0, 3).map((p, i) => ({ p, r: [10 + i * 116, 214, 108, 46] })) : [];
  const mTop = 54, mH = H - 70;
  function mlayout(){
    const rows = [], tiles = []; let y = 0;
    for (let l = 0; l <= Math.min(8, P.layer + 1); l++) {
      rows.push({ y, l }); y += 28;
      const ss = STN.filter(s => s.l === l);
      ss.forEach((s, i) => { tiles.push({ s, x: 14 + (i % 3) * 108, y: y + Math.floor(i / 3) * 70, w: 102, h: 64 }); });
      y += Math.ceil(ss.length / 3) * 70 + 8;
    }
    return { rows, tiles, total: y };
  }
  const tileRect = t => [t.x, mTop + 8 + t.y - mscroll, t.w, t.h];
  const mMax = () => Math.max(0, mlayout().total - mH + 12);
  const openTiles = () => mlayout().tiles.filter(t => unlocked(t.s));
  function openModal(){ modal = true; mscroll = 0; const tl = openTiles(); msel = Math.max(0, tl.findIndex(t => t.s.id === S.stn)); const t = tl[msel]; if (t) mscroll = clamp(t.y - 90, 0, mMax()); }
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e); capture(e); cursorOn = false;
    if (modal) { drag = { y: p.y, s: mscroll, moved: false, p, m: true }; return; }
    if (inRect(p, UI.tele) || inRect(p, UI.tbtn)) { openModal(); return; }
    if (inRect(p, UI.fos)) { teleport('fossils' + Math.min(P.layer, 8)); return; }
    if (inRect(p, UI.auto)) { S.auto = !S.auto; beep(S.auto ? 800 : 400, .05); return; }
    if (inRect(p, UI.mbtn)) { bulk = (bulk + 1) % 4; beep(480, .03); return; }
    for (const q of padRects()) if (inRect(p, q.r)) { buyPad(q.p); return; }
    if (p.y < VH) { drag = { x: p.x, yaw, moved: false, view: true, p }; return; }
    if (p.y < LT) return;
    drag = { y: p.y, s: scroll, moved: false, p };
  }, { signal });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return; const p = pt(e);
    if (drag.view) { if (Math.abs(p.x - drag.x) > 8) drag.moved = true; if (drag.moved) yaw = drag.yaw + (p.x - drag.x) * .01; return; }
    if (Math.abs(p.y - drag.y) > 8) drag.moved = true;
    if (drag.moved) { if (drag.m) mscroll = clamp(drag.s + (drag.y - p.y), 0, mMax()); else scroll = clamp(drag.s + (drag.y - p.y), 0, maxScroll()); }
  }, { signal });
  const up = () => {
    if (drag && !drag.moved) {
      const p = drag.p;
      if (drag.m) {
        if (inRect(p, [W - 52, 14, 40, 36]) || p.x < 8 || p.x > W - 8 || p.y < 8) modal = false;
        else for (const t of mlayout().tiles) if (inRect(p, tileRect(t)) && p.y > mTop + 4) { teleport(t.s.id); break; }
      } else if (drag.view) { stomp(p.x, p.y); dig(); }
      else { const i = Math.floor((p.y - LT + scroll) / RH2), it = items()[i]; if (it) { sel = i; cursorOn = false; if (it.act) it.act(); } }
    }
    drag = null;
  };
  canvas.addEventListener('pointerup', up, { signal }); canvas.addEventListener('pointercancel', () => { drag = null; }, { signal });
  function keepSel(n){ sel = clamp(sel, 0, Math.max(0, n - 1)); const y = sel * RH2; if (y < scroll) scroll = y; if (y + RH2 > scroll + VIS) scroll = y + RH2 - VIS; scroll = clamp(scroll, 0, Math.max(0, n * RH2 - VIS)); }
  const unlockedList = () => STN.filter(unlocked);
  camY = -depth() * RH * .4;

  loop(signal, dt0 => {
    const dt = Math.min(dt0, .25);
    S.steps += P.sps * dt; S.all += P.sps * dt;
    if (digT > 0) digT -= dt;
    wormT += dt; if (wormT >= 1) { wormT -= 1; if (P.wps > 0) { S.worms += P.wps; S.wormsAll += P.wps; if (Math.random() < .004 * S.wl[2] * 25) { S.golden++; say('Golden worm!', 180, 90, '#ffd75c'); beep(1000, .1); } calc(); } }
    const k0 = stn().k;
    if (P.auto && (k0 === 'fossils' || k0 === 'boss')) { autoT -= dt; if (autoT <= 0) { autoT = P.auto; digT = 0; dig(); } }
    if (S.auto) { autoB -= dt; if (autoB <= 0) { autoB = .5; const c = stepCost(S.bought); if (S.boss < 0 && !gated() && S.steps >= c) { S.steps -= c; S.bought++; S.best = Math.max(S.best, S.bought); calc(); if (gated()) startBoss(); } if (k0 === 'fossils' || k0 === 'boss') { digT = 0; dig(); } } }
    if (S.boss >= 0) { S.bossT -= dt; if (S.bossT <= 0) { S.bossHp = 60 * Math.pow(4.2, S.boss); S.bossT = 50; msg = BOSS[S.boss] + ' healed. Hit harder!'; msgT = 2; } }
    if (confirmT > 0) confirmT -= dt; if (msgT > 0) msgT -= dt; if (banner > 0) banner -= dt;
    calcT -= dt; if (calcT <= 0) { calc(); calcT = .5; } saveT -= dt; if (saveT <= 0) { save(); saveT = 5; }
    if (!drag || !drag.moved) yaw += .1 * dt;
    const s0 = stn(), tgtD = s0.k === 'surface' ? depth() : Math.min(depth(), s0.at);
    camD += (tgtD - camD) * Math.min(1, dt * 2.5); camY = -camD * RH * .4;
    pulse = Math.max(0, pulse - dt * 5); shake = Math.max(0, shake - dt); bobT += dt; bob = Math.sin(bobT * 2) * .15 + (shake ? (Math.random() - .5) * shake * 2 : 0);
    fx.forEach(f => { f.t -= dt; f.y -= 36 * dt; }); fx = fx.filter(f => f.t > 0); marks.forEach(m => { m.t -= dt; }); marks = marks.filter(m => m.t > 0);
    api.score(Math.floor(Math.log10(1 + S.all) * 80) + S.best * 4 + S.rebirths * 400 + Math.floor(S.fp));

    clear();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, VH); ctx.clip();
    ctx.fillStyle = '#06080f'; ctx.fillRect(0, 0, W, VH);
    const baseRing = Math.floor(-camY / RH) - 4, polys = [], cn = [[-SH, -SH], [SH, -SH], [SH, SH], [-SH, SH]];
    for (let r = baseRing; r < baseRing + RINGS; r++) {
      const y0 = -(r + 1) * RH, y1 = -r * RH, col0 = LCOL[layerOf(Math.max(0, Math.floor(-y1 / (RH * .4))))], sh = (r % 2 ? 1 : .88);
      for (let k = 0; k < 4; k++) { const a = cn[k], b = cn[(k + 1) % 4], w = (k % 2 ? .9 : 1) * sh; polys.push({ pts: [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], col: [col0[0] * w, col0[1] * w, col0[2] * w], seed: r * 4 + k + 1000, z: cam([(a[0] + b[0]) / 2, (y0 + y1) / 2, (a[1] + b[1]) / 2])[2] }); }
    }
    polys.sort((a, b) => b.z - a.z).forEach(p => quad(p.pts, p.col, p.seed));
    const cb = cam([0, -(baseRing + RINGS) * RH, 0]); if (cb[2] > .5) { const bot = scr(cb), gl = ctx.createRadialGradient(bot[0], bot[1], 1, bot[0], bot[1], 70); gl.addColorStop(0, 'rgba(255,190,90,.8)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = gl; ctx.fillRect(bot[0] - 80, bot[1] - 80, 160, 160); }
    const decos = [];
    for (let r = baseRing; r < baseRing + RINGS; r++) {
      const h1 = hash(r * 3 + 1), h2 = hash(r * 3 + 2), wall = Math.floor(h1 * 4), u = .15 + h2 * .7, a = cn[wall], b = cn[(wall + 1) % 4], px = a[0] + (b[0] - a[0]) * u, pz = a[1] + (b[1] - a[1]) * u;
      if (h1 < .38) { const wp = [px * .97, -(r + .5) * RH, pz * .97]; decos.push({ t: 'm', wp, z: cam(wp)[2], s: .8 + h2 * .7 }); }
      if (h2 < .45) { const wp2 = [-px * .95, -(r + .2) * RH, -pz * .95]; decos.push({ t: 's', wp: wp2, z: cam(wp2)[2] }); }
    }
    decos.sort((a, b) => b.z - a.z).forEach(d => d.t === 'm' ? mushroom(d.wp, d.s) : spore(d.wp));
    marks.forEach(m => { const c = cam([Math.cos(m.a) * SH * .98, camY - m.y, Math.sin(m.a) * SH * .98]); if (c[2] > .4) { const s = scr(c), sz = Math.min(46, 160 / c[2]); ctx.globalAlpha = Math.min(1, m.t); text(m.e, s[0], s[1], sz, '#fff'); ctx.globalAlpha = 1; } });
    if (S.boss >= 0 && s0.k === 'boss') { const c = cam([0, camY - 9, 0]); if (c[2] > .5) { const s = scr(c), r = clamp(220 / c[2], 24, 90) * (1 + pulse * .1); ctx.fillStyle = '#3a1f3a'; ctx.beginPath(); ctx.arc(s[0], s[1], r, 0, TAU); ctx.fill(); ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.arc(s[0] - r * .35, s[1] - r * .1, r * .13, 0, TAU); ctx.arc(s[0] + r * .35, s[1] - r * .1, r * .13, 0, TAU); ctx.fill(); ctx.fillStyle = '#efe6cf'; for (let k = -2; k <= 2; k++) ctx.fillRect(s[0] + k * r * .16 - 3, s[1] + r * .25, 6, r * .22); } }
    ctx.restore();

    /* HUD */
    const nb = nextBoss(), lo = nb > 0 ? LGATE[nb - 1] : 0, hi = nb < 8 ? LGATE[nb] : lo + 1000, pr = clamp((depth() - lo) / (hi - lo), 0, 1);
    rr(52, 10, W - 104, 14, 7, 'rgba(8,10,24,.8)'); rr(54, 12, Math.max(4, (W - 108) * pr), 10, 5, '#ffd75c'); circle(46, 17, 13, '#2a2f58'); text('⛏️', 46, 18, 14);
    text('Depth: ' + depth() + 'm' + (S.title ? ' · ' + S.title : ''), W / 2, 38, 13, '#fff');
    if (banner > 0) { ctx.globalAlpha = Math.min(1, banner * 2); ctx.lineWidth = 4; ctx.strokeStyle = '#0b0f24'; ctx.font = '900 22px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText(s0.n.toUpperCase(), W / 2, 64); ctx.fillStyle = '#fff'; ctx.fillText(s0.n.toUpperCase(), W / 2, 64); ctx.globalAlpha = 1; }
    [['💵', fmt(S.steps), '#2f8a4a'], ['🪱', fmt(S.worms), '#c94f8a'], ['🦴', fmt(S.fp), '#d9902a']].forEach((c, i) => { const y = 96 + i * 30; rr(W - 118, y, 110, 24, 12, c[2]); rr(W - 118, y, 110, 11, 8, 'rgba(255,255,255,.18)'); text(c[0], W - 106, y + 12, 14); text(c[1], W - 14, y + 12, 14, '#fff', 'right'); });
    text('+' + fmt(P.sps) + '/s', W - 62, 90, 10, '#bfffbf');
    [[UI.tele, '📍', 'Teleport'], [UI.fos, '🦴', 'Fossils']].forEach(([r, e, n]) => { rr(r[0], r[1], r[2], r[3] - 8, 12, 'rgba(14,18,40,.78)'); text(e, r[0] + r[2] / 2, r[1] + 16, 18); text(n, r[0] + r[2] / 2, r[1] + r[3] - 14, 8, '#cfd6ff'); });
    rr(UI.auto[0], UI.auto[1], UI.auto[2], UI.auto[3], 8, S.auto ? '#2f7a5a' : 'rgba(40,46,80,.9)'); text('Auto: ' + (S.auto ? 'On' : 'Off'), UI.auto[0] + UI.auto[2] / 2, UI.auto[1] + 12, 12, '#fff');
    padRects().forEach(({ p, r }) => { const ok = S.steps >= p.cost * COSTM; rr(r[0], r[1], r[2], r[3], 10, '#0d2a1a'); ctx.strokeStyle = ok ? '#5cff9a' : '#2a7a4a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(r[0], r[1], r[2], r[3], 10); ctx.stroke(); text(p.name, r[0] + r[2] / 2, r[1] + 16, 11, '#a8ffcb'); text(fmt(p.cost * COSTM), r[0] + r[2] / 2, r[1] + 34, 12, ok ? '#fff' : '#7aa88c'); });
    fx.forEach(f => { ctx.globalAlpha = Math.min(1, f.t * 2); text(f.s, f.x, f.y, 14, f.c); }); ctx.globalAlpha = 1;
    if (msgT > 0) { rr(10, 182, W - 20, 24, 8, 'rgba(0,0,0,.72)'); text(msg, W / 2, 194, 11, '#ffe9b0'); }
    if (S.boss >= 0) { rr(70, 266, W - 140, 12, 6, 'rgba(8,10,24,.85)'); rr(72, 268, Math.max(0, (W - 144) * clamp(S.bossHp / (60 * Math.pow(4.2, S.boss)), 0, 1)), 8, 4, '#e5484d'); text(BOSS[S.boss], W / 2, 258, 10, '#ff8a8a'); }
    if (S.all < 30 && depth() === 0 && s0.k === 'surface') text('Tap to stomp. Buy steps below to descend. Drag to look.', W / 2, 220, 11, '#cfd6ff');

    /* station header and list */
    rr(0, 292, W, 30, 0, '#141a3c'); text(s0.n, 12, 307, 14, '#fff', 'left');
    rr(UI.tbtn[0], UI.tbtn[1], UI.tbtn[2], UI.tbtn[3], 8, '#2c3566'); text('Teleport', UI.tbtn[0] + UI.tbtn[2] / 2, UI.tbtn[1] + 12, 12, '#fff');
    rr(UI.mbtn[0], UI.mbtn[1], UI.mbtn[2], UI.mbtn[3], 8, '#2c3566'); text('Buy ×' + BULK[bulk], UI.mbtn[0] + UI.mbtn[2] / 2, UI.mbtn[1] + 12, 12, '#fff');
    const its = items(); sel = clamp(sel, 0, Math.max(0, its.length - 1)); scroll = clamp(scroll, 0, Math.max(0, its.length * RH2 - VIS));
    ctx.save(); ctx.beginPath(); ctx.rect(0, LT, W, H - LT); ctx.clip();
    its.forEach((it, i) => {
      const y = LT + i * RH2 - scroll; if (y > H || y + RH2 < LT) return;
      rr(8, y + 2, W - 16, 48, 10, '#1d2347');
      if (cursorOn && i === sel) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(8, y + 2, W - 16, 48, 10); ctx.stroke(); }
      text(it.icon, 30, y + 26, 22); text(it.title, 54, y + 18, 13, '#fff', 'left'); text(it.sub, 54, y + 37, 10, '#9aa0cf', 'left');
      if (it.label) { rr(W - 92, y + 10, 78, 30, 8, it.ok ? '#2f7a5a' : '#2a2f58'); text(it.label, W - 53, y + 25, 12, it.ok ? '#fff' : '#7c83b8'); }
      if (it.note) text(it.note, W - 20, y + 8, 10, '#9aa0cf');
    });
    ctx.restore();

    /* teleport menu */
    if (modal) {
      ctx.fillStyle = 'rgba(4,6,16,.72)'; ctx.fillRect(0, 0, W, H);
      rr(8, 8, W - 16, H - 16, 16, '#1b2350'); rr(8, 8, W - 16, 44, 16, '#3a7be0'); text('📍 Teleport', 24, 30, 18, '#fff', 'left'); rr(W - 52, 14, 36, 32, 8, '#e5484d'); text('✕', W - 34, 30, 16, '#fff');
      ctx.save(); ctx.beginPath(); ctx.rect(10, mTop + 2, W - 20, H - mTop - 14); ctx.clip();
      const ml = mlayout(), tl = openTiles();
      ml.rows.forEach(r => { const y = mTop + 8 + r.y - mscroll, c = LCOL[r.l]; rr(14, y, W - 28, 24, 8, 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'); text(LN[r.l] + ' Layer', 24, y + 12, 13, '#fff', 'left'); text('Depth ' + (r.l ? LGATE[r.l - 1] : 0) + '-' + (LGATE[r.l] < 1e8 ? LGATE[r.l] : '∞') + 'm', W - 24, y + 12, 11, '#fff', 'right'); });
      ml.tiles.forEach(t => {
        const [xx, yy] = tileRect(t), un = unlocked(t.s), c = LCOL[t.s.l];
        rr(xx, yy, t.w, t.h, 10, un ? 'rgb(' + Math.floor(c[0] * .5) + ',' + Math.floor(c[1] * .5) + ',' + Math.floor(c[2] * .5) + ')' : '#151a38');
        if (un && S.stn === t.s.id) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(xx, yy, t.w, t.h, 10); ctx.stroke(); }
        if (cursorOn && un && tl[msel] && tl[msel].s.id === t.s.id) { ctx.strokeStyle = '#7df3ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(xx - 2, yy - 2, t.w + 4, t.h + 4, 12); ctx.stroke(); }
        text(t.s.n, xx + t.w / 2, yy + 24, 11, un ? '#a8ffcb' : '#6c73a6'); text(un ? pct(t.s) + '% complete' : 'Step ' + t.s.at, xx + t.w / 2, yy + 48, 10, un ? '#fff' : '#7c83b8');
      });
      ctx.restore();
    }
  });
  const stnIndex = () => Math.max(0, unlockedList().findIndex(s => s.id === S.stn));
  const pickTile = () => { const tl = openTiles(); if (tl[msel]) teleport(tl[msel].s.id); };
  return {
    dir: d => {
      cursorOn = true;
      if (modal) { const tl = openTiles(), n = tl.length; msel = d === 'r' ? (msel + 1) % n : d === 'l' ? (msel + n - 1) % n : d === 'd' ? Math.min(n - 1, msel + 3) : Math.max(0, msel - 3); const t = tl[msel]; if (t) mscroll = clamp(t.y - 90, 0, mMax()); return; }
      const l = unlockedList(), i = stnIndex();
      if (d === 'l') teleport(l[(i + l.length - 1) % l.length].id); else if (d === 'r') teleport(l[(i + 1) % l.length].id); else if (d === 'u') { sel--; keepSel(items().length); } else { sel++; keepSel(items().length); }
    },
    a: () => { if (modal) { pickTile(); return; } stomp(W / 2 + (Math.random() - .5) * 60, 130); dig(); },
    x: () => { cursorOn = true; if (modal) { pickTile(); return; } const its = items(), it = its[clamp(sel, 0, its.length - 1)]; if (it && it.act) it.act(); },
    y: () => { if (modal) modal = false; else openModal(); beep(480, .03); },
    b: () => { if (modal) modal = false; },
    dbg: () => ({ S, P, calc, stomp, dig, buyStep, items, rebirth, startBoss, winBoss, teleport, STN, unlocked, setModal: v => { modal = v; } })
  };
}
