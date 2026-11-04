// Bomb's shared high scores, a Cloudflare Worker with a D1 database. Stores initials,
// score, date and a daily-salted hash of the poster's address for rate limiting.
// The game runs in the browser, so these checks limit abuse rather than prove a score.
// Delete an entry with: wrangler d1 execute bomb-scores --remote --command "DELETE FROM scores WHERE id=N"
export const SITE_ORIGIN = 'https://carlkcarlk.github.io';
export const MAX_SCORE = 200; // The flash time shrinks by a quarter per bomb, so far beyond human reach.
export const MAX_POSTS_PER_HOUR = 20;
const KEEP = 100, TOP = 10, MAX_BODY = 200, DAY = 86400000;
// Three letters leave little room for rudeness; these are refused.
const BLOCKED = new Set(['ASS', 'CUM', 'COC', 'DIK', 'FAG', 'FCK', 'FUC', 'FUK', 'KKK', 'NAZ', 'NIG', 'SEX', 'TIT']);

const headers = origin => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': origin === SITE_ORIGIN ? SITE_ORIGIN : '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin',
});
const reply = (origin, status, body) => new Response(JSON.stringify(body), {status, headers: headers(origin)});

async function topScores(db) {
  const {results} = await db.prepare(`SELECT initials, score, posthumous, date FROM scores ORDER BY score DESC, id ASC LIMIT ${TOP}`).all();
  return results.map(row => ({...row, posthumous: Boolean(row.posthumous)}));
}

// A hash that changes daily, so posts cannot be linked to an address or across days.
async function posterHash(request, now) {
  const text = `${new Date(now).toISOString().slice(0, 10)}|${request.headers.get('CF-Connecting-IP') ?? ''}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function invalidEntry(entry) {
  if (typeof entry?.initials !== 'string' || !/^[A-Z0-9?]{1,3}$/.test(entry.initials)) return 'Initials must be one to three letters or digits.';
  if (BLOCKED.has(entry.initials)) return 'Those initials are not accepted.';
  if (!Number.isInteger(entry.score) || entry.score < 1 || entry.score > MAX_SCORE) return `Score must be a whole number from 1 to ${MAX_SCORE}.`;
  return null;
}

async function post(request, env, origin, now) {
  if (origin !== SITE_ORIGIN) return reply(origin, 403, {error: 'Scores can be posted only from the site.'});
  const text = await request.text();
  if (text.length > MAX_BODY) return reply(origin, 413, {error: 'Too large.'});
  let entry;
  try { entry = JSON.parse(text); } catch { return reply(origin, 400, {error: 'Not JSON.'}); }
  const problem = invalidEntry(entry);
  if (problem) return reply(origin, 422, {error: problem});
  const poster = await posterHash(request, now);
  await env.DB.prepare('DELETE FROM posts WHERE at < ?').bind(now - DAY).run();
  const {count} = await env.DB.prepare('SELECT COUNT(*) AS count FROM posts WHERE poster = ? AND at > ?').bind(poster, now - DAY / 24).first();
  if (count >= MAX_POSTS_PER_HOUR) return reply(origin, 429, {error: 'Too many scores this hour.'});
  await env.DB.prepare('INSERT INTO posts (poster, at) VALUES (?, ?)').bind(poster, now).run();
  await env.DB.prepare('INSERT INTO scores (initials, score, posthumous, date) VALUES (?, ?, ?, ?)')
    .bind(entry.initials, entry.score, entry.posthumous === true ? 1 : 0, new Date(now).toISOString().slice(0, 10)).run();
  await env.DB.prepare(`DELETE FROM scores WHERE id NOT IN (SELECT id FROM scores ORDER BY score DESC, id ASC LIMIT ${KEEP})`).run();
  return reply(origin, 201, {scores: await topScores(env.DB)});
}

export default {
  async fetch(request, env, context, now = Date.now()) {
    const origin = request.headers.get('Origin') ?? '';
    if (new URL(request.url).pathname !== '/scores') return reply(origin, 404, {error: 'Not found.'});
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: headers(origin)});
    if (request.method === 'GET') return reply(origin, 200, {scores: await topScores(env.DB)});
    if (request.method === 'POST') return post(request, env, origin, now);
    return reply(origin, 405, {error: 'Method not allowed.'});
  },
};
