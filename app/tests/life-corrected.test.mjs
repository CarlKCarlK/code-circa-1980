import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {buildCorrected} from '../scripts/build-life-corrected.mjs';
import {machine} from './helpers/reference.mjs';

const folder=new URL('../../programs/life/',import.meta.url);
const built=buildCorrected();
test('LIFE correction reproduces its source, binary, provenance and unchanged bootstrap',()=>{
 assert.equal(fs.readFileSync(new URL('corrected/LIFE.Z80',folder),'utf8'),built.listing);
 assert.deepEqual(fs.readFileSync(new URL('corrected/life.bin',folder)),built.binary);
 assert.deepEqual(JSON.parse(fs.readFileSync(new URL('corrected/build.json',folder))),built.record);
 for(const name of ['LIFE-BOOT.ASC','LIFE-BOOT.BAS'])assert.deepEqual(fs.readFileSync(new URL('corrected/'+name,folder)),fs.readFileSync(new URL('derived/'+name,folder)));
 assert.deepEqual(built.record.changed_bytes,[{offset:35,address:32803,before:223,after:224}]);
});
const key=(x,y)=>`${(x+64)%64},${(y+48)%48}`;
function conway(cells){
 const counts=new Map();
 for(const cell of cells){const [x,y]=cell.split(',').map(Number);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(dx||dy){const k=key(x+dx,y+dy);counts.set(k,(counts.get(k)||0)+1);}}
 return new Set([...counts].filter(([k,n])=>n===3||(n===2&&cells.has(k))).map(([k])=>k));
}
function setup(binary,info,points){
 const m=machine();m.writeMemoryBlock(info.origin,binary);m.z80.regs.sp=0x7000;
 m.jumpTo(info.symbols.LIFE);
 let steps=0;while(m.z80.regs.pc!==info.symbols.FLASH&&steps++<100000)m.step();
 assert.equal(m.z80.regs.pc,info.symbols.FLASH,'Startup initializes DIV3 and clears the field');
 for(const [x,y] of points){const address=15360+Math.floor(y/3)*64+Math.floor(x/2);m.writeMemory(address,m.readMemory(address)|(1<<((y%3)*2+x%2)));}
 return m;
}
function generation(m,info){
 m.jumpTo(info.symbols.MAIN);
 let steps=0;do {m.step();steps++;}while(m.z80.regs.pc!==info.symbols.MAIN&&steps<10000000);
 assert.equal(m.z80.regs.pc,info.symbols.MAIN,'Entire historical main loop returns after GEN and LDIR');
 const cells=[];for(let y=0;y<48;y++)for(let x=0;x<64;x++)if(m.readMemory(15360+Math.floor(y/3)*64+Math.floor(x/2))&(1<<((y%3)*2+x%2)))cells.push(key(x,y));
 return cells.sort();
}
const patterns={block:[[30,23],[31,23],[30,24],[31,24]],blinker:[[30,23],[31,23],[32,23]],glider:[[30,23],[31,24],[29,25],[30,25],[31,25]],edgeBlinker:[[63,0],[0,0],[1,0]],cornerGlider:[[63,47],[0,0],[62,1],[63,1],[0,1]],bottomRightCell:[[63,47]]};
for(const [name,points] of Object.entries(patterns))test(`Corrected Z80 LIFE: ${name} matches six full Conway generations`,()=>{
 const m=setup(built.binary,built.record,points);let expected=new Set(points.map(([x,y])=>key(x,y)));
 for(let gen=1;gen<=6;gen++){expected=conway(expected);assert.deepEqual(generation(m,built.record),[...expected].sort(),`Generation ${gen}`);}
});
test('Untouched LIFE reproduces the stale bottom-right cell that the correction removes',()=>{
 const info=JSON.parse(fs.readFileSync(new URL('derived/build.json',folder)));
 const m=setup(fs.readFileSync(new URL('derived/life.bin',folder)),info,patterns.bottomRightCell);
 assert.deepEqual(generation(m,info),['63,47']);
});
