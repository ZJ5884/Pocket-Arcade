/* ================= PAGE: SETTINGS (tabs; data-driven: add a row to SCHEMA) ================= */
const T_OPTS = o => Object.keys(o).map(k => [k, o[k].name]);
const SCHEMA = [
  { tab: 'Appearance', rows: [
    { k: 'theme', label: 'Theme', type: 'themes' },
    { k: 'accent', label: 'Accent colour', type: 'swatch', opts: ACCENTS },
    { k: 'font', label: 'Font', type: 'choice', opts: [['system', 'System'], ['rounded', 'Rounded'], ['serif', 'Serif'], ['mono', 'Mono']] },
    { k: 'radius', label: 'Corners', type: 'choice', opts: [['round', 'Round'], ['soft', 'Soft'], ['sharp', 'Sharp']] },
    { k: 'bgstyle', label: 'Background', type: 'choice', opts: [['plain', 'Plain'], ['gradient', 'Gradient'], ['glow', 'Glow'], ['pattern', 'Dots']] },
    { k: 'frame', label: 'Game frame', type: 'choice', opts: [['none', 'None'], ['panel', 'Panel'], ['glow', 'Glow']] },
    { k: 'uiScale', label: 'Text size', type: 'choice', opts: [[90, 'Small'], [100, 'Normal'], [115, 'Large'], [130, 'Huge']] },
    { k: 'motion', label: 'Reduce motion', type: 'toggle' } ] },
  { tab: 'Layout', rows: [
    { k: 'view', label: 'Game view', type: 'choice', opts: [['grid', 'Grid'], ['compact', 'Compact'], ['list', 'List'], ['tiles', 'Tiles']] },
    { k: 'nav', label: 'Menu position', type: 'choice', opts: [['auto', 'Auto'], ['side', 'Sidebar'], ['rail', 'Icon rail'], ['bottom', 'Bottom bar']] },
    { k: 'start', label: 'Open the app on', type: 'choice', opts: [['home', 'Home'], ['store', 'Store'], ['library', 'Library']] },
    { k: 'gbars', label: 'Bars while playing', type: 'choice', opts: [['full', 'Full'], ['slim', 'Slim'], ['min', 'Minimal']] },
    { k: 'gfit', label: 'Game screen', type: 'choice', opts: [['fit', 'Fit'], ['stretch', 'Stretch'], ['fill', 'Fill']] },
    { k: 'splash', label: 'Show start-up screen', type: 'toggle' },
    { k: 'hints', label: 'Show button hints', type: 'toggle' } ] },
  { tab: 'Controls', rows: [
    { label: 'Customize button mapping and test your controller', type: 'action', act: () => go('controls', {}, true) },
    { k: 'swapAB', label: 'Swap A and B', type: 'toggle' },
    { k: 'swapXY', label: 'Swap X and Y', type: 'toggle' },
    { k: 'stickMode', label: 'Move with', type: 'choice', opts: [['both', 'Stick and D-pad'], ['stick', 'Stick only'], ['dpad', 'D-pad only']] },
    { k: 'deadzone', label: 'Stick deadzone', type: 'choice', opts: [[0, 'Small'], [1, 'Normal'], [2, 'Large']] },
    { k: 'rep', label: 'Menu repeat speed', type: 'choice', opts: [['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast']] },
    { k: 'touchpad', label: 'On-screen buttons', type: 'choice', opts: [['auto', 'Auto'], ['on', 'Always'], ['off', 'Off']] },
    { k: 'tpSize', label: 'On-screen button size', type: 'choice', opts: [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']] },
    { k: 'tpOpacity', label: 'On-screen button visibility', type: 'choice', opts: [['l', 'Faint'], ['m', 'Normal'], ['h', 'Strong']] },
    { k: 'tpHand', label: 'D-pad side', type: 'choice', opts: [['right', 'Left side'], ['left', 'Right side']] },
    { k: 'tpHaptic', label: 'Buzz on on-screen buttons', type: 'toggle' } ] },
  { tab: 'Sound', rows: [
    { k: 'sound', label: 'Game sound effects', type: 'toggle' },
    { k: 'volume', label: 'Volume', type: 'step', min: 0, max: 10 },
    { k: 'uiSound', label: 'Menu click sounds', type: 'toggle' },
    { k: 'haptics', label: 'Game vibration', type: 'toggle' },
    { k: 'uiHaptics', label: 'Menu vibration', type: 'toggle' } ] },
  { tab: 'Play', rows: [
    { k: 'defLevel', label: 'Difficulty for games you haven’t set', type: 'choice', opts: [[0, 'Easy'], [1, 'Normal'], [2, 'Hard']] },
    { k: 'orient', label: 'Screen orientation', type: 'choice', opts: [['auto', 'Auto'], ['landscape', 'Landscape'], ['portrait', 'Portrait']] },
    { k: 'awake', label: 'Keep screen on', type: 'toggle' },
    { k: 'fps', label: 'Frame rate limit', type: 'choice', opts: [[0, 'Display'], [30, '30'], [60, '60']] },
    { k: 'showFps', label: 'Show FPS counter', type: 'toggle' } ] },
  { tab: 'Library', rows: [
    { label: 'Add every game to my library', type: 'action', act: () => { games.forEach(g => setOwned(g.id, true)); toast('All ' + games.length + ' games are in your library'); preloadOwned(); refresh(); } },
    { label: 'Remove games I haven’t played', type: 'action', danger: true, act: () => confirmBox('Remove unplayed games?', 'Games you have never played leave your library. Your scores and favourites stay, and you can get them again from the Store.', 'Remove', () => { games.forEach(g => { if (isOwned(g.id) && !(DB.games[g.id] && DB.games[g.id].plays)) uninstall(g); }); toast('Library tidied'); refresh(); }) } ] },
  { tab: 'Data', rows: [
    { label: 'Change name', type: 'action', act: () => rename() },
    { label: 'Back up progress', type: 'action', act: () => exportBackup() },
    { label: 'Restore from backup', type: 'action', act: () => restoreBackup() },
    { label: 'Reset appearance and controls', type: 'action', danger: true, act: () => confirmBox('Reset appearance and controls?', 'Themes, layout, button mapping and options go back to the defaults. Scores and library stay.', 'Reset', () => { const keep = ['sound', 'volume', 'haptics', 'defLevel', 'orient', 'awake', 'fps', 'showFps']; const d = JSON.parse(JSON.stringify(DEFAULTS)); keep.forEach(k => { d[k] = S[k]; }); Object.keys(d).forEach(k => { S[k] = d[k]; }); save(); applyLook(); toast('Defaults restored'); refresh(); }) },
    { label: 'Reset scores and stats', type: 'action', danger: true, act: () => confirmBox('Reset all scores and stats?', 'Your settings and favourites stay. This can’t be undone.', 'Reset scores', () => { resetScores(); toast('Scores reset'); refresh(); }) },
    { label: 'Reset everything', type: 'action', danger: true, act: () => confirmBox('Reset everything?', 'Scores, favourites, settings, profile and library all go back to the start.', 'Reset everything', () => { resetAll(); applyLook(); applyScreen(); toast('Everything reset'); go('home'); }) } ] },
  { tab: 'About', rows: [{ label: 'Pocket Arcade ' + APP_VERSION + ' · ' + games.length + ' games', type: 'info' }, { label: 'Every game is original and plays offline. Saves stay on this device.', type: 'info' }] }
];
let settingRows = [], setTab = 0;
const LOOK_KEYS = new Set(['theme', 'accent', 'uiScale', 'motion', 'font', 'radius', 'bgstyle', 'frame', 'view', 'nav', 'tpSize', 'tpOpacity', 'tpHand', 'gbars', 'gfit']);

PAGES.settings = {
  hints: () => '<span><kbd>←</kbd><kbd>→</kbd>Change</span><span><kbd>A</kbd>Select</span><span><kbd>L1</kbd><kbd>R1</kbd>Section</span><span><kbd>B</kbd>Back</span>',
  render(){
    settingRows = [];
    const sec = SCHEMA[setTab];
    let h = '<h1 class="page-h">Settings</h1><div class="chips-row">' + SCHEMA.map((t, i) => '<button class="tabbtn' + (i === setTab ? ' on' : '') + '" data-f data-k="st-' + i + '" data-act="stab" data-v="' + i + '">' + t.tab + '</button>').join('') + '</div>';
    sec.rows.forEach(r => {
      if (r.type === 'info') { h += '<p class="about">' + r.label + '</p>'; return; }
      const idx = settingRows.push(r) - 1, v = r.k ? S[r.k] : null;
      let ctl = '', cls = '';
      if (r.type === 'toggle') ctl = '<span class="sw' + (v ? ' on' : '') + '"><i></i></span>';
      else if (r.type === 'step') ctl = '<span class="stepper"><button data-s="-1" tabindex="-1" aria-label="Lower">‹</button><b>' + v + '</b><button data-s="1" tabindex="-1" aria-label="Raise">›</button></span>';
      else if (r.type === 'choice') ctl = '<span class="sg">' + r.opts.map(o => '<button tabindex="-1" data-v="' + o[0] + '" class="' + (String(o[0]) === String(v) ? 'on' : '') + '">' + o[1] + '</button>').join('') + '</span>';
      else if (r.type === 'swatch') ctl = '<span class="swatches">' + r.opts.map(c => '<button tabindex="-1" data-v="' + c + '" class="' + (c === v ? 'on' : '') + '" style="background:' + c + '" aria-label="' + c + '"></button>').join('') + '</span>';
      else if (r.type === 'themes') { cls = ' stack'; ctl = '<span class="thgrid">' + Object.keys(THEMES).map(k => { const t = THEMES[k]; return '<button tabindex="-1" data-v="' + k + '" class="thm' + (k === v ? ' on' : '') + '" style="--tb:' + t.bg + ';--tp:' + t.panel + ';--tt:' + t.text + '"><i class="a"></i><i class="b"></i><i class="c"></i><span>' + t.name + '</span></button>'; }).join('') + '</span>'; }
      else if (r.type === 'action') ctl = '<span class="chev">›</span>';
      h += '<div class="row' + cls + (r.danger ? ' danger' : '') + '" role="button" tabindex="0" data-f data-k="s' + idx + '" data-ri="' + idx + '" data-act="srow"><span class="rl">' + r.label + '</span>' + ctl + '</div>';
    });
    return h;
  },
  after(c){
    c.querySelectorAll('.row[data-ri]').forEach(el => { const r = settingRows[+el.dataset.ri]; if (r && r.type !== 'action') el._adj = d => adjustRow(r, d); });
  },
  shoulder(d){ setTab = (setTab + d + SCHEMA.length) % SCHEMA.length; render({ key: 'st-' + setTab }); }
};
ACTIONS.stab = el => { setTab = +el.dataset.v; render({ key: 'st-' + setTab }); };
function setSetting(k, v){
  S[k] = v; save();
  if (LOOK_KEYS.has(k)) applyLook();
  if (k === 'orient' || k === 'awake') applyScreen();
  if (k === 'volume' || k === 'sound') beep(660, .08);
  if (k === 'haptics') buzz('win');
  checkTrophies(); refresh();
}
function adjustRow(r, d){
  if (!r.k) return;
  if (r.type === 'toggle') setSetting(r.k, !S[r.k]);
  else if (r.type === 'step') setSetting(r.k, clamp(S[r.k] + d, r.min, r.max));
  else if (r.type === 'choice' || r.type === 'swatch' || r.type === 'themes') {
    const vals = r.type === 'swatch' ? r.opts : r.type === 'themes' ? Object.keys(THEMES) : r.opts.map(o => o[0]);
    let i = vals.findIndex(x => String(x) === String(S[r.k])); if (i < 0) i = 0;
    setSetting(r.k, vals[(i + d + vals.length) % vals.length]);
  }
}
ACTIONS.srow = (row, e) => {
  const r = settingRows[+row.dataset.ri]; if (!r) return;
  const opt = e.target.closest('[data-v]'), st = e.target.closest('[data-s]');
  if (opt && (r.type === 'choice' || r.type === 'swatch' || r.type === 'themes')) {
    const raw = opt.dataset.v, o = r.type === 'swatch' || r.type === 'themes' ? raw : r.opts.find(x => String(x[0]) === raw)[0];
    setSetting(r.k, o);
  } else if (st) adjustRow(r, +st.dataset.s);
  else if (r.type === 'action') r.act();
  else adjustRow(r, 1);
};

/* ---------- backup ---------- */
function exportBackup(){
  const text = exportText(), name = 'pocket-arcade-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  const Sh = plug('Share');
  if (Sh) { try { Sh.share({ title: name, text: text, dialogTitle: 'Save your Pocket Arcade backup' }).catch(() => {}); return; } catch (e) {} }
  try {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); toast('Backup saved as ' + name);
  } catch (e) { openModal({ title: 'Copy your backup', textarea: text, buttons: [{ label: 'Done', primary: true }] }); }
}
function restoreBackup(){
  openModal({ title: 'Restore from backup', text: 'Choose a backup file, or paste the backup text below.', textarea: '', file: true, buttons: [
    { label: 'Cancel' },
    { label: 'Restore', primary: true, fn: v => {
      const err = importText(v || '');
      if (err) { const e = $('#modalErr'); if (e) e.textContent = err; return false; }
      applyLook(); applyScreen(); toast('Backup restored'); refresh();
    } }] });
}
