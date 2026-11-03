// Derives Speech's spelling-corrected edition from the recovered v10 payload.
// Each change names its line and exact text; see programs/speech/corrected/corrections.json.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodeBasicProgram} from 'trs80-base';
import {parseBasic} from './build-alien-corrected.mjs';

const folder = new URL('../../programs/speech/', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('corrected/corrections.json', folder)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

export function buildCorrected() {
  const original = fs.readFileSync(new URL(spec.source, folder));
  const {header, records, base} = parseBasic(original);
  const parts = [header]; let offset = 4;
  for (const {line, body} of records) {
    let text = body.toString('latin1');
    for (const change of spec.changes.filter(item => item.line === line)) {
      if (text.split(change.from).length !== 2) throw Error(`Expected one "${change.from}" on line ${line}`);
      text = text.replace(change.from, change.to);
    }
    const fixed = Buffer.from(text, 'latin1');
    const next = offset + 4 + fixed.length + 1;
    const link = Buffer.alloc(4); link.writeUInt16LE(base + next, 0); link.writeUInt16LE(line, 2);
    parts.push(link, fixed, Buffer.from([0])); offset = next;
  }
  parts.push(Buffer.from([0, 0]));
  const bytes = Buffer.concat(parts);
  return {original, bytes, listing: decodeBasicProgram(bytes).asAscii()};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {original, bytes, listing} = buildCorrected();
  fs.writeFileSync(new URL('corrected/SPEECH.BAS', folder), bytes);
  fs.writeFileSync(new URL('corrected/SPEECH.ASC', folder), listing);
  fs.writeFileSync(new URL('corrected/changes.json', folder), JSON.stringify({source: spec.source, source_sha256: sha(original), sha256: sha(bytes), bytes: bytes.length, listing_sha256: sha(Buffer.from(listing, 'latin1')), changes: spec.changes}, null, 2) + '\n');
  console.log(`${spec.changes.length} corrections on ${new Set(spec.changes.map(c => c.line)).size} lines; ${original.length} -> ${bytes.length} bytes`);
}
