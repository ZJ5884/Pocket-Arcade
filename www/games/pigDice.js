/* ---------------- PIG DICE ---------------- */
function pigDice(api, signal, lv){
  const GOAL = 100, HOLD = [14, 20, 25][lv];
  let me = 0, cpu = 0, turnTotal = 0, turn = 1, die = 0, rolling = 0, wait = 0, msg = 'Your turn: roll or hold', msgT = 0, over = false, endT = 0, rollsThisTurn = 0;
  const BTN = { roll: [30, 430, 140, 52], hold: [190, 430, 140, 52] };
  function end(winner){ over = true; endT = 1; msg = winner === 1 ? 'You win!' : 'Computer wins'; }
  function settle(){
    rolling = 0;
    if (die === 1) { msg = turn === 1 ? 'Rolled a 1. Turn total lost' : 'Computer rolled a 1'; turnTotal = 0; switchTurn(); beep(120, .25); if (turn === -1) buzz('over'); }
    else { turnTotal += die; beep(300 + die * 60, .05); if (turn === 1) { msg = 'Turn total ' + turnTotal; if (me + turnTotal >= GOAL) hold(); } else wait = .7; }
    api.score(me * 2);
  }
  function switchTurn(){ turn = -turn; turnTotal = 0; rollsThisTurn = 0; wait = turn === -1 ? 1 : 0; }
  function roll(){ if (over || rolling > 0) return; rolling = .45; rollsThisTurn++; }
  function hold(){
    if (over || rolling > 0) return;
    if (turn === 1) { if (!turnTotal) return; me += turnTotal; msg = 'Banked ' + turnTotal; turnTotal = 0; api.score(me * 2); if (me >= GOAL) return end(1); switchTurn(); }
    else { cpu += turnTotal; msg = 'Computer banked ' + turnTotal; turnTotal = 0; if (cpu >= GOAL) return end(-1); switchTurn(); }
  }
  canvas.addEventListener('pointerdown', e => { const p = pt(e); if (turn !== 1) return; if (inRect(p, BTN.roll)) roll(); else if (inRect(p, BTN.hold)) hold(); }, { signal });
  loop(signal, dt => {
    if (rolling > 0) { rolling -= dt; die = 1 + rand(6); if (rolling <= 0) { die = 1 + rand(6); settle(); } }
    else if (!over && turn === -1) {
      wait -= dt;
      if (wait <= 0) {
        const lead = me - cpu, target = Math.min(HOLD + (lead > 25 ? 8 : lead < -25 ? -6 : 0), GOAL - cpu);
        if (turnTotal >= target || cpu + turnTotal >= GOAL) hold(); else roll();
        wait = .6;
      }
    }
    if (over) { endT -= dt; if (endT <= 0) { const sc = me * 2 + (me >= GOAL ? 300 : 0); api.score(sc); api.end(sc, (me >= GOAL ? 'You win ' : 'CPU wins ') + me + ' – ' + cpu); endT = 99; } }
    clear();
    text('First to ' + GOAL, W / 2, 28, 16, '#8d94c4');
    rr(20, 52, 150, 76, 14, turn === 1 && !over ? '#2b3a9a' : '#1d2243'); text('You', 95, 72, 14, '#b9bfe8'); text(String(me), 95, 105, 36, '#fff');
    rr(190, 52, 150, 76, 14, turn === -1 && !over ? '#9a2b4a' : '#1d2243'); text('Computer', 265, 72, 14, '#b9bfe8'); text(String(cpu), 265, 105, 36, '#fff');
    rr(W / 2 - 55, 170, 110, 110, 20, '#f4f4f8');
    const dv = die || 6, pips = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
    pips[dv].forEach(([x, y]) => circle(W / 2 + x * 28, 225 + y * 28, 9, dv === 1 && !rolling ? '#e0334f' : '#1a1a24'));
    text('Turn total', W / 2, 315, 14, '#8d94c4'); text(String(turnTotal), W / 2, 350, 40, turnTotal ? '#ffd75c' : '#4a5080');
    text(msg, W / 2, 400, 15, '#e8ebff');
    button(...BTN.roll, 'Roll  (A)', turn === 1 ? '#2f8f6b' : '#232850'); button(...BTN.hold, 'Hold  (X)', turn === 1 && turnTotal ? '#3b4380' : '#232850');
    text('Roll to add up points. Roll a 1 and you lose the lot.', W / 2, 505, 12, '#6c73a6');
  });
  return { a: () => { if (turn === 1) roll(); }, x: () => { if (turn === 1) hold(); }, dbg: () => ({ me, cpu, turnTotal, turn }) };
}
