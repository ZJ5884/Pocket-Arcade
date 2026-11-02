/* ================= PAGE: GAME DETAIL ================= */
PAGES.detail = {
  hints: () => '<span><kbd>A</kbd>Select</span><span><kbd>B</kbd>Back</span><span><kbd>Y</kbd>Favourite</span>',
  render(p){
    const g = byId(p.id);
    if (!g) return '<div class="empty"><b>Game not found</b>Go back and pick another.</div>';
    const own = isOwned(g.id), lv = getLevel(g.id), id = g.id;
    const busy = installing.has(id);
    let side = '<div class="d-side"><div class="price">' + (own ? 'In your library' : 'Free') + '</div><div class="sub">' + sizeKB(g) + ' KB · works offline</div>';
    side += own
      ? '<button class="btn pri wide" data-f data-def data-k="main" data-act="play" data-id="' + id + '">Play</button>'
      : '<button class="btn pri wide' + (busy ? ' busy' : '') + '" data-f data-def data-k="main" data-act="get" data-id="' + id + '">' + (busy ? '<i class="bar"></i>Installing…' : 'Get') + '</button>';
    if (own) {
      side += '<h3>Difficulty</h3><div class="seg">' + LEVELS.map((n, i) => '<button data-f data-k="lv' + i + '" data-act="lv" data-id="' + id + '" data-v="' + i + '" class="' + (i === lv ? 'on' : '') + '">' + n + '</button>').join('') + '</div>';
    }
    side += '<button class="btn wide" data-f data-k="fav" data-act="dfav" data-id="' + id + '">' + (isFav(id) ? '★ Remove from favourites' : '☆ Add to favourites') + '</button>';
    const d = DB.games[id];
    if (d && (d.plays || Object.keys(d.best).length)) {
      side += '<h3>Best scores</h3><table class="mini">' + LEVELS.map((n, i) => '<tr><td>' + n + '</td><td>' + (d.best[i] || '–') + '</td></tr>').join('') + '<tr><td>Rounds</td><td>' + (d.plays || 0) + '</td></tr><tr><td>Time</td><td>' + (d.ms ? fmtDur(d.ms) : '–') + '</td></tr></table>';
    }
    if (own) side += '<button class="btn danger wide" data-f data-k="uninstall" data-act="uninstall" data-id="' + id + '">Uninstall</button>';
    side += '</div>';
    return '<div class="d-banner" style="--c:' + g.color + '"><span class="e">' + g.emoji + '</span></div>' +
      '<div class="d-body"><div class="d-main"><h1>' + esc(g.name) + '</h1><div class="tag">' + esc(g.tagline) + '</div>' +
      '<div class="chips"><span class="chip">' + catName(g.cat) + '</span><span class="chip">Single player</span><span class="chip">3 difficulty levels</span></div>' +
      '<p class="desc">' + esc(g.desc) + '</p><h3>Controls</h3><ul class="ctl">' + g.controls.map(c => '<li><kbd>' + esc(c[0]) + '</kbd><span>' + esc(c[1]) + '</span></li>').join('') + '</ul></div>' + side + '</div>';
  },
  y(el){ const p = route.params; if (p.id) favToggle(p.id); }
};
ACTIONS.lv = el => { setLevel(el.dataset.id, +el.dataset.v); refresh(); };
ACTIONS.dfav = el => favToggle(el.dataset.id);
ACTIONS.uninstall = el => {
  const g = byId(el.dataset.id); if (!g) return;
  confirmBox('Uninstall ' + g.name + '?', 'Your scores stay saved. You can get it again from the Store.', 'Uninstall', () => { uninstall(g); toast(g.name + ' uninstalled'); refresh(); });
};
