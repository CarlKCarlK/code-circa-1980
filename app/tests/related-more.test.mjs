import fs from 'node:fs';import assert from 'node:assert/strict';import {test} from 'node:test';
import {buildCorrected} from '../scripts/build-cipher-corrected.mjs';import {parseBasic} from '../scripts/build-alien-corrected.mjs';import {runBasic} from './helpers/reference.mjs';
const folder=new URL('../../programs/cipher/',import.meta.url);
test('Cipher derivative reproduces exactly and changes only five record bodies',()=>{const b=buildCorrected();assert.deepEqual(b.bytes,fs.readFileSync(new URL('corrected/CIPHER.BAS',folder)));assert.equal(b.listing,fs.readFileSync(new URL('corrected/CIPHER.ASC',folder),'utf8'));assert.deepEqual(b.record,JSON.parse(fs.readFileSync(new URL('corrected/changes.json',folder))));const before=parseBasic(fs.readFileSync(new URL(b.record.source,folder))),after=parseBasic(b.bytes);assert.equal(before.base,after.base);assert.equal(before.records.length,after.records.length);for(const record of after.records)if(![50,80,440,520,550].includes(record.line))assert.deepEqual(record.body,before.records.find(r=>r.line===record.line).body);});
function translate(message,key,mode){const b=buildCorrected();let text=b.listing.replace(/^40 .*$/m,`40 M$="${message}"`).replace(/^70 .*$/m,`70 K$="${key}"`).replace(/^95 .*$/m,`95 A$="${mode}"`).replace(/^450 .*$/m,'450 POKE28672,LEN(M$):FOR C=1TOLEN(M$):POKE28672+C,ASC(MID$(M$,C,1)):NEXTC:POKE32256,42:END');const m=runBasic(text,8);return String.fromCharCode(...Array.from({length:m.readMemory(28672)},(_,i)=>m.readMemory(28673+i)));}
for(const [input,key,encoded] of [['HELLO','KEY','SJJWT'],['ABC','B','CDE'],[' ','A','A'],['A','Z',' ']])test(`Actual-ROM cipher vector ${JSON.stringify(input)} with ${key} and reverse`,()=>{assert.equal(translate(input,key,'ENCODE'),encoded);assert.equal(translate(encoded,key,'DECODE'),input);});
test('AIM is grouped with SPI while retaining a separate selected reference',()=>{const root=new URL('../../programs/',import.meta.url),aim=JSON.parse(fs.readFileSync(new URL('aim/program.json',root))),spi=JSON.parse(fs.readFileSync(new URL('spi/program.json',root)));assert.equal(aim.parentProgram,spi.id);assert.equal(aim.galleryHidden,true);assert.ok(spi.relatedPrograms.includes(aim.id));assert.equal(aim.versions.filter(v=>v.playable).length,1);assert.equal(spi.versions.filter(v=>v.playable).length,1);});

test('Word Search corrected derivative reproduces and preserves every other record body',async()=>{
 const {buildCorrected:buildWordSearch}=await import('../scripts/build-wordsearch-corrected.mjs');
 const root=new URL('../../programs/wordsearch/',import.meta.url),b=buildWordSearch();
 assert.deepEqual(b.bytes,fs.readFileSync(new URL('corrected/WORDSEARCH.BAS',root)));
 assert.equal(b.listing,fs.readFileSync(new URL('corrected/WORDSEARCH.ASC',root),'utf8'));
 assert.deepEqual(b.record,JSON.parse(fs.readFileSync(new URL('corrected/changes.json',root))));
 const before=parseBasic(fs.readFileSync(new URL(b.record.source,root))),after=parseBasic(b.bytes);
 assert.equal(before.base,after.base);assert.equal(before.records.length,after.records.length);
 assert.deepEqual(after.records.filter((r,i)=>!r.body.equals(before.records[i].body)).map(r=>r.line),[1065,1330,2000,3000]);
 assert.match(b.listing,/WAFR,DISCUSSION,SKILLS/);assert.match(b.listing,/SOLUTE,SOLVENT,SOLUTION/);assert.match(b.listing,/TO REPRINT THE PUZZLE/);
});


test('Actual-ROM current-word field clears longer words without overwriting the counter or grid',async()=>{
 const {buildCorrected:buildWordSearch}=await import('../scripts/build-wordsearch-corrected.mjs');
 const line=buildWordSearch().listing.split('\n').find(l=>l.startsWith('1065 '));
 const m=runBasic('0 CLEAR2000:CLS:PRINT@0,"GRID";:PRINT@1000,"123";\n10 D$="PARTICIPATE":GOSUB1065:D$="ARTIST":GOSUB1065:D$="FILM":GOSUB1065:POKE32256,42:END\n'+line+'\n1070 RETURN\n');
 const text=Array.from({length:1024},(_,i)=>String.fromCharCode(m.readMemory(0x3c00+i))).join('');
 assert.equal(text.slice(960,1000),'FILM'+' '.repeat(36));assert.equal(text.slice(1000,1003),'123');assert.equal(text.slice(0,4),'GRID');
});
