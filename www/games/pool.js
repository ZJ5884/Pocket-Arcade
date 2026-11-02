/* ---------------- POOL (8-ball against the computer) ---------------- */
const PL = { L: 28, T: 84, R: 332, B: 484, BR: 8, POCK: 15.5, DECEL: 95, DRAG: .35, DT: 1 / 240 };
const POOL_COL = ['#f4f2ee', '#f2c230', '#2f6fd6', '#d63a3a', '#7a3fb8', '#f2802c', '#2f9e5b', '#8a2f3a', '#16161c'];
const POOL_POCKETS = [[PL.L, PL.T], [PL.R, PL.T], [PL.L, (PL.T + PL.B) / 2], [PL.R, (PL.T + PL.B) / 2], [PL.L, PL.B], [PL.R, PL.B]];
const poolGroup = id => id === 0 ? null : id === 8 ? 'eight' : id < 8 ? 'solid' : 'stripe';

function poolRack(){
  const rows = [[1], [9, 2], [10, 8, 3], [11, 4, 12, 5], [6, 13, 7, 14, 15]];
  const bs = [{ id: 0, x: 180, y: 410, vx: 0, vy: 0, on: true }];
  const D = PL.BR * 2 + .15;
  rows.forEach((row, r) => row.forEach((id, k) => {
    bs.push({ id, x: 180 + (k - r / 2) * D + (Math.random() - .5) * .3, y: 215 - r * D * .866 + (Math.random() - .5) * .3, vx: 0, vy: 0, on: true });
  }));
  return bs;
}
function poolStep(bs, dt, ev){
  const R = PL.BR;
  for (const b of bs) {
    if (!b.on) continue;
    b.x += b.vx * dt; b.y += b.vy * dt;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > 0) {
      const ns = sp - (PL.DECEL + sp * PL.DRAG) * dt;
      if (ns < 4) { b.vx = 0; b.vy = 0; } else { const k = ns / sp; b.vx *= k; b.vy *= k; }
    }
    if (b.x < PL.L + R) { b.x = PL.L + R; b.vx = Math.abs(b.vx) * .78; }
    else if (b.x > PL.R - R) { b.x = PL.R - R; b.vx = -Math.abs(b.vx) * .78; }
    if (b.y < PL.T + R) { b.y = PL.T + R; b.vy = Math.abs(b.vy) * .78; }
    else if (b.y > PL.B - R) { b.y = PL.B - R; b.vy = -Math.abs(b.vy) * .78; }
    for (const p of POOL_POCKETS) {
      if (Math.hypot(b.x - p[0], b.y - p[1]) < PL.POCK) { b.on = false; b.vx = 0; b.vy = 0; ev.pocketed.push(b.id); break; }
    }
  }
  for (let i = 0; i < bs.length; i++) {
    const a = bs[i]; if (!a.on) continue;
    for (let j = i + 1; j < bs.length; j++) {
      const c = bs[j]; if (!c.on) continue;
      const dx = a.x - c.x, dy = a.y - c.y;
      if (dx > 2 * R || dx < -2 * R || dy > 2 * R || dy < -2 * R) continue;
      const d = Math.hypot(dx, dy);
      if (d >= 2 * R || d === 0) continue;
      const nx = dx / d, ny = dy / d, ov = (2 * R - d) / 2;
      a.x += nx * ov; a.y += ny * ov; c.x -= nx * ov; c.y -= ny * ov;
      const vn = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
      if (vn < 0) {
        const imp = -(1 + .96) * vn / 2;
        a.vx += imp * nx; a.vy += imp * ny; c.vx -= imp * nx; c.vy -= imp * ny;
        if (ev.first < 0 && (a.id === 0 || c.id === 0)) ev.first = a.id === 0 ? c.id : a.id;
      }
    }
  }
}
const poolMoving = bs => bs.some(b => b.on && (b.vx || b.vy));
const poolClone = bs => bs.map(b => ({ id: b.id, x: b.x, y: b.y, vx: b.vx, vy: b.vy, on: b.on }));
function poolShoot(bs, angle, speed, maxSteps){
  const t = poolClone(bs), ev = { pocketed: [], first: -1 };
  const cue = t[0]; cue.vx = Math.cos(angle) * speed; cue.vy = Math.sin(angle) * speed;
  for (let n = 0, m = maxSteps || 2400; n < m; n++) { poolStep(t, PL.DT, ev); if (n % 8 === 7 && !poolMoving(t)) break; }
  return { bs: t, ev };
}
function poolCleared(grp, onSet){ for (const id of onSet) if (poolGroup(id) === grp) return false; return true; }
/* Rules in one place so the player and the computer are judged the same way. */
function poolJudge(ev, grp, before){
  const scratch = ev.pocketed.includes(0), eight = ev.pocketed.includes(8);
  const own = grp ? poolGroup(ev.first) === grp || (ev.first === 8 && poolCleared(grp, before)) : ev.first > 0 && ev.first !== 8;
  const foul = scratch || ev.first < 0 || !own;
  let assign = null;
  const real = ev.pocketed.filter(id => id !== 0 && id !== 8);
  if (!grp && !foul && real.length) assign = poolGroup(real[0]);
  const g = grp || assign;
  const mine = g ? real.filter(id => poolGroup(id) === g).length : 0;
  let result = null;
  if (eight) result = (!scratch && g && poolCleared(g, before.filter(id => id !== 8))) ? 'win' : 'lose';
  return { scratch, foul, assign, mine, eight, result, keep: !foul && !result && mine > 0 };
}
function poolSpeedFor(dist){
  let lo = 80, hi = 1000;
  for (let i = 0; i < 24; i++) { const v = (lo + hi) / 2, c = PL.DRAG, s = v / c - PL.DECEL / (c * c) * Math.log(1 + c * v / PL.DECEL); if (s < dist) lo = v; else hi = v; }
  return (lo + hi) / 2;
}
function poolBlocked(bs, ax, ay, bx, by, skip){
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
  for (const o of bs) {
    if (!o.on || skip.includes(o.id)) continue;
    let t = L2 ? ((o.x - ax) * dx + (o.y - ay) * dy) / L2 : 0;
    if (t < 0 || t > 1) continue;
    if (Math.hypot(ax + dx * t - o.x, ay + dy * t - o.y) < PL.BR * 2 - .5) return true;
  }
  return false;
}
function poolTargets(bs, grp){
  const on = bs.filter(b => b.on && b.id > 0).map(b => b.id);
  if (!grp) return bs.filter(b => b.on && b.id > 0 && b.id !== 8);
  const mine = bs.filter(b => b.on && poolGroup(b.id) === grp);
  return mine.length ? mine : bs.filter(b => b.on && b.id === 8);
}
function poolCands(bs, cx, cy, grp){
  const out = [], R = PL.BR;
  for (const t of poolTargets(bs, grp)) for (const p of POOL_POCKETS) {
    const wx = p[0] - t.x, wy = p[1] - t.y, d2 = Math.hypot(wx, wy); if (d2 < 1) continue;
    const gx = t.x - wx / d2 * 2 * R, gy = t.y - wy / d2 * 2 * R;
    if (gx < PL.L + R || gx > PL.R - R || gy < PL.T + R || gy > PL.B - R) continue;
    const ux = gx - cx, uy = gy - cy, d1 = Math.hypot(ux, uy); if (d1 < 2) continue;
    const cos = (ux * wx + uy * wy) / (d1 * d2); if (cos < .22) continue;
    if (poolBlocked(bs, cx, cy, gx, gy, [0, t.id]) || poolBlocked(bs, t.x, t.y, p[0], p[1], [0, t.id])) continue;
    out.push({ t: t.id, angle: Math.atan2(uy, ux), d1, d2, cos, score: cos * 100 - (d1 + d2) * .1 });
  }
  return out.sort((a, b) => b.score - a.score);
}
function poolValue(bs, ev, grp){
  const before = bs.filter(b => b.on && b.id > 0).map(b => b.id), j = poolJudge(ev, grp, before);
  if (j.result === 'win') return 100;
  if (j.result === 'lose') return -100;
  if (j.foul) return -8;
  return j.mine ? 10 * j.mine + 3 : 0;
}
const POOL_AI = [{ top: 1, speeds: 1, noise: .045 }, { top: 4, speeds: 2, noise: .017 }, { top: 8, speeds: 2, noise: .005 }];
function poolAI(bs, grp, lv){
  const cue = bs[0], P = POOL_AI[lv], cands = poolCands(bs, cue.x, cue.y, grp);
  let best = null;
  const noise = () => (Math.random() + Math.random() + Math.random() - 1.5) * P.noise * 1.6;
  if (cands.length) {
    const pool = lv === 0 ? [cands[rand(Math.min(3, cands.length))]] : cands.slice(0, P.top);
    let bv = -1e9;
    for (const c of pool) {
      const base = poolSpeedFor(c.d1 + c.d2 * 1.15) + 40;
      for (let k = 0; k < P.speeds; k++) {
        const sp = clamp(base * (1 + k * .3), 160, 1000);
        let v = 0;
        if (lv > 0) { const r = poolShoot(bs, c.angle, sp); v = poolValue(bs, r.ev, grp) - (r.bs[0].on ? 0 : 0); } else v = 1;
        if (v > bv) { bv = v; best = { angle: c.angle, speed: sp }; }
      }
    }
  }
  if (!best) {
    const ts = poolTargets(bs, grp), t = ts[rand(ts.length)] || bs.find(b => b.on && b.id > 0);
    best = { angle: Math.atan2(t.y - cue.y, t.x - cue.x), speed: 260 + rand(160) };
  }
  best.angle += noise(); best.speed = clamp(best.speed * (1 + noise() * 2), 120, 1000);
  return best;
}
function poolPlaceAI(bs, grp, lv){
  const probe = poolClone(bs);
  let best = null, bs0 = -1e9;
  for (let i = 0; i < 40; i++) {
    const x = PL.L + 16 + Math.random() * (PL.R - PL.L - 32), y = PL.T + 16 + Math.random() * (PL.B - PL.T - 32);
    if (probe.some(b => b.on && b.id > 0 && Math.hypot(b.x - x, b.y - y) < PL.BR * 2 + 3)) continue;
    const c = poolCands(probe, x, y, grp), s = c.length ? c[0].score : -50;
    if (s > bs0) { bs0 = s; best = { x, y }; }
  }
  return best || { x: 180, y: 410 };
}

