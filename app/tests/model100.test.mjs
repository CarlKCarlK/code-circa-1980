import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {model100Payload} from '../site/model100-payload.js';
const programs=new URL('../../programs/',import.meta.url);
for(const name of fs.readdirSync(programs).filter(n=>n.startsWith('model-100-'))){
 const folder=new URL(name+'/',programs),metadata=JSON.parse(fs.readFileSync(new URL('program.json',folder)));
 const evidence=JSON.parse(fs.readFileSync(new URL('provenance.json',folder)));
 test(`${name}: complete tokenized records survive the loading adaptation`,()=>{
  assert.equal(metadata.versions.filter(v=>v.playable).length,1);
  for(const v of metadata.versions.filter(v=>evidence.saves.find(s=>s.version===v.id).inventory_row['recovery%']==='100')){
   const raw=fs.readFileSync(new URL(v.raw,folder)),before=Buffer.from(raw),payload=model100Payload(raw);
   assert.deepEqual(raw,before);assert.deepEqual(Buffer.from(payload.slice(0,-2)),raw.subarray(1,-21));
   assert.deepEqual([...payload.slice(-2)],[0,0]);
   const lines=[];let offset=0;while(offset<payload.length-2){lines.push(payload[offset+2]|payload[offset+3]<<8);offset=payload.indexOf(0,offset+4)+1;}
   const listing=fs.readFileSync(new URL(v.listing,folder),'utf8').trimEnd().split('\n').map(s=>Number(s.match(/^\d+/)[0]));
   assert.deepEqual(lines,listing);
  }
 });
}
test('Model 100 loader rejects damaged framing and pointer chains, even with a valid checksum',()=>{
 const folder=new URL('model-100-input-reversal/',programs),m=JSON.parse(fs.readFileSync(new URL('program.json',folder)));
 const raw=fs.readFileSync(new URL(m.versions.find(v=>v.playable).raw,folder));
 const corrupt=Buffer.from(raw);corrupt[8]^=1;assert.throws(()=>model100Payload(corrupt),/checksum/);
 const pointers=Buffer.from(raw);pointers[1]^=1;pointers[pointers.length-21]=(256-pointers.subarray(1,-21).reduce((a,b)=>a+b,0)%256)%256;
 assert.throws(()=>model100Payload(pointers),/pointers/);
 assert.throws(()=>model100Payload(raw.subarray(0,-1)));
});
test('VirtualT dependency retains pinned bytes, WASM, and license',()=>{
 const folder=new URL('../vendor/virtualt/',import.meta.url),p=JSON.parse(fs.readFileSync(new URL('provenance.json',folder)));
 assert.match(p.commit,/^[a-f0-9]{40}$/);
 for(const [file,hash]of Object.entries(p.files))assert.equal(createHash('sha256').update(fs.readFileSync(new URL(file,folder))).digest('hex'),hash,file);
 assert.ok(WebAssembly.validate(fs.readFileSync(new URL('virtualt.wasm',folder))));
 assert.match(fs.readFileSync(new URL('src/LICENSE',folder),'utf8'),/Stephen Hurd and Ken Pettit/);
});
