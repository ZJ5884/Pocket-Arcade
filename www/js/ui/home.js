/* ================= PAGES: HOME and BROWSE (one tab per genre) ================= */
const greet = () => { const h = new Date().getHours(); return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const dayN = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
const ago = t => { if (!t) return ''; const m = Math.floor((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.floor(m / 60) + ' h ago' : Math.floor(m / 1440) + ' d ago'; };

PAGES.home = {
  hints: () => '<span><kbd>A</kbd>Open</span><span><kbd>X</kbd>Get or play</span><span><kbd>Y</kbd>Favourite</span><span><kbd>Start</kbd>Settings</span>',
  render(){
    const own = ownedGames(), last = DB.recent.map(byId).find(g => g && isOwned(g.id));
    const earned = Object.keys(DB.trophies || {}).length;
    let h = '<div class="hello"><h1 class="page-h">' + greet() + ', ' + esc(DB.profile.name) + '</h1><p class="subl">' + own.length + ' games in your library</p></div>';
    if (last) {
      const d = DB.games[last.id] || {}, lv = getLevel(last.id), best = getBest(last.id, lv);
      h += '<div class="cont" style="--c:' + last.color + '"><span class="cart">' + last.emoji + '</span><div class="ct"><small>Continue playing</small><h2>' + esc(last.name) + '</h2><p>' + LEVELS[lv] + (best ? ' · Best ' + best : '') + (d.last ? ' · ' + ago(d.last) : '') + '</p></div>' +
        '<div class="btns"><button class="btn light" data-f data-def data-k="cont" data-act="play" data-id="' + last.id + '">Play</button><button class="btn ghost" data-f data-k="cont-more" data-act="detail" data-id="' + last.id + '">Details</button></div></div>';
    } else {
      h += '<div class="cont" style="--c:#3a4fb0"><span class="cart">🎮</span><div class="ct"><small>Welcome</small><h2>Pick your first game</h2><p>Your library starts with ' + own.length + ' games. Find more in the Store.</p></div><div class="btns"><button class="btn light" data-f data-def data-k="cont" data-act="nav" data-v="library">Open Library</button><button class="btn ghost" data-f data-k="cont-more" data-act="nav" data-v="store">Visit Store</button></div></div>';
    }
    h += '<div class="totals"><div><b>' + DB.totals.plays + '</b><span>rounds played</span></div><div><b>' + fmtDur(DB.totals.ms) + '</b><span>time played</span></div><div><b>' + earned + ' / ' + TROPHIES.length + '</b><span>trophies</span></div><div><b>' + DB.favs.length + '</b><span>favourites</span></div></div>';
    const recent = DB.recent.map(byId).filter(g => g && isOwned(g.id));
    if (recent.length) h += railOf('Recently played', '', recent, 'library');
    const favs = own.filter(g => isFav(g.id));
    if (favs.length) h += railOf('Favourites', '', favs, 'library');
    const n = dayN(), pick = [0, 7, 13, 19, 29].map(k => games[(n * 3 + k) % games.length]).filter((g, i, a) => a.indexOf(g) === i);
    h += railOf('Picks for today', 'changes every day', pick, null, ctxOwn);
    const fresh = games.filter(g => !isOwned(g.id)).slice(-10).reverse();
    if (fresh.length) h += railOf('New in the Store', '', fresh, 'store');
    return h;
  },
  x(el){ PAGES.store.x(el); },
  y(el){ PAGES.store.y(el); }
};

let browseCat = 'arcade';
PAGES.browse = {
  search: true,
  hints: () => '<span><kbd>A</kbd>Open</span><span><kbd>X</kbd>Get or play</span><span><kbd>Y</kbd>Favourite</span><span><kbd>V</kbd>View</span>',
  render(p){
    if (p && p.cat) browseCat = p.cat;
    const q = SEARCH.q.trim().toLowerCase();
    let list = games.filter(g => g.cat === browseCat);
    if (q) list = list.filter(g => (g.name + ' ' + g.tagline).toLowerCase().includes(q));
    const have = list.filter(g => isOwned(g.id)).length;
    let h = viewBar(catName(browseCat));
    h += '<p class="subl">' + list.length + ' games · ' + have + ' in your library</p>';
    h += list.length ? gridOf(list, null, ctxOwn) : '<div class="empty"><b>No games match</b>Try another word.</div>';
    return h;
  },
  x(el){ PAGES.store.x(el); },
  y(el){ PAGES.store.y(el); }
};
