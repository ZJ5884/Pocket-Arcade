/* ================= PAGE: CONTROLS (button mapping and live test) ================= */
let listening = null, listenTimer = 0;
const BLABEL = { a: 'A', b: 'B', x: 'X', y: 'Y', l1: 'L1', r1: 'R1', select: 'Select', start: 'Start' };
const padName = i => PAD_NAMES[i] || 'Button ' + i;
function stopListening(){ listening = null; clearTimeout(listenTimer); if (typeof cancelListen === 'function') cancelListen(); }
function listenFor(kind, act){
  stopListening(); listening = { kind, act };
  listenTimer = setTimeout(() => { if (listening) { stopListening(); if (route.page === 'controls') refresh(); } }, 7000);
  if (kind === 'pad') {
    listenPad(i => {
      clearTimeout(listenTimer); listening = null;
      if (i >= 12 && i <= 15) toast('D-pad buttons are reserved for moving');
      else { const B = S.binds; for (const k in B) if (k !== act && B[k] === i) { B[k] = B[act]; } B[act] = i; save(); toast(BLABEL[act] + ' is now ' + padName(i)); }
      if (route.page === 'controls') refresh();
    });
  } else {
    listenKey(k => {
      clearTimeout(listenTimer); listening = null;
      if (k === 'escape') { toast('Cancelled'); }
      else if (RESERVED_KEYS.has(k)) toast('That key is reserved for moving or going back');
      else { const K = S.keys; for (const o in K) if (o !== act && K[o] === k) K[o] = K[act]; K[act] = k; save(); toast((BLABEL[act] || 'Undo') + ' is now ' + keyLabel(k)); }
      if (route.page === 'controls') refresh();
    });
  }
  refresh();
}
PAGES.controls = {
  hints: () => '<span><kbd>A</kbd>Rebind</span><span><kbd>B</kbd>Back</span>',
  render(){
    const B = S.binds, K = S.keys;
    let h = '<h1 class="page-h">Controls</h1><p class="subl">Select a button below, then press the new one. The test strip lights up as you press, so you can check the result.</p>';
    h += '<div class="padtest" id="padtest">' + BIND_ACTIONS.map(a => '<span class="pt" data-pb="' + a[0] + '">' + BLABEL[a[0]] + '</span>').join('') + '<span class="pt stick" id="ptStick">Stick 0.00, 0.00</span><span class="pt status" id="ptStatus"></span></div>';
    h += '<h3 class="sh">Button mapping</h3>';
    BIND_ACTIONS.forEach(a => {
      const k = a[0], wp = listening && listening.kind === 'pad' && listening.act === k, wk = listening && listening.kind === 'key' && listening.act === k;
      h += '<div class="row bind"><span class="rl">' + BLABEL[k] + '<small>' + a[1] + '</small></span><span class="bchips">' +
        '<button data-f data-k="bp-' + k + '" data-act="bindpad" data-v="' + k + '" class="chip-b' + (wp ? ' wait' : '') + '">' + (wp ? 'Press a button…' : 'Pad: ' + padName(B[k])) + '</button>' +
        '<button data-f data-k="bk-' + k + '" data-act="bindkey" data-v="' + k + '" class="chip-b' + (wk ? ' wait' : '') + '">' + (wk ? 'Press a key…' : 'Key: ' + keyLabel(K[k])) + '</button></span></div>';
    });
    const wu = listening && listening.kind === 'key' && listening.act === 'undo';
    h += '<div class="row bind"><span class="rl">Undo<small>Keyboard only. The Select button also undoes.</small></span><span class="bchips"><button data-f data-k="bk-undo" data-act="bindkey" data-v="undo" class="chip-b' + (wu ? ' wait' : '') + '">' + (wu ? 'Press a key…' : 'Key: ' + keyLabel(K.undo)) + '</button></span></div>';
    h += '<div class="btnrow"><button class="btn" data-f data-k="breset" data-act="breset">Reset mapping</button><button class="btn pri" data-f data-def data-k="bdone" data-act="bdone">Done</button></div>';
    h += '<p class="about">D-pad and stick always move. WASD and arrow keys move on a keyboard. Escape cancels a rebind.</p>';
    return h;
  },
  after(){
    pageTimer(() => {
      const L = typeof padLive !== 'undefined' ? padLive : { held: [], ax: 0, ay: 0 }, B = S.binds;
      $$('.pt[data-pb]').forEach(el => el.classList.toggle('lit', L.held.includes(B[el.dataset.pb])));
      const st = $('#ptStick'); if (st) st.textContent = 'Stick ' + L.ax.toFixed(2) + ', ' + L.ay.toFixed(2);
      const ss = $('#ptStatus'); if (ss) ss.textContent = padConnected ? 'Controller connected' : 'No controller found. Press any button on it.';
    }, 60);
  }
};
ACTIONS.bindpad = el => { if (!padConnected) { toast('No controller found. Press a button on it first.'); return; } listenFor('pad', el.dataset.v); };
ACTIONS.bindkey = el => listenFor('key', el.dataset.v);
ACTIONS.breset = () => { stopListening(); S.binds = JSON.parse(JSON.stringify(DEFAULTS.binds)); S.keys = JSON.parse(JSON.stringify(DEFAULTS.keys)); save(); toast('Mapping reset'); refresh(); };
ACTIONS.bdone = () => { stopListening(); back(); };
