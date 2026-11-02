import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildCorrected} from '../scripts/build-poker-corrected.mjs';
import {parseBasic} from '../scripts/build-alien-corrected.mjs';
import {runBasic} from './helpers/reference.mjs';
const folder=new URL('../../programs/poker/',import.meta.url);
const code=body=>{let quoted=false;return [...body].filter(b=>{if(b===34)quoted=!quoted;return b===34||!quoted;});};
const built=buildCorrected();
const fixture=(setup,extra='')=>{
 const lines=('1 '+setup+'\n'+built.listing+'\n'+extra).trim().split('\n').filter(Boolean).sort((a,b)=>parseInt(a)-parseInt(b));
 return runBasic(lines.join('\n'),30);
};
test('Poker patch reproduces exactly and only changes three code locations plus printed spelling',()=>{
 assert.deepEqual(built.bytes,fs.readFileSync(new URL('corrected/POKER.BAS',folder)));
 assert.equal(built.listing,fs.readFileSync(new URL('corrected/POKER.ASC',folder),'utf8'));
 assert.deepEqual(built.record,JSON.parse(fs.readFileSync(new URL('corrected/changes.json',folder))));assert.equal(JSON.parse(fs.readFileSync(new URL('provenance.json',folder))).derived_editions[0].sha256,built.record.sha256);
 const before=parseBasic(built.original),after=parseBasic(built.bytes);
 assert.equal(after.base,before.base);assert.equal(after.records.length,before.records.length-1);
 assert.ok(!after.records.some(r=>r.line===1005));
 for(const r of after.records){const old=before.records.find(x=>x.line===r.line);if(![2190,3310].includes(r.line))assert.deepEqual(code(r.body),code(old.body),'Executable tokens changed at '+r.line);}
 assert.match(built.listing,/2190 BB=A\(Z\):GOSUB5000:B\(Z\)=BZ/);
 assert.match(built.listing,/3310 IFT<=25THEN3350/);
 assert.doesNotMatch(built.listing.match(/"[^"\n]*"/g).join('\n'),/YOOU|DRAWW|CHREATIVE|MORRISTIWN|WWATCH|WWELCOME|OPEEN|DOWWN|DO YOU WITH/);
});
test('Poker evaluation preserves the deck instead of duplicating the last printed card',()=>{
 const cards=[0,101,202,304,303,5,107,210,308,11];
 const m=fixture('DIM A(50),B(15):FOR Z=1 TO10:READ A(Z):NEXT:BB=303:N=6:GOSUB2170:GOSUB2170:POKE32257,U:N=1:GOSUB2170:POKE32258,U:FOR Z=1TO10:POKE28672+Z*2,A(Z)-256*INT(A(Z)/256):POKE28673+Z*2,INT(A(Z)/256):NEXT:POKE32256,42:END','5100 DATA '+cards.join(','));
 const after=Array.from({length:10},(_,i)=>m.readMemory(28674+i*2)+256*m.readMemory(28675+i*2));
 assert.deepEqual(after.slice(0,5).sort((a,b)=>a-b),cards.slice(0,5).sort((a,b)=>a-b));assert.deepEqual(after.slice(5).sort((a,b)=>a-b),cards.slice(5).sort((a,b)=>a-b));
 assert.equal(m.readMemory(32257),9,'Computer has high card, not a counterfeit flush');assert.equal(m.readMemory(32258),14,'Player has a legitimate straight');assert.equal(new Set(after).size,10);
});
for(const [name,cards,rank] of [['full house',[3,103,203,6,106],16],['flush',[300,302,305,308,311],15]])test(`Poker recognizes a real ${name}`,()=>{
 const m=fixture('DIM A(50),B(15):FOR Z=1TO5:READ A(Z):NEXT:BB=303:N=1:GOSUB2170:POKE32257,U:POKE32256,42:END','5100 DATA '+cards.join(','));assert.equal(m.readMemory(32257),rank);
});
test('Poker can replace all five computer cards without the debugging STOP',()=>{
 const m=fixture('DIM A(50),B(15):FOR Z=1TO10:A(Z)=Z:NEXT:T=0:X=0:GOTO980','1025 POKE32256,42:END');assert.equal(m.readMemory(32256),42);
});
