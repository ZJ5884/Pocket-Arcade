/* ================= UI CARDS: poster cards shared by Store and Library ================= */
const CATS = [
  { id: 'arcade', name: 'Arcade' }, { id: 'puzzle', name: 'Puzzle' }, { id: 'board', name: 'Board & cards' },
  { id: 'sports', name: 'Sports' }, { id: 'word', name: 'Word' }
];
const catName = id => (CATS.find(c => c.id === id) || { name: id }).name;

function metaOf(g, ctx){
  const own = isOwned(g.id);
  if (ctx === 'library') { const lv = getLevel(g.id), best = getBest(g.id, lv); return ['<small>' + LEVELS[lv] + '</small><b>' + (best ? 'Best ' + best : 'No score yet') + '</b>', LEVELS[lv] + ' · ' + (best ? 'Best ' + best : 'No score yet')]; }
  return ['<small>' + catName(g.cat) + '</small><b' + (own ? ' class="own">In library' : '>Free') + '</b>', catName(g.cat) + ' · ' + (own ? 'In library' : 'Free')];
}
const favBtn = g => '<span class="fav' + (isFav(g.id) ? ' on' : '') + '" data-fav="' + g.id + '" role="button" aria-label="Favourite">' + (isFav(g.id) ? '★' : '☆') + '</span>';
const moreBtn = g => '<span class="more" data-more="' + g.id + '" role="button" aria-label="Details for ' + esc(g.name) + '">⋯</span>';
function cardHTML(g, ctx, view){
  view = view || 'grid';
  const m = metaOf(g, ctx), attrs = ' data-f data-k="c-' + g.id + '" data-id="' + g.id + '" data-ctx="' + ctx + '" style="--c:' + g.color + '"';
  if (view === 'list') return '<button class="card lrow"' + attrs + '><span class="th">' + g.emoji + '</span><span class="li-t"><b>' + esc(g.name) + '</b><small>' + esc(g.tagline) + '</small></span><span class="li-m">' + m[1] + '</span>' + favBtn(g) + moreBtn(g) + '</button>';
  if (view === 'tiles') return '<button class="card tile"' + attrs + '><span class="tart">' + g.emoji + '</span><span class="tt"><b>' + esc(g.name) + '</b><small>' + esc(g.tagline) + '</small><em>' + m[1] + '</em></span>' + favBtn(g) + moreBtn(g) + '</button>';
  return '<button class="card"' + attrs + '><span class="poster"><span class="e">' + g.emoji + '</span><span class="nm">' + esc(g.name) + '</span>' + moreBtn(g) + favBtn(g) + '</span><span class="meta">' + m[0] + '</span></button>';
}
function gridOf(list, ctx, ctxFn){
  const v = S.view, c = g => ctxFn ? ctxFn(g) : ctx, cls = v === 'list' ? 'plist' : v === 'tiles' ? 'ptiles' : 'pgrid';
  return '<div class="' + cls + '">' + list.map(g => cardHTML(g, c(g), v)).join('') + '</div>';
}
function railOf(title, small, list, ctx, ctxFn){
  return '<section class="sec"><h2>' + esc(title) + (small ? '<small>' + esc(small) + '</small>' : '') + '</h2><div class="rail">' + list.map(g => cardHTML(g, ctxFn ? ctxFn(g) : ctx, 'grid')).join('') + '</div></section>';
}
/* header row with the page title and the view switcher */
function viewBar(title, extra){
  return '<div class="ph"><h1 class="page-h">' + esc(title) + '</h1><div class="phr">' + (extra || '') + '<div class="vseg" role="group" aria-label="View">' +
    VIEWS.map(v => '<button data-f data-k="v-' + v[0] + '" data-act="view" data-v="' + v[0] + '" class="' + (S.view === v[0] ? 'on' : '') + '" aria-label="' + v[1] + ' view" title="' + v[1] + '">' + v[2] + '</button>').join('') + '</div></div></div>';
}
function setView(v){ S.view = v; save(); applyLook(); render({ key: 'v-' + v, scroll: content().scrollTop }); }
function cycleView(){ if (!['library', 'browse', 'store'].includes(route.page)) return; const i = VIEWS.findIndex(v => v[0] === S.view); const v = VIEWS[(i + 1) % VIEWS.length][0]; toast(VIEWS.find(x => x[0] === v)[1] + ' view'); setView(v); }
ACTIONS.view = el => setView(el.dataset.v);
const ctxOwn = g => isOwned(g.id) ? 'library' : 'store';

function favToggle(id){
  toggleFav(id); checkTrophies();
  const g = byId(id); if (g) toast(isFav(id) ? 'Added ' + g.name + ' to favourites' : 'Removed ' + g.name + ' from favourites');
  refresh();
}
function cardOpen(el){
  const g = byId(el.dataset.id); if (!g) return;
  if (el.dataset.ctx === 'library') play(g);
  else go('detail', { id: g.id, from: route.page }, true);
}
const cardOf = el => el && el.classList && el.classList.contains('card') ? byId(el.dataset.id) : null;

/* Get a game from anywhere. If a button is passed, it shows a progress bar while installing. */
async function getGame(g, btn){
  if (isOwned(g.id) || installing.has(g.id)) return;
  if (btn) { btn.innerHTML = '<i class="bar"></i>Installing…'; void btn.offsetWidth; btn.classList.add('busy'); }
  else toast('Installing ' + g.name + '…');
  const ok = await install(g);
  if (ok) toast(g.name + ' is in your library');
  refresh();
}
