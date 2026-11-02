import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildRuntime} from '../scripts/build-learningttt-runtime.mjs';
import {parseBasic} from '../scripts/build-alien-corrected.mjs';
import {runBasic} from './helpers/reference.mjs';
const root=new URL('../../programs/learningttt/',import.meta.url);
test('Tic-Tac-Toe stock-ROM adaptation reproduces its artifacts and preserves every other record body',()=>{
 const built=buildRuntime();assert.deepEqual(fs.readFileSync(new URL('runtime/LEARNINGTTT.BAS',root)),built.bytes);assert.equal(fs.readFileSync(new URL('runtime/LEARNINGTTT.ASC',root),'utf8'),built.listing);assert.deepEqual(JSON.parse(fs.readFileSync(new URL('runtime/changes.json',root))),built.record);
 const original=parseBasic(fs.readFileSync(new URL(built.record.source,root))),adapted=parseBasic(built.bytes);
 assert.equal(adapted.base,original.base);assert.equal(adapted.records.length,original.records.length-2);
 const changed=[215,218,300,305,4010];
 for(const change of built.record.changes)assert.equal(built.listing.split('\n').find(line=>line.startsWith(change.line+' ')),change.after,'Tokenized replacement must retain its complete statement');
 for(const record of adapted.records){const before=original.records.find(r=>r.line===record.line);assert.ok(before);if(!changed.includes(record.line))assert.deepEqual(record.body,before.body,`Line ${record.line}`);}
 assert.deepEqual(built.record.changes.map(c=>c.line),changed);assert.deepEqual(built.record.removed_declarations,[10,12]);
});
test('Expanded board-coordinate and remainder expressions evaluate correctly in the actual Level II ROM',()=>{
 const changes=buildRuntime().record.changes;
 const x=changes.find(c=>c.line===305).after.match(/"\*\*\* "(.+);/)[1];
 const y=changes.find(c=>c.line===305).after.split(';')[1].split(',INT')[0];
 const remainder=changes.find(c=>c.line===4010).after.match(/^4010 R=(.+):IF/)[1];
 const m=runBasic(`10 FOR CH=1TO9:POKE28672+CH,${x}:POKE28704+CH,${y}:NEXT\n20 FOR R=1TO4:T=R:R=${remainder}:POKE28736+T,R:R=T:NEXT\n30 POKE32256,42:END\n`,8);
 for(let i=1;i<=9;i++){assert.equal(m.readMemory(28672+i),(i-1)%3+1);assert.equal(m.readMemory(28704+i),Math.floor((i-1)/3)+1);}
 for(let i=1;i<=4;i++)assert.equal(m.readMemory(28736+i),i%4);
});
