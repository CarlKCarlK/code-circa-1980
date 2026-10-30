import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Asm} from 'z80-asm';
const folder=new URL('../../programs/castles/dependencies/fall-v6/',import.meta.url);
const source=fs.readFileSync(new URL('23-FALL-ASSEMBLY-V6.TXT',folder));
// EDTASM's decimal line numbers are editor metadata, not assembly instructions.
// Remove only the five-digit prefix and its following space, preserving tabs.
const lines=source.toString('utf8').trimEnd().split(/\r?\n/).map(line=>line.replace(/^\d{5} /,''));
const asm=new Asm(name=>name==='fall.asm'?lines:undefined);
asm.assembleFile('fall.asm');
const errors=asm.assembledLines.filter(line=>line.error);
if(errors.length)throw Error(errors.map(x=>`${x.line}: ${x.error}`).join('\n'));
const used=asm.assembledLines.filter(line=>line.binary.length);
const start=Math.min(...used.map(l=>l.address)),end=Math.max(...used.map(l=>l.address+l.binary.length));
const binary=new Uint8Array(end-start);
for(const line of used)binary.set(line.binary,line.address-start);
const symbols=Object.fromEntries(asm.scopes[0].symbols);
if(start!==32512||symbols.TST?.value!==32725)throw Error('Unexpected FALL interface');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
fs.writeFileSync(new URL('derived.bin',folder),binary);
fs.writeFileSync(new URL('derived.json',folder),JSON.stringify({
 description:'Modern assembly of recovered source; not a recovered historical executable.',
 source:'23-FALL-ASSEMBLY-V6.TXT',source_sha256:sha(source),
 archive_source:'tapes/recovered/tape18a/best/23-FALL-ASSEMBLY-V6.TXT',
 assembler:'z80-asm 2.3.0',transformation:'Strip five-digit EDTASM editor line numbers only.',
 origin:start,parameter_address:symbols.TST.value,bytes:binary.length,sha256:sha(binary),
 symbols:Object.fromEntries(Object.entries(symbols).map(([name,s])=>[name,s.value]))
},null,2)+'\n');
console.log(`FALL v6: ${binary.length} bytes, entry ${start}, TST ${symbols.TST.value}, SHA-256 ${sha(binary)}`);
