import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {buildCorrected, parseBasic} from '../scripts/build-alien-corrected.mjs';
import {runBasicText, screenLines} from './helpers/chess-reference.mjs';

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
  // Only the listed lines lose or change code; every other line keeps its tokens.
  const rewritten = new Set([385, 390, 3240, 3380, 3390, 3398]);
  const kept = before.records.filter(r => r.line !== 1200 && r.line !== 3395);
  assert.equal(before.records.length - kept.length, 2);
  assert.deepEqual(after.records.map(r => r.line), kept.map(r => r.line));
  kept.forEach((r, i) => { if (!rewritten.has(r.line)) assert.deepEqual(code(after.records[i].body), code(r.body), `line ${r.line}`); });
  assert.doesNotMatch(listing, /CHANCE TO FLEE|OFTEN MOVES|IS BOTHERED THE|BY SWITCHING/);
  for (const text of listing.split('\n')) if (/^(1120|1125|1170|1180|1210) /.test(text)) assert.ok(text.match(/"([^"]*)"/)[1].length <= 63, text);
  // Pointer chain is consistent and the program ends exactly.
  let offset = 4; for (const r of after.records) { offset += 4 + r.body.length + 1; }
  assert.equal(offset + 2, bytes.length);
  // REM comments keep their original spelling; printed strings must not.
  assert.doesNotMatch(listing.match(/"[^"\n]*"?/g).join('\n'), /JUCTION|ALEIN|BOOBIE|YOUR ARE IN|IS TO LATE/);
});

// Runs the real routines in the ROM, from the recovered lines and from the fixed ones.
const recovered = fs.readFileSync(new URL('versions/v02/08-ALIEN-HUNT-EXPANDED-SAVE01.ASC', folder), 'latin1');
const fixed = fs.readFileSync(new URL('corrected/ALIEN.ASC', folder), 'latin1');
const SETUP = 'DIMS(20,3),N(20),L(6),M(6),P(5):FORI=1TO20:FORJ=1TO3:S(I,J)=20:NEXTJ,I:FORI=1TO20:N(I)=I:NEXT:A=5';
const run = (listing, driver, replaced = {}) => {
  const lines = listing.split('\n').filter(Boolean).map(text => replaced[text.split(' ')[0]] ?? text).map(text => text.startsWith('10 ') ? '10 GOTO9000' : text);
  return screenLines(runBasicText(`${lines.join('\n')}\n9000 ${SETUP}\n${driver}\n`, 300));
};
const result = (screen, name) => Number(screen.join(' ').match(new RegExp(`${name}=\\s*(-?\\d+)`))[1]);

test('After a missed spray the alien is checked against your room, not where the gas stopped', () => {
  // You are in 1, the gas stopped in 3, and every vent from the alien's room 2 leads to `target`.
  const missed = target => `9010 L(1)=1:L(2)=2:L=3:F=0:S(2,1)=${target}:S(2,2)=${target}:S(2,3)=${target}\n9020 GOSUB3240:IFL(2)=2THEN9020\n9030 PRINT"F="F" L="L:END`;
  assert.equal(result(run(recovered, missed(1)), 'F'), 0); // Recovered: it walks into your room harmlessly.
  assert.equal(result(run(recovered, missed(3)), 'F'), -1); // Recovered: it eats you from another room.
  assert.equal(result(run(fixed, missed(1)), 'F'), -1);
  const away = run(fixed, missed(3));
  assert.equal(result(away, 'F'), 0);
  assert.equal(result(away, 'L'), 1); // A close right after a miss now closes your junction.
});

test('An opening move that lands on you ends the game; otherwise the game goes on', () => {
  const start = burn => `9010 L=1:L(1)=1:L(2)=2:F=-1:S(2,1)=1:S(2,2)=1:S(2,3)=1:FORI=1TO${burn}:X=RND(0):NEXT\n9020 GOTO385`;
  const stops = {410: '410 PRINT"CARRIED ON":END', 590: '590 END', 2000: '2000 RETURN'};
  const outcomes = listing => Array.from({length: 8}, (_, burn) => run(listing, start(burn), stops).join(' '));
  const eaten = text => text.includes('OOZING');
  assert.ok(outcomes(recovered).some(text => eaten(text) && text.includes('CARRIED ON')));
  const after = outcomes(fixed);
  assert.ok(after.some(eaten) && !after.every(eaten));
  for (const text of after) assert.equal(text.includes('YOU HAVE FAILED'), eaten(text), text);
  for (const text of after) assert.equal(text.includes('CARRIED ON'), !eaten(text), text);
});

test('A trapped alien is noticed at once and announced once', () => {
  const trapped = '9010 S(2,1)=-1:S(2,2)=-1:S(2,3)=-1:L(2)=2:L=1:W=0:CLS\n9020 FORI=1TO8:F=0:GOSUB3380:W=W-(F=1):NEXT\n9030 PRINT"RUN":PRINT"WINS="W:END'; // The helper looks for READY below RUN, which CLS and scrolling would remove.
  const count = screen => screen.filter(text => text.includes('TRAPPED')).length;
  const before = run(recovered, trapped), after = run(fixed, trapped);
  assert.ok(result(before, 'WINS') < 8);
  assert.equal(result(after, 'WINS'), 8);
  assert.equal(count(after), 8);
});

test('Having no way out ends the game', () => {
  const noExits = '9010 L=1:L(1)=1:L(2)=2:F=0:S(1,1)=-1:S(1,2)=-1:S(1,3)=-1\n9020 GOTO390';
  const stops = {410: '410 PRINT"CARRIED ON":END', 590: '590 END'};
  const before = run(recovered, noExits, stops).join(' '), after = run(fixed, noExits, stops).join(' ');
  assert.ok(before.includes('NO WAY OUT') && before.includes('CARRIED ON'));
  assert.ok(after.includes('NO WAY OUT') && after.includes('YOU HAVE FAILED') && !after.includes('CARRIED ON'));
});
