/* ================= PAGE: MY GAMES (HTML games you add yourself, stored on the device, played offline) ================= */
const MINE_DB = 'pa_mygames';
let MINE = null, mineBusy = false;
function mineOpen(){
  return new Promise((ok, no) => {
    let r; try { r = indexedDB.open(MINE_DB, 1); } catch (e) { no(e); return; }
    r.onupgradeneeded = () => r.result.createObjectStore('g', { keyPath: 'id' });
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
  });
}
const mineTx = (mode, fn) => mineOpen().then(db => new Promise((ok, no) => { const t = db.transaction('g', mode), s = t.objectStore('g'); const q = fn(s); t.oncomplete = () => ok(q && q.result); t.onerror = () => no(t.error); }));
const mineAll = () => mineTx('readonly', s => s.getAll()).then(a => (a || []).sort((x, y) => y.added - x.added));
const minePut = g => mineTx('readwrite', s => s.put(g));
const mineDel = id => mineTx('readwrite', s => s.delete(id));
const MINE_COLORS = ['#2f7a4a', '#7a4fb5', '#b5651d', '#2a5a9a', '#a83246', '#3a6a7a', '#8a5a2a', '#6a3fa0'];
const MINE_EMOJI = ['🎲', '🕹️', '👾', '🚀', '🧩', '🏁', '⚔️', '🐸'];
function mineLoad(){ mineAll().then(a => { MINE = a; if (route.page === 'mine') refresh(); }).catch(() => { MINE = []; if (route.page === 'mine') refresh(); }); }

