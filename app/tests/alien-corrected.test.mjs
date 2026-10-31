import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCorrected, parseBasic} from '../scripts/build-alien-corrected.mjs';

const folder = new URL('../../programs/alien/', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Bytes outside quoted strings: tokens, numbers and punctuation.
const code = body => { let quoted = false; return [...body].filter(b => { if (b === 0x22) quoted = !quoted; return b === 0x22 || !quoted; }); };

test('Alien corrected edition rebuilds exactly and changes only printed strings', () => {
  const {original, bytes, listing, changes} = buildCorrected();
  assert.deepEqual(bytes, fs.readFileSync(new URL('corrected/ALIEN.BAS', folder)));
  assert.equal(listing, fs.readFileSync(new URL('corrected/ALIEN.ASC', folder), 'latin1'));
  const record = JSON.parse(fs.readFileSync(new URL('corrected/changes.json', folder)));
  assert.equal(record.sha256, sha(bytes)); assert.equal(record.source_sha256, sha(original));
  assert.deepEqual(record.changes, changes);
  const evidence = JSON.parse(fs.readFileSync(new URL('provenance.json', folder)));
  assert.equal(evidence.saves.find(s => s.version === 'v02').sha256, sha(original));
  assert.equal(evidence.derived_editions[0].sha256, sha(bytes));
  const before = parseBasic(original), after = parseBasic(bytes);
  assert.equal(after.base, before.base);
  assert.deepEqual(after.records.map(r => r.line), before.records.map(r => r.line));
  before.records.forEach((r, i) => assert.deepEqual(code(after.records[i].body), code(r.body), `line ${r.line}`));
  // Pointer chain is consistent and the program ends exactly.
  let offset = 4; for (const r of after.records) { offset += 4 + r.body.length + 1; }
  assert.equal(offset + 2, bytes.length);
  // REM comments keep their original spelling; printed strings must not.
  assert.doesNotMatch(listing.match(/"[^"\n]*"?/g).join('\n'), /JUCTION|ALEIN|BOOBIE|YOUR ARE IN|IS TO LATE/);
});
