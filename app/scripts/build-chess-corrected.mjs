// Derives CISAB's corrected edition from the recovered v14 payload: three bug
// fixes and two spellings (programs/chess/corrected/corrections.json). Edited
// lines are re-tokenized from their listing text; all other lines keep their bytes.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBasicProgram, parseBasicText} from 'trs80-base';
import {parseBasic} from './build-alien-corrected.mjs';

const folder = new URL('../../programs/chess/', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('corrected/corrections.json', folder)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// parseBasicText writes the in-memory format: one FFh byte, then the lines.
function tokenize(text) {
  const bytes = Buffer.from(parseBasicText(`${text}\n`));
  if (bytes[0] !== 0xff) throw Error('Unexpected tokenizer output');
  return bytes.subarray(5, bytes.indexOf(0, 5));
}

export function buildCorrected() {
  const original = fs.readFileSync(new URL(spec.source, folder));
  const {header, records, base} = parseBasic(original);
  const listing = new Map(decodeBasicProgram(original).asAscii().split(/\r?\n/).filter(Boolean).map(l => [Number(/^\d+/.exec(l)[0]), l]));
  const lines = records.map(({line, body}) => ({line, body}));
  const changes = [];
  for (const edit of spec.edits) {
    if (edit.insert) {
      const at = lines.findIndex(r => r.line > edit.line);
      lines.splice(at, 0, {line: edit.line, body: tokenize(edit.insert)});
      changes.push({line: edit.line, inserted: edit.insert, kind: edit.kind});
      continue;
    }
    const text = listing.get(edit.line);
    if (!text.includes(edit.from)) throw Error(`Line ${edit.line} lacks ${edit.from}`);
    const record = lines.find(r => r.line === edit.line);
    // The listing text must re-tokenize to the recovered bytes before it is edited.
    if (!tokenize(text).equals(record.body)) throw Error(`Line ${edit.line} does not re-tokenize exactly`);
    const fixed = text.replaceAll(edit.from, edit.to);
    listing.set(edit.line, fixed);
    record.body = tokenize(fixed);
    changes.push({line: edit.line, from: edit.from, to: edit.to, count: text.split(edit.from).length - 1, kind: edit.kind});
  }
  const parts = [header]; let offset = 4;
  for (const {line, body} of lines) {
    const next = offset + 4 + body.length + 1;
    const link = Buffer.alloc(4); link.writeUInt16LE(base + next, 0); link.writeUInt16LE(line, 2);
    parts.push(link, body, Buffer.from([0])); offset = next;
  }
  parts.push(Buffer.from([0, 0]));
  const bytes = Buffer.concat(parts);
  return {original, bytes, listing: decodeBasicProgram(bytes).asAscii(), changes};
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const {original, bytes, listing, changes} = buildCorrected();
  fs.writeFileSync(new URL('corrected/CHESS.BAS', folder), bytes);
  fs.writeFileSync(new URL('corrected/CHESS.ASC', folder), listing);
  fs.writeFileSync(new URL('corrected/changes.json', folder), JSON.stringify({source: spec.source, source_sha256: sha(original), sha256: sha(bytes), bytes: bytes.length, listing_sha256: sha(Buffer.from(listing)), changes}, null, 2) + '\n');
  console.log(`${changes.length} edits; ${original.length} -> ${bytes.length} bytes`);
}
