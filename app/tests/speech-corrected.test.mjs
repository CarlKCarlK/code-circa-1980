import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCorrected} from '../scripts/build-speech-corrected.mjs';
import {parseBasic} from '../scripts/build-alien-corrected.mjs';

const folder = new URL('../../programs/speech/', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Bytes outside quoted strings: tokens, numbers and punctuation.
const code = body => { let quoted = false; return [...body].filter(b => { if (b === 0x22) quoted = !quoted; return b === 0x22 || !quoted; }); };

test('Speech corrected edition rebuilds exactly and changes only printed text', () => {
  const {original, bytes, listing} = buildCorrected();
  assert.deepEqual(bytes, fs.readFileSync(new URL('corrected/SPEECH.BAS', folder)));
  assert.equal(listing, fs.readFileSync(new URL('corrected/SPEECH.ASC', folder), 'latin1'));
  const record = JSON.parse(fs.readFileSync(new URL('corrected/changes.json', folder)));
  assert.equal(record.sha256, sha(bytes)); assert.equal(record.source_sha256, sha(original));
  const before = parseBasic(original), after = parseBasic(bytes);
  assert.equal(after.base, before.base);
  assert.deepEqual(after.records.map(r => r.line), before.records.map(r => r.line));
  // FORTH on line 1800 is unquoted DATA, the one change outside a quoted string.
  before.records.forEach((r, i) => { if (r.line !== 1800) assert.deepEqual(code(after.records[i].body), code(r.body), `line ${r.line}`); });
  assert.equal(after.records.find(r => r.line === 1800).body.toString('latin1'), r1800(before));
  // Pointer chain is consistent and the program ends exactly.
  let offset = 4; for (const r of after.records) { offset += 4 + r.body.length + 1; assert.equal(bytes.readUInt16LE(offset - 5 - r.body.length), after.base + offset); }
  assert.equal(offset + 2, bytes.length);
  assert.doesNotMatch(listing, /PARTICAPATE|THOUGH |EXTEMPORANCE|ORGINAL|ORITORICAL|QUILITY|QUAILITY|MODERATLY|ALL MOST|POTENCIAL|TOUNOMENT|DISTICT|PRICTICE|TO LATE|PALUA|AUDUTORIUM|TABLUATE|FORTH|REHERSAL/);
});

test('Speech rows that wrap on purpose still break at the same word', () => {
  const {listing} = buildCorrected();
  const printed = line => listing.split('\n').find(l => l.startsWith(`${line} `)).match(/"([^"]*)"/)[1];
  assert.equal(printed(160).indexOf('NAME AND'), 64);
  assert.equal(printed(1410).indexOf("WEEK'S"), 64);
  assert.ok(printed(1220).length < 64);
});

const r1800 = before => before.records.find(r => r.line === 1800).body.toString('latin1').replace('FORTH', 'FOURTH');
