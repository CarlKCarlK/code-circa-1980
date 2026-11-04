import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCorrected} from '../scripts/build-chess-corrected.mjs';
import {parseBasic} from '../scripts/build-alien-corrected.mjs';

const folder = new URL('../../programs/chess/', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('CISAB corrected edition rebuilds exactly and changes only the listed lines', () => {
  const {original, bytes, listing, changes} = buildCorrected();
  assert.deepEqual(bytes, fs.readFileSync(new URL('corrected/CHESS.BAS', folder)));
  assert.equal(listing, fs.readFileSync(new URL('corrected/CHESS.ASC', folder), 'latin1'));
  const record = JSON.parse(fs.readFileSync(new URL('corrected/changes.json', folder)));
  assert.equal(record.sha256, sha(bytes)); assert.equal(record.source_sha256, sha(original));
  assert.deepEqual(record.changes, changes);
  const evidence = JSON.parse(fs.readFileSync(new URL('provenance.json', folder)));
  assert.equal(evidence.saves.find(s => s.version === 'v14').sha256, sha(original));
  assert.equal(evidence.derived_editions[0].sha256, sha(bytes));
  const before = parseBasic(original), after = parseBasic(bytes);
  assert.equal(after.base, before.base);
  const edited = new Set(changes.map(c => c.line));
  assert.deepEqual([...edited].sort((a, b) => a - b), [14, 80, 107, 110, 111, 210, 335, 1005, 1300, 1330, 9500, 9510, 9520, 9530, 9540]);
  for (const r of after.records) {
    const old = before.records.find(o => o.line === r.line);
    if (!edited.has(r.line)) assert.deepEqual(r.body, old.body, `line ${r.line}`);
  }
  assert.deepEqual(after.records.map(r => r.line), [...before.records.map(r => r.line), 111, 9540].sort((a, b) => a - b));
  assert.doesNotMatch(listing, /COLUMB|COULMB|"i |\.i WON/);
});
