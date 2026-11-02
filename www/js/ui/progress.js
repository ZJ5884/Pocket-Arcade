/* ================= PAGE: PROGRESS ================= */
const TROPHIES = [
  { id: 'first',    name: 'First credit',  desc: 'Play any game',               test: () => DB.totals.plays >= 1 },
  { id: 'tried5',   name: 'Sampler',       desc: 'Try 5 different games',       test: () => tried() >= 5 },
  { id: 'tried15',  name: 'Regular',       desc: 'Try 15 different games',      test: () => tried() >= 15 },
  { id: 'triedAll', name: 'Completionist', desc: 'Try every game',              test: () => tried() >= games.length },
  { id: 'plays25',  name: 'Warming up',    desc: 'Play 25 rounds',              test: () => DB.totals.plays >= 25 },
  { id: 'plays100', name: 'Arcade rat',    desc: 'Play 100 rounds',             test: () => DB.totals.plays >= 100 },
  { id: 'hour',     name: 'Long haul',     desc: 'Play for an hour in total',   test: () => DB.totals.ms >= 3600000 },
  { id: 'hard3',    name: 'Brave',         desc: 'Score on Hard in 3 games',    test: () => hardScored() >= 3 },
  { id: 'hard10',   name: 'Fearless',      desc: 'Score on Hard in 10 games',   test: () => hardScored() >= 10 },
  { id: 'fav3',     name: 'Curator',       desc: 'Favourite 3 games',           test: () => DB.favs.length >= 3 },
  { id: 'style',    name: 'Made it yours', desc: 'Change the theme or accent',  test: () => S.theme !== DEFAULTS.theme || S.accent !== DEFAULTS.accent },
  { id: 'shop',     name: 'Window shopper', desc: 'Get a game from the Store',  test: () => ownedGames().some(g => !STARTER.includes(g.id)) },
  { id: 'collect',  name: 'Collector',     desc: 'Own 20 games',                test: () => ownedGames().length >= 20 }
];
const tried = () => games.filter(g => DB.games[g.id] && DB.games[g.id].plays > 0).length;
const hardScored = () => games.filter(g => DB.games[g.id] && DB.games[g.id].best[2] > 0).length;
function checkTrophies(){
  DB.trophies = DB.trophies || {}; let fresh = null;
  for (const t of TROPHIES) if (!DB.trophies[t.id] && t.test()) { DB.trophies[t.id] = Date.now(); fresh = fresh || t; }
  if (fresh) { toast('Trophy unlocked: ' + fresh.name); save(); }
}
function cycleAvatar(){ const i = AVATARS.indexOf(DB.profile.avatar); DB.profile.avatar = AVATARS[(i + 1) % AVATARS.length]; save(); refresh(); }
function rename(){
  openModal({ title: 'Your name', input: DB.profile.name, max: 14, buttons: [
    { label: 'Cancel' }, { label: 'Save', primary: true, fn: v => { const n = (v || '').trim().slice(0, 14); if (n) { DB.profile.name = n; save(); renderMe(); if (route.page === 'progress') refresh(); } } }] });
}

PAGES.progress = {
  hints: () => '<span><kbd>X</kbd>New avatar</span><span><kbd>Y</kbd>Rename</span><span><kbd>B</kbd>Back</span>',
  render(){
    checkTrophies();
    const earned = TROPHIES.filter(t => DB.trophies && DB.trophies[t.id]).length;
    const rows = games.filter(g => isOwned(g.id) || (DB.games[g.id] && DB.games[g.id].plays));
    return '<div class="profile"><button class="avatar" data-f data-k="avatar" data-act="avatar" aria-label="Change avatar">' + DB.profile.avatar + '</button>' +
      '<div><h2>' + esc(DB.profile.name) + '</h2><p>Playing since ' + new Date(DB.created).toLocaleDateString() + '</p></div>' +
      '<div class="pbtns"><button class="btn" data-f data-k="rename" data-act="rename">Rename <kbd>Y</kbd></button><button class="btn" data-f data-k="avcycle" data-act="avatar">New avatar <kbd>X</kbd></button></div></div>' +
      '<div class="totals"><div><b>' + DB.totals.plays + '</b><span>rounds played</span></div><div><b>' + fmtDur(DB.totals.ms) + '</b><span>time played</span></div><div><b>' + ownedGames().length + ' / ' + games.length + '</b><span>games in library</span></div><div><b>' + earned + ' / ' + TROPHIES.length + '</b><span>trophies</span></div></div>' +
      '<h3 class="sh">Trophies</h3><div class="trophies">' + TROPHIES.map(t => { const on = DB.trophies && DB.trophies[t.id]; return '<div class="troph' + (on ? ' on' : '') + '"><span class="ti">' + (on ? '🏆' : '🔒') + '</span><b>' + t.name + '</b><small>' + t.desc + '</small></div>'; }).join('') + '</div>' +
      '<h3 class="sh">Best scores</h3><table class="scores"><thead><tr><th>Game</th><th>Easy</th><th>Normal</th><th>Hard</th><th>Rounds</th><th>Time</th></tr></thead><tbody>' +
      rows.map(g => { const d = DB.games[g.id] || { best: {}, plays: 0, ms: 0 }; return '<tr><td>' + g.emoji + ' ' + esc(g.name) + '</td>' + [0, 1, 2].map(l => '<td>' + (d.best[l] || '–') + '</td>').join('') + '<td>' + (d.plays || '–') + '</td><td>' + (d.ms ? fmtDur(d.ms) : '–') + '</td></tr>'; }).join('') +
      '</tbody></table>';
  },
  x(){ cycleAvatar(); },
  y(){ rename(); }
};
ACTIONS.avatar = () => cycleAvatar();
ACTIONS.rename = () => rename();
