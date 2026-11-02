/* ---------------- PATTERN (memory sequence) ---------------- */
function pattern(api, signal, lv){
  const PADS = [
    { x: 180, y: 170, c: '#2fd08a', f: 392 }, { x: 272, y: 265, c: '#ff5c7a', f: 330 },
    { x: 180, y: 360, c: '#ffd75c', f: 262 }, { x: 88, y: 265, c: '#4f7cff', f: 523 }
  ];
  const RAD = 56, DIRPAD = { u: 0, r: 1, d: 2, l: 3 };
  let seq = Array.from({ length: [1, 1, 3][lv] }, () => rand(4)), phase = 'show', t = -.7, idx = 0, lit = -1, litT = 0, score = 0, dead = false, endT = 0, msg = 'Watch…', waitT = 0, ended = false;
  const speedF = () => Math.max(.45, 1 - seq.length * .035) * [1.35, 1, .75][lv];
  function press(p){
    if (phase !== 'input' || dead) return;
    lit = p; litT = .22; beep(PADS[p].f, .22);
    if (seq[idx] === p) {
      idx++;
      if (idx === seq.length) { score += seq.length * 10; api.score(score); phase = 'wait'; waitT = .8; msg = 'Nice!'; }
    } else { dead = true; endT = 1; msg = 'Wrong!'; beep(120, .5); }
  }
  canvas.addEventListener('pointerdown', e => { const p = pt(e); PADS.forEach((d, i) => { if (Math.hypot(p.x - d.x, p.y - d.y) < RAD + 6) press(i); }); }, { signal });
  loop(signal, dt => {
    if (!dead) {
      if (phase === 'show') {
        t += dt;
        if (t >= 0) {
          const f = speedF(), on = .45 * f, per = on + .2 * f, k = Math.floor(t / per);
          if (k >= seq.length) { phase = 'input'; idx = 0; lit = -1; msg = 'Your turn'; }
          else { const want = (t - k * per) < on ? seq[k] : -1; if (want !== lit) { lit = want; if (want >= 0) beep(PADS[want].f, on); } }
        }
      } else if (phase === 'wait') {
        waitT -= dt;
        if (waitT <= 0) { seq.push(rand(4)); phase = 'show'; t = -.4; msg = 'Watch…'; }
      }
      if (litT > 0) { litT -= dt; if (litT <= 0) lit = -1; }
    } else { endT -= dt; if (endT <= 0 && !ended) { ended = true; api.end(score, 'Longest pattern: ' + (seq.length - 1)); } }
    clear();
    text('Round ' + seq.length, W / 2, 60, 26, '#e8ebff');
    text(msg, W / 2, 98, 16, dead ? '#ff7a8a' : '#8d94c4');
    PADS.forEach((p, i) => {
      ctx.globalAlpha = lit === i ? 1 : .38;
      circle(p.x, p.y, RAD, p.c);
      if (lit === i) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, RAD + 3, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
  });
  return { dir: d => press(DIRPAD[d]) };
}
