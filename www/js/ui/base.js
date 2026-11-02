/* ================= UI BASE: helpers, icons, toast, modal ================= */
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDur = ms => { const m = Math.floor(ms / 60000); return m < 1 ? (ms > 0 ? '<1 min' : '0 min') : m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; };

const ic = p => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
const ICON = {
  store: ic('<path d="M4 8h16l-1.2 11H5.2z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/>'),
  library: ic('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
  progress: ic('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3"/><path d="M12 13v4M8.5 20h7"/>'),
  settings: ic('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>'),
  search: ic('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
  back: ic('<path d="M15 5l-7 7 7 7"/>'),
  home: ic('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'),
  arcade: ic('<rect x="3" y="8" width="18" height="9" rx="4.5"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".7"/><circle cx="17.5" cy="13.5" r=".7"/>'),
  puzzle: ic('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="3.5"/><path d="M4 14h7v6H4zM13 20l3.5-6 3.5 6z"/>'),
  board: ic('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>'),
  sports: ic('<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>'),
  mine: ic('<path d="M3.5 7.5a1.5 1.5 0 0 1 1.5-1.5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17z"/><path d="M12 11v4M10 13h4"/>'),
  word: ic('<path d="M5 19L10 5l5 14M7 14h6M17 8h3M17 12h3M17 16h3"/>')
};
const VIEWS = [
  ['grid', 'Grid', ic('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>')],
  ['compact', 'Compact', ic('<path d="M4 5h4v4H4zM10 5h4v4h-4zM16 5h4v4h-4zM4 11h4v4H4zM10 11h4v4h-4zM16 11h4v4h-4zM4 17h4v3H4zM10 17h4v3h-4zM16 17h4v3h-4z"/>')],
  ['list', 'List', ic('<path d="M4 6h16M4 12h16M4 18h16"/>')],
  ['tiles', 'Tiles', ic('<rect x="3.5" y="4" width="17" height="7" rx="1.8"/><rect x="3.5" y="13" width="17" height="7" rx="1.8"/>')]
];

/* ---------- toast ---------- */
let toastT = 0;
function toast(msg){
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.className = 'show'; clearTimeout(toastT);
  toastT = setTimeout(() => { t.className = ''; }, 2600);
}

/* ---------- modal (touch, keyboard and controller) ---------- */
let modal = null, modalReturn = null;
function confirmBox(title, text, yes, fn){
  openModal({ title, text, buttons: [{ label: 'Cancel' }, { label: yes, primary: true, danger: true, fn }] });
}
function openModal(m){
  modal = m; modalReturn = typeof fxEl !== 'undefined' ? fxEl : null;
  renderModal();
  const el = $('#modalIn') || $('#modalTa') || $('#modal').querySelector('[data-mb="' + (m.buttons.length - 1) + '"]');
  if (el) { setFx(el, false); if (el.id === 'modalIn') { try { el.focus(); el.select(); } catch (e) {} } }
}
function closeModal(){
  const had = modal; modal = null; renderModal();
  if (had && modalReturn && document.contains(modalReturn)) setFx(modalReturn, false);
  modalReturn = null;
}
function renderModal(){
  const el = $('#modal'); if (!el) return;
  if (!modal) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'flex';
  el.innerHTML = '<div class="dlg" role="dialog" aria-modal="true"><h2>' + esc(modal.title) + '</h2>' + (modal.text ? '<p>' + esc(modal.text) + '</p>' : '') +
    (modal.input !== undefined ? '<input data-f data-k="mi" id="modalIn" maxlength="' + (modal.max || 30) + '" value="' + esc(modal.input) + '" autocomplete="off">' : '') +
    (modal.textarea !== undefined ? '<textarea data-f data-k="mt" id="modalTa" rows="4" spellcheck="false">' + esc(modal.textarea) + '</textarea>' : '') +
    (modal.file ? '<input data-f data-k="mf" type="file" id="modalFile" accept=".json,application/json,text/plain">' : '') +
    '<p class="err" id="modalErr"></p><div class="btns">' + modal.buttons.map((b, i) => '<button data-f data-k="mb' + i + '" data-mb="' + i + '" class="btn' + (b.primary ? (b.danger ? ' pri dangerfill' : ' pri') : '') + '">' + esc(b.label) + '</button>').join('') + '</div></div>';
  const f = $('#modalFile');
  if (f) f.onchange = () => { const file = f.files && f.files[0]; if (!file) return; const r = new FileReader(); r.onload = () => { const ta = $('#modalTa'); if (ta) ta.value = String(r.result); }; r.readAsText(file); };
  const inp = $('#modalIn'); if (inp) inp.onkeydown = e => { if (e.key === 'Enter') modalPick(modal.buttons.length - 1); };
}
function modalPick(i){
  const m = modal, b = m && m.buttons[i]; if (!b) return;
  const inp = $('#modalIn'), ta = $('#modalTa');
  const val = inp ? inp.value : ta ? ta.value : undefined;
  if (b.fn) { const r = b.fn(val); if (r === false) return; }
  if (modal === m) closeModal();
}
