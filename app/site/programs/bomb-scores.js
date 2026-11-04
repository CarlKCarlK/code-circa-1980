// Keeps Bomb's scores past the end of a session: on this browser and in a shared list.
// It only reads the running program's memory; the 1981 program itself is unchanged.
export const SCORES_URL = 'https://bomb-scores.kadie-sites.workers.dev/scores';
const STORAGE_KEY = 'code-circa-1980.bomb.scores';
const TOP = 10, POLL_MS = 1000;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Finds a Level II BASIC array by name (40FBh-40FDh hold its storage). Each entry is a type
// byte, the name with its second letter first, a length, the subscripts, then the values.
function findArray(read, first, second) {
  const word = address => read(address) | read(address + 1) << 8;
  for (let at = word(0x40fb), end = word(0x40fd); at < end; at += 5 + word(at + 3)) {
    if (read(at + 2) === first.charCodeAt(0) && read(at + 1) === (second ? second.charCodeAt(0) : 0)) return at + 6 + 2 * read(at + 5);
  }
  return null;
}

// Bomb keeps its top ten in RN(0-9) and I$(0-9). A posthumous score's I$ ends in P after padding.
export function readRankings(read) {
  const scores = findArray(read, 'R', 'N'), names = findArray(read, 'I');
  if (scores === null || names === null) return [];
  const rankings = [];
  for (let i = 0; i < TOP; i++) {
    const at = scores + i * 4, exponent = read(at + 3), high = read(at + 2);
    if (!exponent) continue;
    const score = Math.round(((high | 0x80) << 16 | read(at + 1) << 8 | read(at)) * 2 ** (exponent - 152));
    const descriptor = names + i * 3, address = read(descriptor + 1) | read(descriptor + 2) << 8;
    const text = String.fromCharCode(...Array.from({length: read(descriptor)}, (_, n) => read(address + n)));
    const initials = text.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') || '???';
    rankings.push({initials, score, posthumous: text.length > 3 && text.endsWith('P')});
  }
  return rankings;
}

// Entries in `rankings` not yet counted in `seen`, which it updates. A repeated score and
// initials counts again, because each one is a separate game.
export function newRankings(rankings, seen) {
  const counts = new Map(), fresh = [];
  for (const entry of rankings) {
    const key = `${entry.score}|${entry.initials}|${entry.posthumous}`, count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    if (count > (seen.get(key) ?? 0)) { seen.set(key, count); fresh.push(entry); }
  }
  return fresh;
}

const byRank = (a, b) => b.score - a.score;
function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; } catch { return []; }
}
function saveLocal(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* Scores stay for this visit. */ }
}
const row = ({initials, score, posthumous}) => `<li><span>${escape(initials)}${posthumous ? ' <abbr title="Posthumous">P</abbr>' : ''}</span><span>${escape(score)}</span></li>`;
const listHtml = (entries, empty) => entries.length ? `<ol>${entries.map(row).join('')}</ol>` : `<p class="small">${empty}</p>`;

export function scoresPanel(instance, {url = SCORES_URL} = {}) {
  const panel = document.createElement('section');
  panel.className = 'score-panel';
  panel.innerHTML = '<h3>World top ten</h3><div class="world-scores"><p class="small">Loading…</p></div><h3>Your top ten, on this browser</h3><div class="local-scores"></div><p class="small">Make the game’s rankings and enter your initials to post a score. Only your initials, score and the date are shared.</p>';
  const world = panel.querySelector('.world-scores'), local = panel.querySelector('.local-scores');
  let localScores = loadLocal();
  const showLocal = () => { local.innerHTML = listHtml(localScores, 'None yet.'); };
  const showWorld = scores => { world.innerHTML = listHtml(scores, 'None yet. Be the first.'); };
  const unavailable = () => { world.innerHTML = '<p class="small">World scores are unavailable right now. Your scores are still saved on this browser.</p>'; };
  showLocal();
  const request = async options => {
    const response = await fetch(url, options);
    if (!response.ok) throw Error(`Scores: ${response.status}`);
    return (await response.json()).scores;
  };
  request().then(showWorld).catch(unavailable);

  const seen = new Map();
  const record = entry => {
    localScores = [...localScores, {...entry, date: new Date().toISOString().slice(0, 10)}].sort(byRank).slice(0, TOP);
    saveLocal(localScores); showLocal();
    request({method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(entry)}).then(showWorld).catch(unavailable);
  };
  const timer = setInterval(() => {
    if (!panel.isConnected) { clearInterval(timer); return; }
    const rankings = readRankings(instance.readMemory);
    if (!rankings.length) { seen.clear(); return; }
    // The table is complete once the game shows it; its double-width heading skips columns.
    const screen = String.fromCharCode(...instance.snapshot().map(code => code < 32 ? code + 64 : code));
    if (/R +A +N +K +I +N +G +S/.test(screen)) newRankings(rankings, seen).forEach(record);
  }, POLL_MS);
  return panel;
}
