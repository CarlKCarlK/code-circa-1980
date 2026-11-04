// The shared-score Worker against a real SQLite database, and the browser panel's bookkeeping.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import worker, {SITE_ORIGIN, MAX_POSTS_PER_HOUR, MAX_SCORE} from '../services/bomb-scores/worker.js';
import {newRankings} from '../site/programs/bomb-scores.js';

// The part of Cloudflare D1's interface the Worker uses.
function database() {
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync(new URL('../services/bomb-scores/schema.sql', import.meta.url), 'utf8'));
  const statement = (sql, values = []) => ({
    bind: (...next) => statement(sql, next),
    all: async () => ({results: db.prepare(sql).all(...values)}),
    first: async () => db.prepare(sql).get(...values),
    run: async () => db.prepare(sql).run(...values),
  });
  return {prepare: sql => statement(sql)};
}
const NOW = Date.UTC(2026, 10, 4, 12);
const call = (env, method, body, {origin = SITE_ORIGIN, ip = '1.2.3.4', now = NOW, path = '/scores'} = {}) => worker.fetch(new Request(`https://example.test${path}`, {method, body: body === undefined ? undefined : JSON.stringify(body), headers: {Origin: origin, 'CF-Connecting-IP': ip}}), env, {}, now);
const entry = (score, initials = 'CMK') => ({initials, score, posthumous: false});

test('scores are ranked, keep their date and posthumous mark, and read back from anywhere', async () => {
  const env = {DB: database()};
  assert.equal((await call(env, 'POST', entry(12))).status, 201);
  await call(env, 'POST', {initials: 'RL', score: 30, posthumous: true});
  const response = await call(env, 'POST', entry(12, 'ABC'));
  assert.deepEqual((await response.json()).scores, [
    {initials: 'RL', score: 30, posthumous: true, date: '2026-11-04'},
    {initials: 'CMK', score: 12, posthumous: false, date: '2026-11-04'},
    {initials: 'ABC', score: 12, posthumous: false, date: '2026-11-04'},
  ]);
  const read = await call(env, 'GET', undefined, {origin: 'https://anywhere.example'});
  assert.equal(read.headers.get('Access-Control-Allow-Origin'), '*');
  assert.equal((await read.json()).scores.length, 3);
});

test('only ten scores are listed', async () => {
  const env = {DB: database()};
  for (let score = 1; score <= 12; score++) await call(env, 'POST', entry(score), {ip: String(score)});
  const {scores} = await (await call(env, 'GET')).json();
  assert.deepEqual(scores.map(s => s.score), [12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
});

test('bad entries, other sites and oversized bodies are refused', async () => {
  const env = {DB: database()};
  for (const bad of [entry(0), entry(MAX_SCORE + 1), entry(1.5), entry('7'), entry(5, ''), entry(5, 'ABCD'), entry(5, 'a<b'), entry(5, 'KKK'), {}]) {
    assert.equal((await call(env, 'POST', bad)).status, 422, JSON.stringify(bad));
  }
  assert.equal((await call(env, 'POST', entry(5), {origin: 'https://elsewhere.example'})).status, 403);
  assert.equal((await call(env, 'POST', {...entry(5), padding: 'x'.repeat(300)})).status, 413);
  assert.equal((await call(env, 'POST', undefined, {path: '/other'})).status, 404);
  assert.deepEqual((await (await call(env, 'GET')).json()).scores, []);
});

test('one address is limited per hour, but not forever and not for others', async () => {
  const env = {DB: database()};
  for (let i = 0; i < MAX_POSTS_PER_HOUR; i++) assert.equal((await call(env, 'POST', entry(5))).status, 201);
  assert.equal((await call(env, 'POST', entry(5))).status, 429);
  assert.equal((await call(env, 'POST', entry(5), {ip: '9.9.9.9'})).status, 201);
  assert.equal((await call(env, 'POST', entry(5), {now: NOW + 3700000})).status, 201);
});

test('no address is stored', async () => {
  const env = {DB: database()};
  await call(env, 'POST', entry(5), {ip: '203.0.113.7'});
  const {results} = await env.DB.prepare('SELECT * FROM posts').all();
  assert.equal(results.length, 1);
  assert.ok(!JSON.stringify(results).includes('203.0.113.7'));
  assert.match(results[0].poster, /^[0-9a-f]{64}$/);
});

test('each game is recorded once, however often the rankings are shown', () => {
  const seen = new Map(), first = {initials: 'CMK', score: 12, posthumous: false}, second = {initials: 'RL', score: 5, posthumous: true};
  assert.deepEqual(newRankings([first], seen), [first]);
  assert.deepEqual(newRankings([first], seen), []);
  assert.deepEqual(newRankings([first, second], seen), [second]);
  assert.deepEqual(newRankings([first, first, second], seen), [first]); // The same score and initials, in another game.
});
