/* ================= BOOT ================= */
useDB(loadLocal());
applyLook(); applyScreen();
buildShell();
route = { page: ['home', 'store', 'library'].includes(S.start) ? S.start : 'home', params: {} };
if (S.splash && $('#splash')) { const sp = $('#splash'); setTimeout(() => sp.classList.add('out'), 700); setTimeout(() => sp.remove(), 1200); } else if ($('#splash')) $('#splash').remove();
showHome();
loadNative(() => { applyLook(); applyScreen(); if (mode === 'ui') refresh(); });

/* Load the games in your library in the background so Play is instant. */
(window.requestIdleCallback || (f => setTimeout(f, 300)))(() => preloadOwned());

/* Android back button */
(function nativeBack(){
  const A = plug('App'); if (!A || !A.addListener) return;
  try {
    A.addListener('backButton', () => { if (mode === 'web') mineExit(); else if (mode === 'play') toMenu(); else uiB(); });
    A.addListener('pause', flush);
    A.addListener('appStateChange', st => { if (st && st.isActive === false) { tickPlay(); flush(); } });
  } catch (e) {}
})();

$('#again').onclick = () => start(current);
$('#lvl').onclick = () => { const v = (getLevel(current.id) + 1) % 3; setLevel(current.id, v); start(current); };
$('#tomenu').onclick = toMenu;
$('#undoBtn').onclick = onUndo;
$('#back').onclick = toMenu;

if (!isNative() && 'serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  navigator.serviceWorker.ready.then(() => { offlineReady = true; updateBadge(); });
}
