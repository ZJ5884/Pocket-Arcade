/* ---------------- BLACKJACK ---------------- */
function blackjack(api, signal, lv){
  const HANDS = 20, START = [700, 500, 400][lv];
  let bank = START, bet = 50, hands = 0, deck = [], player = [], dealer = [], phase = 'bet', msg = 'Set your bet, then deal', result = '', wait = 0, doubled = false, over = false, endT = 0, delta = 0;
  const SU = ['♠', '♥', '♦', '♣'], RK = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  function shuffle(){ deck = []; for (let d = 0; d < 4; d++) for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) deck.push({ r, s }); for (let i = deck.length - 1; i > 0; i--) { const j = rand(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]]; } }
  shuffle();
  const draw = () => { if (deck.length < 20) shuffle(); return deck.pop(); };
  const val = h => { let t = 0, a = 0; for (const c of h) { if (c.r === 0) { a++; t += 11; } else t += Math.min(10, c.r + 1); } while (t > 21 && a > 0) { t -= 10; a--; } return t; };
  const bj = h => h.length === 2 && val(h) === 21;
  function deal(){
    if (phase !== 'bet' || over) return;
    bet = clamp(bet, 10, Math.min(bank, 500)); bank -= bet; doubled = false; result = '';
    player = [draw(), draw()]; dealer = [draw(), draw()]; phase = 'play'; msg = 'Hit, stand or double'; beep(500, .04);
    if (bj(player) || bj(dealer)) finish();
  }
  function finish(){
    phase = 'done';
    const pv = val(player), dv = val(dealer), stake = bet * (doubled ? 2 : 1);
    let pay = 0;
    if (bj(player) && !bj(dealer)) { pay = Math.floor(stake * 2.5); result = 'Blackjack!'; }
    else if (pv > 21) { result = 'Bust'; }
    else if (bj(dealer) && !bj(player)) { result = 'Dealer blackjack'; }
    else if (dv > 21 || pv > dv) { pay = stake * 2; result = 'You win'; }
    else if (pv === dv) { pay = stake; result = 'Push'; }
    else result = 'Dealer wins';
    bank += pay; delta = pay - stake; hands++; api.score(bank);
    msg = result + (delta > 0 ? '  +' + delta : delta < 0 ? '  ' + delta : ''); wait = 1.3;
    if (delta > 0) { beep(800, .12); buzz('win'); } else if (delta < 0) buzz('over');
  }
  function hit(){ if (phase !== 'play') return; player.push(draw()); beep(420, .04); if (val(player) >= 21) stand(); }
  function stand(){ if (phase !== 'play') return; phase = 'dealer'; wait = .5; }
  function dbl(){ if (phase !== 'play' || player.length !== 2 || bank < bet) return; bank -= bet; doubled = true; player.push(draw()); stand(); }
  const BTN = { hit: [20, 440, 100, 44], stand: [130, 440, 100, 44], dbl: [240, 440, 100, 44], deal: [100, 440, 160, 44], up: [250, 360, 50, 40], dn: [60, 360, 50, 40] };
  canvas.addEventListener('pointerdown', e => {
    const p = pt(e);
    if (phase === 'bet') { if (inRect(p, BTN.deal)) deal(); else if (inRect(p, BTN.up)) bet = clamp(bet + 25, 10, Math.min(bank, 500)); else if (inRect(p, BTN.dn)) bet = clamp(bet - 25, 10, Math.min(bank, 500)); }
    else if (phase === 'play') { if (inRect(p, BTN.hit)) hit(); else if (inRect(p, BTN.stand)) stand(); else if (inRect(p, BTN.dbl)) dbl(); }
  }, { signal });
  function card(x, y, c, hidden){
    rr(x, y, 52, 72, 7, hidden ? '#3b4380' : '#f4f4f8');
    if (hidden) { rr(x + 6, y + 6, 40, 60, 4, '#2b3270'); return; }
    const red = c.s === 1 || c.s === 2, col = red ? '#d62d4a' : '#1a1a24';
    text(RK[c.r], x + 14, y + 16, 17, col); text(SU[c.s], x + 26, y + 46, 28, col);
  }
  loop(signal, dt => {
    if (wait > 0) { wait -= dt; if (wait <= 0) {
      if (phase === 'dealer') { if (val(dealer) < 17) { dealer.push(draw()); beep(380, .04); wait = .55; } else finish(); }
      else if (phase === 'done') { if (bank < 10 || hands >= HANDS) { over = true; endT = .3; } else { phase = 'bet'; msg = 'Set your bet, then deal'; bet = clamp(bet, 10, Math.min(bank, 500)); } }
    } }
    if (over) { endT -= dt; if (endT <= 0) { api.end(bank, 'Finished with $' + bank + ' after ' + hands + ' hands'); endT = 99; } }
    clear();
    text('Bank $' + bank, 90, 28, 20, '#ffd75c'); text('Hand ' + Math.min(hands + (phase === 'bet' ? 1 : 0) + (phase === 'bet' ? 0 : 0), HANDS) + ' / ' + HANDS, W - 70, 28, 15, '#8d94c4');
    rr(10, 56, 340, 300, 20, '#16603f');
    text('Dealer' + (phase === 'play' ? '' : dealer.length ? '  ' + val(dealer) : ''), W / 2, 76, 14, '#d6f2e0');
    dealer.forEach((c, i) => card(60 + i * 44, 90, c, phase === 'play' && i === 1));
    text('You' + (player.length ? '  ' + val(player) : ''), W / 2, 258, 14, '#d6f2e0');
    player.forEach((c, i) => card(60 + i * 44, 272, c, false));
    text(msg, W / 2, 392 - (phase === 'bet' ? 40 : 0), 18, delta > 0 && phase === 'done' ? '#ffd75c' : '#e8ebff');
    if (phase === 'bet') {
      text('Bet $' + bet, W / 2, 380, 22, '#fff');
      button(...BTN.dn, '−25', '#3b4380'); button(...BTN.up, '+25', '#3b4380'); button(...BTN.deal, 'Deal  (A)', '#2f8f6b');
    } else if (phase === 'play') {
      button(...BTN.hit, 'Hit  (A)', '#3b4380'); button(...BTN.stand, 'Stand  (X)', '#3b4380'); button(...BTN.dbl, 'Double (Y)', player.length === 2 && bank >= bet ? '#3b4380' : '#232850');
      text('Bet $' + bet * (doubled ? 2 : 1), W / 2, 505, 13, '#8d94c4');
    }
  });
  return {
    dir: d => { if (phase === 'bet') { if (d === 'u' || d === 'r') bet = clamp(bet + 25, 10, Math.min(bank, 500)); else bet = clamp(bet - 25, 10, Math.min(bank, 500)); } },
    a: () => { if (phase === 'bet') deal(); else hit(); }, x: stand, y: dbl,
    dbg: () => ({ bank, phase, player, dealer, hit, stand, deal })
  };
}
