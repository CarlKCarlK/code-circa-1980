import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBasicProgram} from 'trs80-base';
import {model100Payload} from '../site/model100-payload.js';

const root=new URL('../../programs/',import.meta.url);
for(const name of fs.readdirSync(root)){
 const folder=new URL(name+'/',root);
 if(!fs.existsSync(new URL('program.json',folder)))continue;
 const metadata=JSON.parse(fs.readFileSync(new URL('program.json',folder)));
 const evidence=JSON.parse(fs.readFileSync(new URL('provenance.json',folder)));
 test(`${metadata.title}: catalog and version provenance`,()=>{
   assert.equal(metadata.id,name);assert.equal(metadata.title,evidence.official_title);
   assert.equal(new Set(metadata.versions.map(v=>v.id)).size,metadata.versions.length);
   assert.ok(metadata.versions.find(v=>v.id===metadata.defaultVersion));
   if(metadata.sourceOnly)assert.ok(metadata.versions.every(v=>!v.playable&&v.unavailableReason));
   else assert.ok(metadata.versions.find(v=>v.id===metadata.defaultVersion)?.playable);
   assert.equal(metadata.versions.filter(v=>!v.mergedFrom).length,evidence.saves.length);
   if(metadata.gallery==='more')assert.equal(metadata.versions.filter(v=>v.playable).length,metadata.sourceOnly?0:1,'One selected player, or an explicitly source-only collection');
 });
 if(metadata.mergedInto)test(`${metadata.title}: every save joined ${metadata.mergedInto} with the same bytes`,()=>{
   assert.ok(metadata.galleryHidden);
   const target=JSON.parse(fs.readFileSync(new URL(metadata.mergedInto+'/program.json',root)));
   for(const version of metadata.versions){
     const copy=target.versions.find(v=>v.mergedFrom?.program===name&&v.mergedFrom.version===version.id);assert.ok(copy,version.id);
     assert.equal(copy.playable,false);
     for(const field of ['raw','listing'])assert.deepEqual(fs.readFileSync(new URL(metadata.mergedInto+'/'+copy[field],root)),fs.readFileSync(new URL(version[field],folder)),field);
   }
 });
 for(const version of metadata.versions){
  if(version.mergedFrom)continue;
  test(`${metadata.title} ${version.id}: unchanged bytes, BASIC structure, listing`,()=>{
    const save=evidence.saves.find(s=>s.version===version.id);assert.ok(save);
    for(const file of save.imported_files){
      assert.ok(!file.path.split('/').includes('..'));
      const bytes=fs.readFileSync(new URL(file.path,folder));
      assert.equal(bytes.length,file.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
    }
    if(save.disk){
      const bytes=fs.readFileSync(new URL(version.raw,folder));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),save.recovery_item.sha256);
      assert.ok(save.imported_files.some(f=>f.path===version.listing));
      for(const image of version.disk?.images??[])assert.ok(save.imported_files.some(f=>f.path===image));
      if(!version.playable)assert.ok(version.unavailableReason);
      if(save.recovery_item.format==='BASIC disk file'&&save.recovery_item.normal_end_marker){
        assert.equal(bytes[0],0xff);
        let offset=1,last=-1,lines=0;const bases=new Set();
        while(offset+2<=bytes.length&&bytes.readUInt16LE(offset)!==0){
          const line=bytes.readUInt16LE(offset+2);assert.ok(line>last);last=line;lines++;
          const end=bytes.indexOf(0,offset+4);assert.ok(end>=offset+4);
          bases.add(bytes.readUInt16LE(offset)-end-1);offset=end+1;
        }
        assert.equal(bases.size,1);assert.equal(lines,save.recovery_item.lines);assert.equal(last,save.recovery_item.last);
      }
      return;
    }
    if(metadata.archiveImport){
      const bytes=fs.readFileSync(new URL(version.raw,folder));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),save.recovery_item.sha256);
      assert.ok(save.imported_files.some(f=>f.path===version.listing));
      if(save.recovery_item.normal_end_marker){
        assert.deepEqual([...bytes.subarray(0,3)],[0xd3,0xd3,0xd3]);
        let offset=4,last=-1,lines=0;const bases=new Set();
        while(offset+4<=bytes.length&&bytes.readUInt16LE(offset)!==0){
          const line=bytes.readUInt16LE(offset+2);assert.ok(line>last);last=line;lines++;
          const end=bytes.indexOf(0,offset+4);assert.ok(end>=offset+4);
          bases.add(bytes.readUInt16LE(offset)-end-1);offset=end+1;
        }
        assert.equal(offset+2,bytes.length);assert.ok(bases.size<=1);
        assert.equal(lines,save.recovery_item.lines);assert.equal(last,save.recovery_item.last);
        const listing=fs.readFileSync(new URL(version.listing,folder),'utf8');
        assert.equal(decodeBasicProgram(bytes).asAscii().replaceAll('\r\n','\n').trimEnd(),listing.replaceAll('\r\n','\n').trimEnd());
      }
      if(version.playable){
        assert.equal(save.inventory_row['recovery%'],'100');
        if(metadata.model==='MODEL100'){assert.match(save.inventory_row.platform,/Model 100/);model100Payload(bytes);}
        else{assert.ok(save.recovery_item.normal_end_marker);assert.doesNotMatch(save.inventory_row.platform,/Model 100|Commodore|Pocket/);}
      }
      else assert.ok(version.unavailableReason);
      return;
    }
    if(metadata.format==='EDTASM'){
      const raw=fs.readFileSync(new URL(version.raw,folder));
      assert.equal(raw[0],0xd3);assert.equal(raw.at(-1),0x1a);
      const records=raw.subarray(7,-1).toString('latin1').split('\r');assert.equal(records.pop(),'');
      const numbered=records.map(record=>{
        assert.match(record.slice(0,5),/^[\xb0-\xb9]{5}$/);assert.equal(record[5],' ');
        return [...record].map(c=>String.fromCharCode(c.charCodeAt(0)&127)).join('');
      }).join('\n')+'\n';
      assert.equal(numbered,fs.readFileSync(new URL(version.listing,folder),'utf8'));
      const unnumbered=save.imported_files.find(f=>f.path.endsWith('.Z80'));
      assert.equal(numbered.split('\n').filter(Boolean).map(x=>x.slice(6)).join('\n')+'\n',fs.readFileSync(new URL(unnumbered.path,folder),'utf8'));
      assert.equal(records.length,save.recovery_item.lines);return;
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
    // Recovery inventories record structure either under validation or on the item itself.
    const structure=typeof save.recovery_item.validation==='object'?save.recovery_item.validation:save.recovery_item;
    assert.equal(lines,structure.lines??structure.line_count);
    assert.equal(last,structure.last??structure.last_line);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),save.recovery_item.sha256);
    const listing=fs.readFileSync(new URL(version.listing,folder),'utf8');
    // Count numbered lines: a string literal may contain embedded line breaks.
    assert.equal(listing.trimEnd().split('\n').filter(l=>/^\d+ /.test(l)).length,lines);
    assert.equal(decodeBasicProgram(bytes).asAscii().replaceAll('\r\n','\n').trimEnd(),listing.replaceAll('\r\n','\n').trimEnd());
    if(!version.playable)assert.ok(version.unavailableReason);
  });
 }
}
