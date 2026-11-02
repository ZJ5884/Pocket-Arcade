/* ---------------- DEEP ROOTS (3D incremental tree: grow up, dig down, bloom) ---------------- */
function deepRoots(api, signal, lv){
  const KEY = 'pa_deeproots_v1', COSTM = [.8, 1, 1.25][lv];
  const LNAME = ['Topsoil', 'Clay', 'Stone', 'Cavern', 'Crystal Vein', 'Magma', 'Mantle', 'Core', 'The Void'];
  const THR = [0, 30, 120, 400, 1200, 4000, 12000, 40000, 150000, 1e9];
  const LCOL = ['#5a3b24', '#7a4a30', '#555b66', '#3a3550', '#2d6a78', '#8a2f1a', '#6a2a52', '#b0561a', '#0c0820'];
  const TRACKS = [
    { n: 'Leaves', icon: '🍃', base: 15, g: 1.17, d: lvl => '+' + fmt(lvl + 1) + ' sap per second base' },
    { n: 'Branches', icon: '🌿', base: 120, g: 1.22, d: () => 'Leaves make 8% more per level' },
    { n: 'Trunk', icon: '🪵', base: 800, g: 1.3, d: () => 'Taller tree: +2% sap per metre' },
    { n: 'Roots', icon: '🌱', base: 400, g: 1.25, d: () => 'Dig faster, reach deeper layers' },
    { n: 'Sunlight', icon: '☀️', base: 30, g: 1.2, d: () => 'Each tap makes +1.5 sap' },
    { n: 'Water table', icon: '💧', base: 5000, g: 1.35, d: () => '+25% sap from everything' }
  ];
  const PERK_KINDS = [['sap', 'All sap x2'], ['dig', 'Digging x2'], ['tap', 'Taps x3']];
  const PERKS = [];
  const PNAMES = [['Compost', 'Mulch', 'Earthworms'], ['Clay Pots', 'Kiln Heat', 'Potters Wheel'], ['Pickaxe Roots', 'Granite Grip', 'Pebble Path'], ['Glow Moss', 'Bat Friends', 'Echo Chamber'], ['Crystal Sap', 'Prism Leaves', 'Gem Roots'], ['Lava Tea', 'Heat Vents', 'Ember Seeds'], ['Deep Wells', 'Plate Shift', 'Mantle Sap'], ['Core Pulse', 'Iron Veins', 'Magnet Roots'], ['Void Bloom', 'Star Roots', 'Endless Tree']];
  for (let l = 0; l < 9; l++) for (let k = 0; k < 3; k++) PERKS.push({ id: 'p' + l + k, layer: l, name: PNAMES[l][k], kind: PERK_KINDS[k][0], desc: PERK_KINDS[k][1], cost: 500 * Math.pow(9, l * 1.35 + k * .6) });
  const SEED = [
    ['Strong Seeds', 'Sap +10% per level per seed bonus', 25, 1], ['Head Start', 'Start each bloom with some sap', 15, 1], ['Deeper Start', 'Start each bloom deeper', 15, 2],
    ['Gardener', 'Auto-grow taps every second', 10, 2], ['Rich Soil', 'Roots dig 20% faster', 20, 2], ['Cheap Seeds', 'Upgrades 3% cheaper', 20, 3]
  ];
  const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n){
    if (!isFinite(n)) return '∞'; if (n < 1000) return n < 10 ? n.toFixed(1).replace(/\.0$/, '') : String(Math.floor(n));
    const e = Math.floor(Math.log10(n) / 3); if (e >= SUF.length) return n.toExponential(2).replace('+', '');
    const v = n / Math.pow(1000, e); return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0)) + SUF[e];
  }
  const fresh = () => ({ sap: 0, run: 0, all: 0, lvl: Array(6).fill(0), perks: {}, depth: 0, seeds: 0, seedsAll: 0, blooms: 0, shop: Array(SEED.length).fill(0), t: Date.now() });
  let S = (() => { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.lvl && d.lvl.length === 6 && d.shop) { d.shop = SEED.map((_, i) => d.shop[i] || 0); d.perks = d.perks || {}; return d; } } catch (e) {} return fresh(); })();
  const save = () => { try { S.t = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  signal.addEventListener('abort', save);
  const layerOf = d => { let i = 0; while (i < 8 && d >= THR[i + 1]) i++; return i; };
  const perkMult = k => Object.keys(S.perks).filter(id => S.perks[id] && PERKS.find(p => p.id === id).kind === k).length;
  let P = { sps: 0, tap: 1, dig: 0, layer: 0, height: 0 };
  function calc(){
    const L = S.lvl, layer = layerOf(S.depth), height = L[2];
    const seedM = 1 + .1 * S.seeds * (1 + .1 * S.shop[0]);
    const sap = Math.pow(2, perkMult('sap')) * Math.pow(2, layer) * (1 + .25 * L[5]) * (1 + .02 * height) * seedM;
    P.sps = L[0] * (1 + .08 * L[1]) * sap; P.tap = (1 + 1.5 * L[4]) * Math.pow(3, perkMult('tap')) * Math.max(1, sap * .25);
    P.dig = L[3] * .25 * Math.pow(2, perkMult('dig')) * (1 + .2 * S.shop[4]) * (L[3] ? 1 : 0); P.layer = layer; P.height = height;
  }
  calc();
  const tcost = i => TRACKS[i].base * Math.pow(TRACKS[i].g, S.lvl[i]) * COSTM * Math.pow(.97, S.shop[5]);
  function bulkCost(i){ let n = BULK[bulk], c = 0, k = 0, cur = S.lvl[i]; const one = j => TRACKS[i].base * Math.pow(TRACKS[i].g, cur + j) * COSTM * Math.pow(.97, S.shop[5]);
    if (n === 'Max') { n = 0; let s = 0; while (n < 500) { const nx = one(n); if (s + nx > S.sap) break; s += nx; n++; } if (n === 0) n = 1; }
    for (k = 0; k < n; k++) c += one(k); return { n, cost: c }; }
  /* offline */
  (function off(){ const el = Math.min((Date.now() - S.t) / 1000, 7200); if (el > 30) { calc(); S.sap += P.sps * el * .5; S.run += P.sps * el * .5; S.all += P.sps * el * .5; S.depth += P.dig * el * .5; } })();

  /* ----- 3D tree ----- */
  let treeSc = 1, segs = [], tips = [], rsegs = [], builtKey = '', yaw = 0, spin = .35, pulse = 0, fx = [], tab = 0, bulk = 0, scroll = 0, sel = 0, cursorOn = false, confirmT = 0, msg = '', msgT = 0, saveT = 5, calcT = 0, drag = null, autoT = 0;
  const BULK = [1, 10, 100, 'Max'];
  let seedRng = 7; const rnd = () => (seedRng = (seedRng * 16807) % 2147483647) / 2147483647;
  function build(){
    seedRng = 11;
    segs = []; tips = []; rsegs = [];
    const bd = 2 + Math.min(4, Math.floor(S.lvl[1] / 5)), tl = 34 + Math.min(70, Math.log2(1 + S.lvl[2]) * 12);
    const grow = (p, dir, len, w, d) => {
      const q = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
      segs.push({ a: p, b: q, w });
      if (d <= 0) { tips.push(q); return; }
      const n = d > 2 ? 2 : (S.lvl[1] > 12 ? 3 : 2);
      for (let i = 0; i < n; i++) {
        const ang = .55 + rnd() * .5, az = rnd() * 6.283, ca = Math.cos(ang), sa = Math.sin(ang);
        const nd = [dir[0] * ca + Math.cos(az) * sa, dir[1] * ca + Math.abs(sa) * .6, dir[2] * ca + Math.sin(az) * sa];
        const m = Math.hypot(nd[0], nd[1], nd[2]) || 1; grow(q, [nd[0] / m, nd[1] / m, nd[2] / m], len * .72, w * .68, d - 1);
      }
    };
    grow([0, 0, 0], [0, 1, 0], tl * .55, 5, bd);
    let my = 1; segs.forEach(g => { my = Math.max(my, g.b[1], g.a[1]); }); treeSc = Math.min(1.6, 80 / (my * 1.3));
    const rd = 2 + Math.min(3, Math.floor(S.lvl[3] / 6)), rl = 22 + Math.min(40, Math.log2(1 + S.lvl[3]) * 7);
    const root = (p, dir, len, w, d) => {
      const q = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
      rsegs.push({ a: p, b: q, w });
      if (d <= 0) return;
      for (let i = 0; i < 2; i++) { const az = rnd() * 6.283, sp = .5 + rnd() * .5; const nd = [dir[0] * .6 + Math.cos(az) * sp, dir[1] * .9 - .2, dir[2] * .6 + Math.sin(az) * sp]; const m = Math.hypot(...nd) || 1; root(q, [nd[0] / m, nd[1] / m, nd[2] / m], len * .74, w * .65, d - 1); }
    };
    if (S.lvl[3] > 0) for (let i = 0; i < 3; i++) { const az = i * 2.1 + rnd(); root([0, 0, 0], [Math.cos(az) * .5, -.85, Math.sin(az) * .5], rl, 3, rd); }
  }
  const say = (t, x, y, c) => fx.push({ t: 1, s: t, x, y, c: c || '#fff' });
  function tap(x, y){ S.sap += P.tap; S.run += P.tap; S.all += P.tap; pulse = 1; say('+' + fmt(P.tap), x + (Math.random() - .5) * 30, y - 8, '#bfffbf'); beep(500 + rand(100), .012); }
  function buyTrack(i){ const { n, cost } = bulkCost(i); if (S.sap < cost) { beep(120, .05); return; } S.sap -= cost; S.lvl[i] += n; calc(); beep(660, .05); buzz(); }
  const shopCost = i => Math.ceil(SEED[i][3] * Math.pow(1.6, S.shop[i]));
  const gain = () => Math.floor(Math.cbrt(S.run / 1e5));
  function bloom(){
    const g = gain(); if (g < 1) return;
    S.seeds += g; S.seedsAll += g; S.blooms++; S.sap = S.shop[1] ? 200 * Math.pow(4, S.shop[1]) : 0; S.run = 0; S.lvl = Array(6).fill(0); S.perks = {}; S.depth = S.shop[2] * 25; confirmT = 0; calc(); build(); save(); buzz('win'); beep(990, .3); msg = 'Bloomed! +' + g + ' seeds'; msgT = 3;
  }
  function items(){
    const out = [];
    if (tab === 0) TRACKS.forEach((t, i) => { const b = bulkCost(i); out.push({ icon: t.icon, title: t.n + '  Lv ' + S.lvl[i], sub: t.d(S.lvl[i]), label: fmt(b.cost), note: b.n > 1 ? '×' + b.n : '', ok: S.sap >= b.cost, act: () => buyTrack(i) }); });
    else if (tab === 1) {
      PERKS.filter(p => !S.perks[p.id] && p.layer <= P.layer).sort((a, b) => a.cost - b.cost).forEach(p => { const c = p.cost * COSTM; out.push({ icon: '✨', title: p.name, sub: p.desc + ' · ' + LNAME[p.layer], label: fmt(c), ok: S.sap >= c, act: () => { if (S.sap < c) { beep(120, .05); return; } S.sap -= c; S.perks[p.id] = 1; calc(); beep(880, .06); buzz('win'); } }); });
    } else if (tab === 2) {
      for (let l = 0; l < 9; l++) out.push({ icon: l <= P.layer ? '⛏️' : '🔒', title: LNAME[l], sub: 'From ' + fmt(THR[l]) + ' m · sap x' + Math.pow(2, l), label: l === P.layer ? 'Here' : l < P.layer ? 'Done' : fmt(THR[l]) + ' m', ok: false, act: () => {} });
    } else {
      const g = gain();
      out.push({ icon: '🌸', title: 'Bloom', sub: g >= 1 ? 'Reset the run for ' + g + ' seeds (+10% sap each)' : 'Grow more first (' + fmt(S.run) + ' / 100K sap this run)', label: g >= 1 ? '+' + g : '—', ok: g >= 1, act: () => { if (g < 1) return; if (confirmT > 0) bloom(); else { confirmT = 3; msg = 'Press again to confirm. This resets the run.'; msgT = 3; } } });
      SEED.forEach((s, i) => { const lv2 = S.shop[i], c = shopCost(i); out.push({ icon: '🌰', title: s[0] + '  Lv ' + lv2 + '/' + s[2], sub: s[1], label: lv2 >= s[2] ? 'Max' : c + ' ◆', ok: lv2 < s[2] && S.seeds >= c, act: () => { if (lv2 >= s[2] || S.seeds < c) { beep(120, .05); return; } S.seeds -= c; S.shop[i]++; calc(); beep(880, .06); buzz('win'); } }); });
    }
    return out;
  }
  const RH = 54, LT = 272, VX = W / 2, GY = 124;
  const maxScroll = () => Math.max(0, items().length * RH - (H - LT - 4));
  const TABS = ['Grow', 'Perks', 'Layers', 'Bloom'], TX = i => 6 + i * 68;
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e); capture(e); cursorOn = false;
    if (p.y < 236) { drag = { x: p.x, y: p.y, yaw, moved: false, view: true }; return; }
    if (p.y < LT - 2) { for (let i = 0; i < 4; i++) if (inRect(p, [TX(i), 240, 66, 28])) { tab = i; scroll = 0; sel = 0; beep(480, .03); } if (inRect(p, [TX(4), 240, 78, 28])) { bulk = (bulk + 1) % 4; beep(480, .03); } return; }
    drag = { y: p.y, s: scroll, moved: false, p };
  }, { signal });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const p = pt(e); if (drag.view) { if (Math.abs(p.x - drag.x) > 6) drag.moved = true; if (drag.moved) yaw = drag.yaw + (p.x - drag.x) * .02; return; } if (Math.abs(p.y - drag.y) > 8) drag.moved = true; if (drag.moved) scroll = clamp(drag.s + (drag.y - p.y), 0, maxScroll()); }, { signal });
  const up = () => { if (drag) { if (!drag.moved) { if (drag.view) tap(drag.x, drag.y); else { const i = Math.floor((drag.p.y - LT + scroll) / RH); sel = Math.max(0, i); const it = items()[i]; if (it && it.act) it.act(); } } } drag = null; };
  canvas.addEventListener('pointerup', up, { signal }); canvas.addEventListener('pointercancel', () => { drag = null; }, { signal });
  function keepSel(n){ sel = clamp(sel, 0, Math.max(0, n - 1)); const y = sel * RH; if (y < scroll) scroll = y; if (y + RH > scroll + (H - LT)) scroll = y + RH - (H - LT); scroll = clamp(scroll, 0, Math.max(0, n * RH - (H - LT - 4))); }
  build();
  function proj(p){ const c = Math.cos(yaw), s = Math.sin(yaw), x = p[0] * c - p[2] * s, z = p[0] * s + p[2] * c + 200, k = 260 / z; return [VX + x * k, GY - p[1] * k, z, k]; }

  loop(signal, dt0 => {
    const dt = Math.min(dt0, .25);
    S.sap += P.sps * dt; S.run += P.sps * dt; S.all += P.sps * dt;
    if (P.dig > 0) S.depth += P.dig * dt;
    calcT -= dt; if (calcT <= 0) { calc(); calcT = .5; const k = S.lvl.join() + P.layer; if (k !== builtKey) { builtKey = k; build(); } }
    if (S.shop[3] > 0) { autoT -= dt; if (autoT <= 0) { autoT = 1; const t = P.tap * S.shop[3] * .5; S.sap += t; S.run += t; S.all += t; } }
    if (confirmT > 0) confirmT -= dt; if (msgT > 0) msgT -= dt;
    saveT -= dt; if (saveT <= 0) { save(); saveT = 5; }
    if (!drag || !drag.moved) yaw += spin * dt; pulse = Math.max(0, pulse - dt * 5);
    fx.forEach(f => { f.t -= dt; f.y -= 40 * dt; }); fx = fx.filter(f => f.t > 0);
    api.score(Math.floor(Math.log10(1 + S.all) * 100) + S.blooms * 500 + Math.floor(S.depth / 20));

    clear();
    const layer = P.layer, bands = Math.min(9, layer + 2), bandH = (236 - GY) / bands;
    const skyG = ctx.createLinearGradient(0, 0, 0, GY); skyG.addColorStop(0, '#10203a'); skyG.addColorStop(1, '#2a4a6a'); ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, GY);
    for (let i = 0; i < bands; i++) { ctx.fillStyle = LCOL[i]; ctx.globalAlpha = i > layer ? .45 : 1; ctx.fillRect(0, GY + i * bandH, W, bandH + 1); ctx.globalAlpha = 1; if (i <= layer) text(LNAME[i], 8, GY + i * bandH + 9, 9, 'rgba(255,255,255,.55)', 'left'); }
    ctx.fillStyle = '#3e8a4a'; ctx.beginPath(); ctx.ellipse(VX, GY, 90, 14, 0, 0, TAU); ctx.fill();
    const frac = P.layer >= 8 ? 1 : (S.depth - THR[layer]) / (THR[layer + 1] - THR[layer]), ry = (layer + clamp(frac, 0, 1)) * bandH;
    /* roots (clipped to the dug depth) */
    ctx.save(); ctx.beginPath(); ctx.rect(0, GY, W, Math.max(2, ry)); ctx.clip();
    const sc = Math.max(.4, ry / 60);
    rsegs.map(s => [proj([s.a[0] * sc, s.a[1] * sc, s.a[2] * sc]), proj([s.b[0] * sc, s.b[1] * sc, s.b[2] * sc]), s.w]).sort((a, b) => b[0][2] - a[0][2]).forEach(([a, b, w]) => { ctx.strokeStyle = '#d9b98a'; ctx.lineWidth = Math.max(1, w * a[3] * .8); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
    ctx.restore();
    /* trunk and branches, then leaves */
    const ts = v => [v[0] * treeSc, v[1] * treeSc, v[2] * treeSc];
    const pr = segs.map(s => [proj(ts(s.a)), proj(ts(s.b)), s.w * treeSc]); pr.sort((a, b) => b[0][2] - a[0][2]);
    pr.forEach(([a, b, w]) => { ctx.strokeStyle = '#7a5230'; ctx.lineWidth = Math.max(1.2, w * a[3] * (1 + pulse * .15)); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
    const lc = Math.min(4, 1 + Math.floor(S.lvl[0] / 8)), lr = 5 + Math.min(8, S.lvl[0] / 6);
    tips.map(t => proj(ts(t))).sort((a, b) => b[2] - a[2]).forEach(q => { for (let i = 0; i < lc; i++) { ctx.fillStyle = i % 2 ? '#5fcf6a' : '#3fa854'; const o = i * 2.1; ctx.beginPath(); ctx.arc(q[0] + Math.cos(o) * 4 * q[3] * treeSc, q[1] + Math.sin(o) * 4 * q[3] * treeSc, lr * q[3] * treeSc * (1 + pulse * .2), 0, TAU); ctx.fill(); } });
    fx.forEach(f => { ctx.globalAlpha = Math.min(1, f.t * 2); text(f.s, f.x, f.y, 15, f.c); }); ctx.globalAlpha = 1;
    text(fmt(S.sap) + ' sap', W / 2, 16, 20, '#fff'); text(fmt(P.sps) + '/s · ' + fmt(S.depth) + ' m deep · ' + P.height + ' m tall', W / 2, 36, 11, '#cfe6ff');
    if (S.seeds > 0 || S.blooms > 0) text('◆ ' + S.seeds, 10, 16, 13, '#ffd75c', 'left');
    if (msgT > 0) { rr(10, 200, W - 20, 28, 8, 'rgba(0,0,0,.65)'); text(msg, W / 2, 214, 11, '#ffe9b0'); }

    const its = items(); sel = clamp(sel, 0, Math.max(0, its.length - 1)); scroll = clamp(scroll, 0, Math.max(0, its.length * RH - (H - LT - 4)));
    const upN = PERKS.filter(p => !S.perks[p.id] && p.layer <= P.layer && S.sap >= p.cost * COSTM).length;
    for (let i = 0; i < 4; i++) { rr(TX(i), 240, 66, 28, 9, tab === i ? '#3b4380' : '#1c2147'); text(TABS[i] + (i === 1 && upN ? ' ' + upN : ''), TX(i) + 33, 255, 12, tab === i ? '#fff' : '#9aa0cf'); }
    rr(TX(4), 240, 78, 28, 9, '#2c3566'); text('Buy ' + BULK[bulk], TX(4) + 39, 255, 12, '#fff');
    ctx.save(); ctx.beginPath(); ctx.rect(0, LT, W, H - LT); ctx.clip();
    if (!its.length) text('No perks yet. Dig deeper.', W / 2, LT + 40, 14, '#6c73a6');
    its.forEach((it, i) => {
      const y = LT + i * RH - scroll; if (y > H || y + RH < LT) return;
      rr(8, y + 2, W - 16, RH - 6, 10, '#1d2347');
      if (cursorOn && i === sel) { ctx.strokeStyle = '#ffd75c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(8, y + 2, W - 16, RH - 6, 10); ctx.stroke(); }
      text(it.icon, 30, y + 26, 22); text(it.title, 54, y + 18, 14, '#fff', 'left'); text(it.sub, 54, y + 37, 11, '#9aa0cf', 'left');
      rr(W - 92, y + 10, 78, 30, 8, it.ok ? '#2f7a5a' : '#2a2f58'); text(it.label, W - 53, y + 25, 13, it.ok ? '#fff' : '#7c83b8');
      if (it.note) text(it.note, W - 20, y + 8, 10, '#9aa0cf');
    });
    ctx.restore();
  });
  return {
    dir: d => { cursorOn = true; if (d === 'l') { tab = (tab + 3) % 4; scroll = 0; sel = 0; } else if (d === 'r') { tab = (tab + 1) % 4; scroll = 0; sel = 0; } else if (d === 'u') sel--; else sel++; keepSel(items().length); },
    a: () => tap(VX + (Math.random() - .5) * 40, 70),
    x: () => { cursorOn = true; const its = items(), it = its[clamp(sel, 0, its.length - 1)]; if (it && it.act) it.act(); },
    y: () => { bulk = (bulk + 1) % 4; beep(480, .03); },
    dbg: () => ({ S, P, calc, tap, items, bloom, build, segs: () => segs.length })
  };
}