PAGES.mine = {
  hints: () => '<span><kbd>A</kbd>Play</span><span><kbd>Y</kbd>Remove</span><span><kbd>B</kbd>Back</span>',
  render(){
    if (MINE === null) { mineLoad(); return '<h1 class="page-h">My Games</h1><div class="empty">Loading…</div>'; }
    let h = '<div class="ph"><h1 class="page-h">My Games</h1><div class="phr"><button class="btn pri" data-f data-def data-k="mine-add" data-act="mineadd">+ Add HTML game</button></div></div>';
    h += '<p class="subl">Add single-file HTML games from your device. They are stored in the app and play offline. Only add games you made or have permission to use.</p>';
    if (!MINE.length) return h + '<div class="empty"><b>Nothing here yet</b>Choose “Add HTML game” and pick one or more .html files. Games that load extra files from the internet need those files inside the same HTML file to work offline.</div>';
    h += '<div class="plist">' + MINE.map(g => '<button class="card lrow" data-f data-k="m-' + g.id + '" data-act="mineplay" data-id="' + g.id + '" style="--c:' + g.color + '"><span class="th">' + g.emoji + '</span><span class="li-t"><b>' + esc(g.name) + '</b><small>' + Math.max(1, Math.round(g.size / 1024)) + ' KB · added ' + new Date(g.added).toLocaleDateString() + '</small></span><span class="fav" data-act="minerename" data-id="' + g.id + '" role="button" aria-label="Rename">✎</span><span class="more" data-act="minedel" data-id="' + g.id + '" role="button" aria-label="Remove">🗑</span></button>').join('') + '</div>';
    return h;
  },
  y(el){ const id = el && el.dataset && el.dataset.id; if (id) mineRemove(id); }
};
ACTIONS.mineadd = () => {
  const f = document.createElement('input'); f.type = 'file'; f.accept = '.html,.htm,text/html'; f.multiple = true;
  f.onchange = async () => {
    let n = 0;
    for (const file of Array.from(f.files || [])) {
      if (file.size > 12 * 1024 * 1024) { toast(file.name + ' is too big (12 MB limit)'); continue; }
      try {
        const html = await file.text(); if (!/<(html|body|script|canvas)/i.test(html)) { toast(file.name + ' does not look like an HTML game'); continue; }
        const nm = file.name.replace(/\.html?$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 40) || 'Game', i = Math.floor(Math.random() * 8);
        await minePut({ id: 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e4), name: nm, html, size: file.size, added: Date.now(), color: MINE_COLORS[i], emoji: MINE_EMOJI[i] }); n++;
      } catch (e) { toast('Could not add ' + file.name); }
    }
    if (n) { toast(n + (n === 1 ? ' game added' : ' games added')); MINE = null; refresh(); }
  };
  f.click();
};
ACTIONS.mineplay = el => { const g = (MINE || []).find(x => x.id === el.dataset.id); if (g) mineStart(g); };
ACTIONS.minedel = (el, e) => { e.stopPropagation(); mineRemove(el.dataset.id); };
ACTIONS.minerename = (el, e) => {
  e.stopPropagation(); const g = (MINE || []).find(x => x.id === el.dataset.id); if (!g) return;
  openModal({ title: 'Rename game', input: g.name, max: 40, buttons: [{ label: 'Cancel' }, { label: 'Save', primary: true, fn: v => { const n = (v || '').trim(); if (n) { g.name = n.slice(0, 40); minePut(g).then(() => refresh()); } } }] });
};
function mineRemove(id){
  const g = (MINE || []).find(x => x.id === id); if (!g) return;
  confirmBox('Remove ' + g.name + '?', 'This deletes the saved copy from the app. Your original file is not touched.', 'Remove', () => { mineDel(id).then(() => { MINE = null; refresh(); toast('Removed'); }); });
}
/* ----- playing: a sandboxed frame. Controller buttons are forwarded as key presses. ----- */
const WEB_SHIM = '<script>(function(){try{localStorage.length}catch(e){var m={};var s={getItem:function(k){return k in m?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(i){return Object.keys(m)[i]||null},get length(){return Object.keys(m).length}};try{Object.defineProperty(window,"localStorage",{value:s});Object.defineProperty(window,"sessionStorage",{value:s})}catch(x){}}addEventListener("message",function(e){var d=e.data;if(!d||d.pa!=="key")return;var t=document.activeElement&&document.activeElement!==document.body?document.activeElement:document;var ev=new KeyboardEvent(d.type,{key:d.key,code:d.code,keyCode:d.kc,which:d.kc,bubbles:true});try{Object.defineProperty(ev,"keyCode",{get:function(){return d.kc}});Object.defineProperty(ev,"which",{get:function(){return d.kc}})}catch(x){}document.dispatchEvent(ev);window.dispatchEvent(ev)})})()<\/script>';
const WEB_KEYS = { u: ['ArrowUp', 'ArrowUp', 38], d: ['ArrowDown', 'ArrowDown', 40], l: ['ArrowLeft', 'ArrowLeft', 37], r: ['ArrowRight', 'ArrowRight', 39], a: [' ', 'Space', 32], b: ['Escape', 'Escape', 27], x: ['x', 'KeyX', 88], y: ['z', 'KeyZ', 90], start: ['Enter', 'Enter', 13] };
function webSend(k, type){ const f = $('#webframe'), v = WEB_KEYS[k]; if (!f || !f.contentWindow || !v) return; try { f.contentWindow.postMessage({ pa: 'key', type, key: v[0], code: v[1], kc: v[2] }, '*'); } catch (e) {} }
function webPress(k, down){ webSend(k, down ? 'keydown' : 'keyup'); }
function mineStart(g){
  closeModal(); stop(); mode = 'web'; stopPageTimers();
  let w = $('#webgame'); if (w) w.remove();
  w = document.createElement('div'); w.id = 'webgame';
  w.innerHTML = '<div class="wbar"><button id="webExit" class="gbtn">&larr; My Games <kbd>Select</kbd></button><b>' + esc(g.name) + '</b></div><iframe id="webframe" sandbox="allow-scripts allow-pointer-lock allow-forms allow-modals" allow="gamepad; fullscreen" title="' + esc(g.name) + '"></iframe>';
  document.body.appendChild(w);
  $('#webExit').onclick = mineExit;
  const f = $('#webframe'); f.srcdoc = WEB_SHIM + g.html;
  setTimeout(() => { const b = w.querySelector('.wbar'); if (b) b.classList.add('fade'); }, 3500);
  try { document.documentElement.style.background = '#000'; } catch (e) {}
  toast('Press Select to exit');
}
function mineExit(){ const w = $('#webgame'); if (w) w.remove(); try { document.documentElement.style.background = ''; } catch (e) {} showHome(); }
