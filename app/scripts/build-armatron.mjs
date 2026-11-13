// Tokenizes Armatron-80's listing (programs/armatron/versions/v01/ARMATRON.ASC) into the
// cassette-format ARMATRON.BAS the player loads, and checks that decoding the bytes gives
// back the listing exactly. Edit the .ASC, then run `npm run build:armatron` from app/.
// Armatron-80 is a new 2026 program, so these are built files, not recovered bytes.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBasicProgram, parseBasicText} from 'trs80-base';

const folder = new URL('../../programs/armatron/versions/v01/', import.meta.url);
const listingUrl = new URL('ARMATRON.ASC', folder), rawUrl = new URL('ARMATRON.BAS', folder);
const text = fs.readFileSync(listingUrl, 'latin1').replace(/\r\n?/g, '\n');
const parsed = parseBasicText(text);
if (parsed.error) throw Error(parsed.error);
const bytes = Buffer.from(decodeBasicProgram(parsed).asCassetteBinary());
// The tokenizer leaves 0xFFFF placeholder line pointers. Fill them in as a Level II CSAVE
// would, for a program at 0x42E9 (the usual start, 17129), and name the cassette file A.
bytes[3] = 'A'.charCodeAt(0);
for (let offset = 4; bytes.readUInt16LE(offset) !== 0;) {
  const end = bytes.indexOf(0, offset + 4);
  bytes.writeUInt16LE(0x42e5 + end + 1, offset);
  offset = end + 1;
}
const roundTrip = decodeBasicProgram(bytes).asAscii().replaceAll('\r\n', '\n').trimEnd() + '\n';
if (roundTrip !== text) {
  const a = text.split('\n'), b = roundTrip.split('\n'), i = a.findIndex((line, n) => line !== b[n]);
  throw Error(`Listing does not round-trip at line ${i + 1}:\n  typed:   ${a[i]}\n  decoded: ${b[i]}`);
}
const longest = Math.max(...text.split('\n').map(line => line.length));
if (longest > 240) throw Error(`A line is ${longest} characters; Level II accepts at most 240 when typed.`);
fs.writeFileSync(rawUrl, bytes);
const lines = text.trimEnd().split('\n');
const sha = data => createHash('sha256').update(data).digest('hex');
const listingBytes = fs.readFileSync(listingUrl);
const provenanceUrl = new URL('../../provenance.json', folder), provenance = JSON.parse(fs.readFileSync(provenanceUrl));
Object.assign(provenance.saves[0], {
  imported_files: [
    {path: 'versions/v01/ARMATRON.BAS', bytes: bytes.length, sha256: sha(bytes)},
    {path: 'versions/v01/ARMATRON.ASC', bytes: listingBytes.length, sha256: sha(listingBytes)},
  ],
  build_item: {lines: lines.length, last: Number(lines.at(-1).split(' ')[0]), normal_end_marker: true, sha256: sha(bytes), tool: 'trs80-base 2.3.1 parseBasicText + asCassetteBinary'},
});
fs.writeFileSync(provenanceUrl, JSON.stringify(provenance, null, 2) + '\n');
console.log(JSON.stringify({bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), lines: lines.length, last: Number(lines.at(-1).split(' ')[0]), longest}));
