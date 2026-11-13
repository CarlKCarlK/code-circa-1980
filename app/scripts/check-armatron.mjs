// Runs Armatron-80 on the stock Level II ROM (trs80-emulator), holds keys the way a
// player would, and prints the 128x48 graphics screen as text. A development aid:
//   node scripts/check-armatron.mjs [path/to/listing.ASC] [--json report.json]
// With no listing it runs programs/armatron/versions/v01/ARMATRON.BAS.
import fs from 'node:fs';
import {decodeBasicProgram, parseBasicText} from 'trs80-base';
import {machine, screenBytes} from '../tests/helpers/reference.mjs';

const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json'), jsonPath = jsonAt >= 0 ? args.splice(jsonAt, 2)[1] : null;
const source = args[0] ?? new URL('../../programs/armatron/versions/v01/ARMATRON.BAS', import.meta.url).pathname;
const bytes = source.endsWith('.BAS') ? fs.readFileSync(source) : decodeBasicProgram(parseBasicText(fs.readFileSync(source, 'latin1'))).asCassetteBinary();
const program = decodeBasicProgram(bytes);
if (!program || program.error) throw Error(program?.error ?? 'Tokenizing failed');

const m = machine();
m.runBasicProgram(program);
const run = seconds => { const end = m.tStateCount + m.clockHz * seconds; while (m.tStateCount < end) m.step(); };
const hold = (key, seconds) => { m.keyboard.keyEvent(key, true); run(seconds); m.keyboard.keyEvent(key, false); run(0.3); };
const tap = key => hold(key, 0.15);
const waitFor = (ready, seconds) => { for (let t = 0; t < seconds && !ready(); t += 1) run(1); return ready(); };

// Text cells print as characters; graphics cells expand to their 2x3 pixels.
export function picture() {
  const screen = screenBytes(m), rows = [];
  for (let y = 0; y < 48; y++) {
    let row = '';
    for (let x = 0; x < 128; x++) {
      const code = screen[Math.floor(y / 3) * 64 + Math.floor(x / 2)];
      if (code >= 128 && code < 192) row += (code >> ((y % 3) * 2 + (x % 2))) & 1 ? '#' : ' ';
      else row += y % 3 === 1 && x % 2 === 0 && code > 32 && code < 128 ? String.fromCharCode(code) : ' ';
    }
    rows.push(row.trimEnd());
  }
  return rows.join('\n');
}
const text = () => Array.from(screenBytes(m), c => c >= 32 && c < 128 ? String.fromCharCode(c) : ' ').join('').match(/.{64}/g);
const shot = label => { console.log(`\n=== ${label} (t=${(m.tStateCount / m.clockHz).toFixed(1)}s)`); console.log(picture()); };
const setPixels = () => Array.from(screenBytes(m)).reduce((n, c) => n + (c >= 128 && c < 192 ? [...(c & 63).toString(2)].filter(b => b === '1').length : 0), 0);

const report = {checks: []};
const check = (name, ok, detail) => { report.checks.push({name, ok, detail}); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); };

run(30); shot('after title, initial scene');
const status0 = text()[0];
check('status line shows target #0', /TARGET #  0/.test(status0), status0.trim());
check('help line lists the joint keys', text()[15].includes('QA BASE'), text()[15].trim());
const pixels0 = setPixels();
check('arm, target, and grid drawn', pixels0 > 60, `${pixels0} pixels set`);

const screen0 = screenBytes(m).join();
hold('q', 6); shot('held Q (swing base)');
check('holding Q redraws the arm', screenBytes(m).join() !== screen0);
hold('w', 4); shot('held W (raise arm)');
hold('ArrowLeft', 4); shot('held Left arrow (orbit camera)');
hold('z', 3); shot('held Z (zoom)');
waitFor(() => /DISTANCE\s+[\d.]+/.test(text()[0]), 120);
const before = Number(text()[0].match(/DISTANCE\s+([\d.]+)/)?.[1]);
tap(' ');
check('Space starts auto-reach', waitFor(() => text()[0].includes('AUTO-REACH'), 120), text()[0].trim());
for (let t = 0; t < 1500 && text()[0].includes('AUTO-REACH'); t += 10) run(10);
shot('after Space (auto-reach finished)');
const status1 = text()[0];
const distance = Number(status1.match(/DISTANCE\s+([\d.]+)/)?.[1]);
check('auto-reach finishes by itself', !status1.includes('AUTO-REACH'), status1.trim());
check('auto-reach at least halves the distance', distance < before / 2, `${before} -> ${distance}`);
report.autoReach = {before, after: distance};
console.log('auto-reach', report.autoReach);
tap('n'); waitFor(() => /TARGET #  1/.test(text()[0]), 120); shot('after N (next target)');
check('N advances to target #1', /TARGET #  1/.test(text()[0]), text()[0].trim());
const dist = () => Number(text()[0].match(/DISTANCE\s+([\d.]+)/)?.[1]);
const beforeReset = dist();
tap('0'); waitFor(() => dist() !== beforeReset, 120); shot('after 0 (reset pose)');
check('0 resets the pose and redraws', dist() !== beforeReset, `${beforeReset} -> ${dist()}`);
if (jsonPath) fs.writeFileSync(jsonPath, JSON.stringify({...report, emulated_seconds: m.tStateCount / m.clockHz}, null, 2) + '\n');
process.exitCode = report.checks.every(c => c.ok) ? 0 : 1;