function pool(api, signal, lv){
  const R = PL.BR;
  let bs = poolRack(), turn = 0, groups = [null, null], phase = 'aim', angle = -Math.PI / 2, charge = 0, charging = false, fine = false;
  let acc = 0, ev = null, before = null, shooter = 0, msg = 'Your break', msgT = 2, thinkT = 0, aiShot = null, shown = 0;
  let score = 0, fouls = 0, potted = 0, done = false, endT = 0, ended = false, final = null, hand = false, dragPos = null, showCur = false;
  const aiTurn = () => turn === 1;
  const say = (t, s) => { msg = t; msgT = s || 2.2; };
  function lawful(x, y){
    if (x < PL.L + R || x > PL.R - R || y < PL.T + R || y > PL.B - R) return false;
    return !bs.some(b => b.on && b.id > 0 && Math.hypot(b.x - x, b.y - y) < R * 2 + 1);
  }
  function takeTurn(){
    if (aiTurn()) {
      phase = hand ? 'aiplace' : 'think'; thinkT = .9; aiShot = null;
    } else phase = hand ? 'place' : 'aim';
  }
  function fire(a, speed){
    const cue = bs[0]; cue.vx = Math.cos(a) * speed; cue.vy = Math.sin(a) * speed;
    ev = { pocketed: [], first: -1 }; before = bs.filter(b => b.on && b.id > 0).map(b => b.id); shooter = turn; phase = 'roll'; acc = 0; charging = false; charge = 0;
    beep(180, .05);
  }
  function finish(res, text){
    done = true; endT = 1; phase = 'over';
    const win = res === 'win';
    score += win ? [300, 500, 800][lv] : 0; score = Math.max(0, score);
    api.score(score); final = { score, msg: text };
    say(text, 5);
  }
  function settle(){
    const j = poolJudge(ev, groups[shooter], before), me = shooter === 0;
    const who = me ? 'You' : 'Computer';
    if (j.assign) { groups[shooter] = j.assign; groups[1 - shooter] = j.assign === 'solid' ? 'stripe' : 'solid'; say((me ? 'You are ' : 'Computer is ') + (j.assign === 'solid' ? 'solids' : 'stripes')); }
    const potNow = ev.pocketed.filter(id => id !== 0 && id !== 8).length;
    if (me) { potted += j.mine; score += j.mine * 50; if (j.foul) { fouls++; score = Math.max(0, score - 25); } api.score(score); }
    if (ev.pocketed.length) beep(330, .1);
    const cue = bs[0];
    if (j.result === 'win') { finish(me ? 'win' : 'lose', me ? 'You sank the 8 ball and won!' : 'Computer sank the 8 ball.'); if (!me) done = true; return; }
    if (j.result === 'lose') { const why = j.scratch ? ' and scratched' : ''; finish(me ? 'lose' : 'win', me ? 'You lost: 8 ball sank too early' + why : 'Computer lost: it sank the 8 ball early'); return; }
    if (j.foul) {
      hand = true; turn = 1 - turn;
      say(j.scratch ? who + ' scratched. Ball in hand' : ev.first < 0 ? who + ' missed everything. Ball in hand' : who + ' hit the wrong ball. Ball in hand', 3);
      if (!cue.on) { cue.on = true; cue.x = 180; cue.y = 410; }
      cue.vx = cue.vy = 0;
    } else if (j.keep) { hand = false; if (!msgT || msgT < .5) say(who + ' ' + (me ? 'go' : 'goes') + ' again'); }
    else { hand = false; turn = 1 - turn; if (msgT < .5) say(turn === 0 ? 'Your turn' : 'Computer’s turn', 1.4); }
    if (!cue.on) { cue.on = true; cue.x = 180; cue.y = 410; }
    // never leave the cue ball overlapping something
    takeTurn();
  }
  /* --- input --- */
  function placeAt(p){ const x = clamp(p.x, PL.L + R, PL.R - R), y = clamp(p.y, PL.T + R, PL.B - R); dragPos = { x, y, ok: lawful(x, y) }; }
  sling(signal, () => phase === 'aim' && !aiTurn(),
    (vx, vy, len) => { if (len > 8) { angle = Math.atan2(vy, vx); charge = clamp(len / 120, 0, 1); charging = true; } },
    (vx, vy, len) => { charging = false; if (len < 14) { charge = 0; return; } angle = Math.atan2(vy, vx); fire(angle, 140 + clamp(len / 120, 0, 1) * 860); });
  canvas.addEventListener('pointerdown', e => { if (phase === 'place') { capture(e); placeAt(pt(e)); } }, { signal });
  canvas.addEventListener('pointermove', e => { if (phase === 'place' && dragPos) placeAt(pt(e)); }, { signal });
  canvas.addEventListener('pointerup', () => { if (phase === 'place' && dragPos) { if (dragPos.ok) { bs[0].x = dragPos.x; bs[0].y = dragPos.y; hand = false; phase = 'aim'; dragPos = null; } else say('Not there, too close to a ball', 1.2); } }, { signal });
  function aimRay(){
    const cue = bs[0], dx = Math.cos(angle), dy = Math.sin(angle);
    let best = 900, hit = null;
    for (const o of bs) {
      if (!o.on || o.id === 0) continue;
      const ox = o.x - cue.x, oy = o.y - cue.y, t = ox * dx + oy * dy; if (t <= 0) continue;
      const d2 = ox * ox + oy * oy - t * t, rr = (2 * R) * (2 * R);
      if (d2 < rr) { const tt = t - Math.sqrt(rr - d2); if (tt < best) { best = tt; hit = o; } }
    }
    const tw = dx > 0 ? (PL.R - R - cue.x) / dx : dx < 0 ? (PL.L + R - cue.x) / dx : 1e9, th = dy > 0 ? (PL.B - R - cue.y) / dy : dy < 0 ? (PL.T + R - cue.y) / dy : 1e9;
    const wall = Math.min(tw, th);
    if (wall < best) { best = wall; hit = null; }
    return { len: best, hit, dx, dy };
  }
  loop(signal, (dt, now) => {
    if (done) { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(final.score, final.msg); } }
    if (msgT > 0) msgT -= dt;
    // pad / keyboard control
    if (phase === 'aim' && !aiTurn()) {
      const ax = axis(); if (ax) { angle += ax * dt * (fine ? .35 : 1.6); showCur = true; }
      if (charging && !dragPos) charge = Math.min(1, charge + dt / 1.1);
    } else if (phase === 'place') {
      const ax = axis(), ay = axisY();
      if (ax || ay) { const base = dragPos || { x: bs[0].x, y: bs[0].y }; placeAt({ x: base.x + ax * dt * 160, y: base.y + ay * dt * 160 }); showCur = true; }
      else if (!dragPos) placeAt({ x: bs[0].x, y: bs[0].y });
    } else if (phase === 'roll') {
      acc += dt;
      let n = 0;
      while (acc >= PL.DT && n < 20) { poolStep(bs, PL.DT, ev); acc -= PL.DT; n++; }
      if (!poolMoving(bs)) settle();
    } else if (phase === 'think') {
      thinkT -= dt;
      if (!aiShot && thinkT < .5) { aiShot = poolAI(bs, groups[1], lv); }
      if (aiShot) angle += (aiShot.angle - angle) * Math.min(1, dt * 8);
      if (thinkT <= 0 && aiShot) { angle = aiShot.angle; fire(aiShot.angle, aiShot.speed); }
    } else if (phase === 'aiplace') {
      thinkT -= dt;
      if (thinkT <= 0) { const p = poolPlaceAI(bs, groups[1], lv); bs[0].x = p.x; bs[0].y = p.y; hand = false; phase = 'think'; thinkT = .8; aiShot = null; }
    }
    /* ---- draw ---- */
    clear();
    rr(10, 62, 340, 440, 22, '#5a3a22'); rr(16, 68, 328, 428, 18, '#7a4f2e');
    rr(PL.L - 6, PL.T - 6, PL.R - PL.L + 12, PL.B - PL.T + 12, 8, '#1f7a4c');
    ctx.fillStyle = '#237f50'; ctx.fillRect(PL.L, PL.T, PL.R - PL.L, PL.B - PL.T);
    ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PL.L, 380); ctx.lineTo(PL.R, 380); ctx.stroke();
    for (const p of POOL_POCKETS) circle(p[0], p[1], 14, '#0b0d10');
    // aim guide
    const showGuide = phase === 'aim' && !aiTurn() || phase === 'think';
    if (showGuide && bs[0].on) {
      const cue = bs[0], r = aimRay(), lenG = (phase === 'aim' && lv === 2 && !charging) ? 90 : (lv === 2 ? 120 : r.len);
      const L2 = Math.min(r.len, lenG);
      ctx.setLineDash([5, 6]); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + r.dx * L2, cue.y + r.dy * L2); ctx.stroke(); ctx.setLineDash([]);
      if (r.hit && lv < 2 && L2 === r.len) {
        const gx = cue.x + r.dx * r.len, gy = cue.y + r.dy * r.len;
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(gx, gy, R, 0, TAU); ctx.stroke();
        const tx = r.hit.x - gx, ty = r.hit.y - gy, tl = Math.hypot(tx, ty) || 1;
        ctx.strokeStyle = 'rgba(255,215,92,.85)'; ctx.beginPath(); ctx.moveTo(r.hit.x, r.hit.y); ctx.lineTo(r.hit.x + tx / tl * (lv === 0 ? 70 : 36), r.hit.y + ty / tl * (lv === 0 ? 70 : 36)); ctx.stroke();
      }
      // cue stick
      const back = 14 + charge * 46 + (phase === 'think' ? 0 : 0);
      ctx.strokeStyle = '#e8c58a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cue.x - r.dx * back, cue.y - r.dy * back); ctx.lineTo(cue.x - r.dx * (back + 64), cue.y - r.dy * (back + 64)); ctx.stroke(); ctx.lineCap = 'butt';
    }
    // balls
    const drawBall = b => {
      circle(b.x + 1.5, b.y + 2, R, 'rgba(0,0,0,.25)');
      if (b.id > 8) { circle(b.x, b.y, R, '#f4f2ee'); ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, TAU); ctx.clip(); ctx.fillStyle = POOL_COL[b.id - 8]; ctx.fillRect(b.x - R, b.y - 5, R * 2, 10); ctx.restore(); }
      else circle(b.x, b.y, R, POOL_COL[b.id]);
      if (b.id > 0) { circle(b.x, b.y, 3.6, '#f4f2ee'); text(b.id, b.x, b.y + .5, 6, '#16161c'); }
      else { circle(b.x - 2.5, b.y - 2.5, 2, 'rgba(255,255,255,.9)'); }
    };
    for (const b of bs) if (b.on && !(phase === 'place' && b.id === 0)) drawBall(b);
    if (phase === 'place' && dragPos) {
      ctx.globalAlpha = dragPos.ok ? .9 : .4; drawBall({ id: 0, x: dragPos.x, y: dragPos.y }); ctx.globalAlpha = 1;
      if (!dragPos.ok) { ctx.strokeStyle = '#ff5c7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(dragPos.x, dragPos.y, R + 3, 0, TAU); ctx.stroke(); }
    }
    // header
    const gl = g => g === 'solid' ? 'Solids' : g === 'stripe' ? 'Stripes' : 'Open';
    text('You · ' + gl(groups[0]), 100, 28, 14, turn === 0 && !done ? '#ffd75c' : '#8d94c4');
    text('Computer · ' + gl(groups[1]), W - 100, 28, 14, turn === 1 && !done ? '#ffd75c' : '#8d94c4');
    // remaining balls
    const remain = g => bs.filter(b => b.on && poolGroup(b.id) === g);
    [[0, 22], [1, W - 22 - 7 * 15]].forEach(([k, x0]) => { const g = groups[k]; if (!g) return; remain(g).forEach((b, i) => { circle(x0 + i * 15 + 6, 48, 6, b.id > 8 ? '#f4f2ee' : POOL_COL[b.id]); if (b.id > 8) { ctx.fillStyle = POOL_COL[b.id - 8]; ctx.fillRect(x0 + i * 15, 46, 12, 4); } }); if (!remain(g).length) circle(x0 + 6, 48, 6, POOL_COL[8]); });
    // bottom: power + message
    const power = phase === 'aim' ? charge : 0;
    rr(40, 506, 280, 10, 5, '#10132a'); if (power > 0) rr(40, 506, 280 * power, 10, 5, power > .8 ? '#ff7a5c' : '#6fe3a7');
    const hint = phase === 'place' ? 'Drag to place the cue ball, release to confirm' : phase === 'aim' && !aiTurn() ? (padConnected || showCur ? 'Left/Right aim · hold A for power · X fine aim' : 'Pull back anywhere and release to shoot') : phase === 'think' || phase === 'aiplace' ? 'Computer is lining up…' : '';
    text(msgT > 0 ? msg : hint, W / 2, 528, 12, msgT > 0 ? '#ffd75c' : '#8d94c4');
    if (fine && phase === 'aim') text('Fine', 330, 72, 11, '#ffd75c');
  });
  takeTurn();
  return {
    a: () => { if (phase === 'place') { if (dragPos && dragPos.ok) { bs[0].x = dragPos.x; bs[0].y = dragPos.y; hand = false; phase = 'aim'; dragPos = null; } else say('Not there, too close to a ball', 1.2); } else if (phase === 'aim' && !aiTurn()) { charging = true; showCur = true; } },
    aUp: () => { if (phase === 'aim' && !aiTurn() && charging) { const p = charge; charging = false; if (p < .05) { charge = 0; return; } fire(angle, 140 + p * 860); } },
    x: () => { fine = !fine; },
    dbg: () => ({ bs, phase, turn, groups, hand, angle, fire, settle: () => settle(), done, score, ev, get charge(){ return charge; } })
  };
}
