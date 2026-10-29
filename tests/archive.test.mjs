import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBasicProgram} from 'trs80-base';

const root=new URL('../programs/',import.meta.url);
for(const name of fs.readdirSync(root)){
 const folder=new URL(name+'/',root);
 if(!fs.existsSync(new URL('program.json',folder)))continue;
 const metadata=JSON.parse(fs.readFileSync(new URL('program.json',folder)));
 const evidence=JSON.parse(fs.readFileSync(new URL('provenance.json',folder)));
 test(`${metadata.title}: catalog and version provenance`,()=>{
   assert.equal(metadata.id,name);assert.equal(metadata.title,evidence.official_title);
   assert.equal(new Set(metadata.versions.map(v=>v.id)).size,metadata.versions.length);
   assert.ok(metadata.versions.find(v=>v.id===metadata.defaultVersion)?.playable);
   assert.equal(metadata.versions.length,evidence.saves.length);
 });
 for(const version of metadata.versions){
  test(`${metadata.title} ${version.id}: unchanged bytes, BASIC structure, listing`,()=>{
    const save=evidence.saves.find(s=>s.version===version.id);assert.ok(save);
    for(const file of save.imported_files){
      assert.ok(!file.path.split('/').includes('..'));
      const bytes=fs.readFileSync(new URL(file.path,folder));
      assert.equal(bytes.length,file.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    }
    assert.equal(version.raw,save.imported_files.find(f=>f.path.endsWith('.BAS')).path);
    assert.equal(version.listing,save.imported_files.find(f=>f.path.endsWith('.ASC')).path);
    const bytes=fs.readFileSync(new URL(version.raw,folder));
    assert.deepEqual([...bytes.subarray(0,3)],[0xd3,0xd3,0xd3]);
    let offset=4,last=-1,lines=0;const bases=new Set();
    while(offset+2<=bytes.length && bytes.readUInt16LE(offset)!==0){
      const pointer=bytes.readUInt16LE(offset);const line=bytes.readUInt16LE(offset+2);
      assert.ok(line>last);last=line;lines++;
      const end=bytes.indexOf(0,offset+4);assert.ok(end>=offset+4);
      bases.add(pointer-end-1);offset=end+1;
    }
    assert.equal(offset+2,bytes.length);assert.equal(bases.size,1);
    assert.equal(lines,save.recovery_item.validation.lines);
    assert.equal(last,save.recovery_item.validation.last);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),save.recovery_item.sha256);
    const listing=fs.readFileSync(new URL(version.listing,folder),'utf8');
    assert.equal(listing.trimEnd().split('\n').length,lines);
    assert.equal(decodeBasicProgram(bytes).asAscii().replaceAll('\r\n','\n').trimEnd(),listing.replaceAll('\r\n','\n').trimEnd());
    if(!version.playable)assert.ok(version.unavailableReason);
  });
 }
}
