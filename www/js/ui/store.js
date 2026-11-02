/* ================= PAGE: STORE ================= */
let heroIdx = 0;
const heroList = () => FEATURED.map(byId).filter(Boolean);

function heroHTML(){
  const list = heroList(); heroIdx = ((heroIdx % list.length) + list.length) % list.length;
  const g = list[heroIdx], own = isOwned(g.id);
  return '<div class="hero-main" style="--c:' + g.color + '"><span class="hero-art">' + g.emoji + '</span>' +
    '<span class="kick">' + (own ? 'In your library' : 'Featured') + '</span><h1>' + esc(g.name) + '</h1><p>' + esc(g.tagline) + '</p>' +
    '<div class="btns"><button class="btn light" data-f data-def data-k="hero-main" data-act="' + (own ? 'play' : 'get') + '" data-id="' + g.id + '">' + (own ? 'Play' : 'Get') + '</button>' +
    '<button class="btn ghost" data-f data-k="hero-more" data-act="detail" data-id="' + g.id + '">Details</button></div></div>' +
    '<div class="hero-list">' + list.map((x, i) => '<button class="hero-li' + (i === heroIdx ? ' on' : '') + '" data-f data-k="hl-' + i + '" data-act="hero" data-v="' + i + '" style="--c:' + x.color + '"><span class="th">' + x.emoji + '</span><b>' + esc(x.name) + '</b></button>').join('') + '</div>';
}
function drawHero(keepKey){
  const h = $('#hero'); if (!h) return;
  h.innerHTML = heroHTML();
  if (keepKey) { const el = h.querySelector('[data-k="' + keepKey + '"]'); if (el) setFx(el, false); }
  else if (fxEl && !document.contains(fxEl)) setFx(h.querySelector('[data-def]'), false);
}

PAGES.store = {
  search: true,
  hints: () => '<span><kbd>A</kbd>Details</span><span><kbd>X</kbd>Get or play</span><span><kbd>Y</kbd>Favourite</span><span><kbd>L1</kbd><kbd>R1</kbd>Featured</span>',
  render(){
    const q = SEARCH.q.trim().toLowerCase();
    if (q) {
      const hits = games.filter(g => (g.name + ' ' + g.tagline + ' ' + catName(g.cat)).toLowerCase().includes(q));
      return viewBar('Results for “' + SEARCH.q.trim() + '”') +
        (hits.length ? gridOf(hits, 'store', ctxOwn) : '<div class="empty"><b>No games match</b>Try another word, or clear the search to browse everything.</div>');
    }
    const notOwned = games.filter(g => !isOwned(g.id)).sort((a, b) => (FEATURED.includes(b.id) ? 1 : 0) - (FEATURED.includes(a.id) ? 1 : 0));
    let h = '<div class="hero" id="hero">' + heroHTML() + '</div>';
    h += notOwned.length ? railOf('Add to your library', notOwned.length + ' to get', notOwned.slice(0, 16), 'store')
      : '<section class="sec"><div class="empty"><b>You have every game</b>New games will show up here.</div></section>';
    for (const c of CATS) h += railOf(c.name, '', games.filter(g => g.cat === c.id), 'store');
    return h;
  },
  after(){
    if (SEARCH.q.trim()) return;
    pageTimer(() => {
      const hero = $('#hero'); if (!hero || modal || document.hidden || S.motion) return;
      if (document.activeElement === $('#q') || (fxEl && fxEl.closest && fxEl.closest('#hero'))) return;
      try { if (hero.matches(':hover')) return; } catch (e) {}
      heroIdx++; drawHero();
    }, 7000);
  },
  x(el){
    const g = cardOf(el) || (el && el.dataset && el.dataset.id && byId(el.dataset.id)); if (!g) return;
    if (isOwned(g.id)) play(g); else getGame(g, el.classList.contains('btn') ? el : null);
  },
  y(el){ const g = cardOf(el) || (el && el.dataset && el.dataset.id && byId(el.dataset.id)); if (g) favToggle(g.id); },
  shoulder(d){ if (SEARCH.q.trim()) return; heroIdx += d; drawHero(); }
};

ACTIONS.hero = el => { heroIdx = +el.dataset.v; drawHero('hl-' + heroIdx); };
ACTIONS.get = el => { const g = byId(el.dataset.id); if (g) getGame(g, el); };
ACTIONS.play = el => { const g = byId(el.dataset.id); if (g) play(g); };
ACTIONS.detail = el => go('detail', { id: el.dataset.id, from: route.page }, true);
