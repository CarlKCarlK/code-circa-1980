// Derives Alien's spelling-corrected edition from the recovered v02 payload.
// Only bytes inside quoted strings change; see programs/alien/corrected/corrections.json.
// Line-specific layout fixes apply after spelling, so they match corrected text.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBasicProgram} from 'trs80-base';

const folder = new URL('../../programs/alien/', import.meta.url);
const spec = JSON.parse(fs.readFileSync(new URL('corrected/corrections.json', folder)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

// Returns [{line, body}] records and the memory base implied by the line pointers.
export function parseBasic(bytes) {
  const records = []; let offset = 4, base;
  while (bytes.readUInt16LE(offset) !== 0) {
    const pointer = bytes.readUInt16LE(offset), line = bytes.readUInt16LE(offset + 2);
    const end = bytes.indexOf(0, offset + 4);
    base ??= pointer - end - 1;
    records.push({line, body: bytes.subarray(offset + 4, end)});
    offset = end + 1;
  }
  return {header: bytes.subarray(0, 4), records, base};
}

// Applies the replacements inside each quoted run of a line body.
function correctBody(body, changes, line) {
  const out = []; let quoted = false, run = [];
  const flush = () => {
    let text = Buffer.from(run).toString('latin1');
    for (const [from, to] of spec.replacements) {
      if (text.includes(from)) { changes.push({line, from, to, count: text.split(from).length - 1}); text = text.replaceAll(from, to); }
    }
    for (const fix of spec.layout.filter(fix => fix.line === line && text.includes(fix.from))) {
      changes.push({line, from: fix.from, to: fix.to, count: 1, layout: fix.reason}); text = text.replace(fix.from, fix.to);
    }
    out.push(...Buffer.from(text, 'latin1')); run = [];
  };
  for (const byte of body) {
    if (byte === 0x22) { if (quoted) flush(); quoted = !quoted; out.push(byte); }
    else if (quoted) run.push(byte); else out.push(byte);
  }
  if (quoted) flush(); // An unterminated string runs to the end of the line.
  return Buffer.from(out);
}

export function buildCorrected() {
  const original = fs.readFileSync(new URL(spec.source, folder));
  const {header, records, base} = parseBasic(original);
  const changes = [], parts = [header]; let offset = 4;
  for (const {line, body} of records) {
    const fixed = correctBody(body, changes, line);
    const next = offset + 4 + fixed.length + 1;
    const link = Buffer.alloc(4); link.writeUInt16LE(base + next, 0); link.writeUInt16LE(line, 2);
    parts.push(link, fixed, Buffer.from([0])); offset = next;
  }
  parts.push(Buffer.from([0, 0]));
  const bytes = Buffer.concat(parts);
  return {original, bytes, listing: decodeBasicProgram(bytes).asAscii(), changes};
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const {original, bytes, listing, changes} = buildCorrected();
  fs.writeFileSync(new URL('corrected/ALIEN.BAS', folder), bytes);
  fs.writeFileSync(new URL('corrected/ALIEN.ASC', folder), listing);
  fs.writeFileSync(new URL('corrected/changes.json', folder), JSON.stringify({source: spec.source, source_sha256: sha(original), sha256: sha(bytes), bytes: bytes.length, listing_sha256: sha(Buffer.from(listing)), changes}, null, 2) + '\n');
  console.log(`${changes.reduce((n, c) => n + c.count, 0)} corrections on ${new Set(changes.map(c => c.line)).size} lines; ${original.length} -> ${bytes.length} bytes`);
}
