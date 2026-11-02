/* ================= PAGE: LIBRARY ================= */
const LIBTABS = [{ id: 'all', name: 'All' }, { id: 'recent', name: 'Recent' }, { id: 'fav', name: 'Favourites' }].concat(CATS);
let libTab = 'all';

function libList(){
  const own = ownedGames(), q = SEARCH.q.trim().toLowerCase();
  let l = libTab === 'all' ? own : libTab === 'recent' ? DB.recent.map(byId).filter(g => g && isOwned(g.id)) : libTab === 'fav' ? own.filter(g => isFav(g.id)) : own.filter(g => g.cat === libTab);
  if (q) l = own.filter(g => g.name.toLowerCase().includes(q));
  return sortList(l);
}
const SORTS = [['default', 'Default'], ['az', 'A to Z'], ['recent', 'Recently played'], ['plays', 'Most played'], ['best', 'Favourites first']];
function sortList(l){
  const k = S.sort || 'default', a = l.slice();
  if (k === 'az') a.sort((x, y) => x.name.localeCompare(y.name));
  else if (k === 'recent') a.sort((x, y) => ((DB.games[y.id] || {}).last || 0) - ((DB.games[x.id] || {}).last || 0));
  else if (k === 'plays') a.sort((x, y) => ((DB.games[y.id] || {}).plays || 0) - ((DB.games[x.id] || {}).plays || 0));
  else if (k === 'best') a.sort((x, y) => (isFav(y.id) ? 1 : 0) - (isFav(x.id) ? 1 : 0));
  return a;
}
const sortBtn = () => '<button class="tabbtn sortb" data-f data-k="sort" data-act="sort">Sort: ' + SORTS.find(s => s[0] === (S.sort || 'default'))[1] + '</button>';
ACTIONS.sort = () => { const i = SORTS.findIndex(s => s[0] === (S.sort || 'default')); S.sort = SORTS[(i + 1) % SORTS.length][0]; save(); render({ key: 'sort' }); };
PAGES.library = {
  search: true,
  hints: () => '<span><kbd>A</kbd>Play</span><span><kbd>X</kbd>Details</span><span><kbd>Y</kbd>Favourite</span><span><kbd>L1</kbd><kbd>R1</kbd>Filter</span><span><kbd>V</kbd>View</span>',
  render(){
    const own = ownedGames(), q = SEARCH.q.trim();
    const list = libList();
    let h = viewBar('Library', sortBtn());
    if (!q) h += '<div class="chips-row">' + LIBTABS.map(t => '<button class="tabbtn' + (t.id === libTab ? ' on' : '') + '" data-f data-k="t-' + t.id + '" data-act="libtab" data-v="' + t.id + '">' + t.name + '</button>').join('') + '</div>';
    if (list.length) return h + gridOf(list, 'library');
    let msg;
    if (!own.length) msg = '<b>Your library is empty</b>Get games from the Store and they will show up here.';
    else if (q) msg = '<b>No games match</b>Try another word.';
    else if (libTab === 'fav') msg = '<b>No favourites yet</b>Highlight a game and press Y, or tap its star.';
    else if (libTab === 'recent') msg = '<b>Nothing played yet</b>Games you play will show up here.';
    else msg = '<b>No installed games here</b>Find more in the Store.';
    return h + '<div class="empty">' + msg + '<br><br><button class="btn pri" data-f data-def data-k="to-store" data-act="nav" data-v="store">Open Store</button></div>';
  },
  x(el){ const g = cardOf(el); if (g) go('detail', { id: g.id, from: 'library' }, true); },
  y(el){ const g = cardOf(el); if (g) favToggle(g.id); },
  shoulder(d){
    if (SEARCH.q.trim()) return;
    const i = LIBTABS.findIndex(t => t.id === libTab);
    libTab = LIBTABS[(i + d + LIBTABS.length) % LIBTABS.length].id;
    render({ key: 't-' + libTab });
  }
};
ACTIONS.libtab = el => { libTab = el.dataset.v; render({ key: 't-' + libTab }); };
