import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCorrected} from '../scripts/build-liars-poker-corrected.mjs';
import {parseBasic} from '../scripts/build-alien-corrected.mjs';

const folder = new URL('../../programs/liers-poker/', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Bytes outside quoted strings: tokens, numbers and punctuation.
const code = body => { let quoted = false; return [...body].filter(b => { if (b === 0x22) quoted = !quoted; return b === 0x22 || !quoted; }); };

test('Liar\'s Poker corrected edition rebuilds exactly and changes only printed text and adds RANDOM', () => {
  const {original, bytes, listing} = buildCorrected();
  assert.deepEqual(bytes, fs.readFileSync(new URL('corrected/LIARS-POKER.BAS', folder)));
  assert.equal(listing, fs.readFileSync(new URL('corrected/LIARS-POKER.ASC', folder), 'latin1'));
  const record = JSON.parse(fs.readFileSync(new URL('corrected/changes.json', folder)));
  assert.equal(record.sha256, sha(bytes)); assert.equal(record.source_sha256, sha(original));
  assert.equal(bytes.length, original.length + 2);
  const before = parseBasic(original), after = parseBasic(bytes);
  assert.deepEqual(after.records.map(r => r.line), before.records.map(r => r.line));
  before.records.forEach((r, i) => { if (r.line !== 5) assert.deepEqual(code(after.records[i].body), code(r.body), `line ${r.line}`); });
  assert.match(listing, /^5 CLS:RANDOM:DC=20:DH=20\r?$/m);
  assert.match(listing, /LIAR'S POKER/); assert.match(listing, /DIDN'T/); assert.match(listing, /THE POT STANDS AT "R:IF INT\(HN/);
  assert.doesNotMatch(listing, /LIER|DID'NT|THE TOP/);
});

test('Liar\'s Poker recovered files stay untouched', () => {
  const recovered = fs.readFileSync(new URL('versions/v01/04-LIERS-POKER.BAS', folder));
  assert.deepEqual(recovered, fs.readFileSync(new URL('original/LIERS-POKER.BAS', folder)));
  assert.match(recovered.toString('latin1'), /LIER'S POKER/);
});

test('Liar\'s Poker\'s player metadata selects the corrected edition', () => {
  const {correctedEdition, versions} = JSON.parse(fs.readFileSync(new URL('program.json', folder), 'utf8'));
  assert.equal(correctedEdition.raw, 'corrected/LIARS-POKER.BAS');
  assert.equal(correctedEdition.listing, 'corrected/LIARS-POKER.ASC');
  assert.ok(fs.readFileSync(new URL(correctedEdition.listing, folder), 'latin1').replace(/\r\n/g, '\n').startsWith(correctedEdition.startupSource));
  assert.match(versions[0].raw, /^versions\/v01\/04-LIERS-POKER\.BAS$/);
});
