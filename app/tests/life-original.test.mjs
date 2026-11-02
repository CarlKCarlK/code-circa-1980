import fs from 'node:fs';import assert from 'node:assert/strict';import {test} from 'node:test';import {createHash} from 'node:crypto';import {machine} from './helpers/reference.mjs';
import {decodeBasicProgram} from 'trs80-base';
const root=new URL('../../programs/life/',import.meta.url);
test('LIFE recovered assembly evolves a horizontal blinker into its vertical phase',()=>{const info=JSON.parse(fs.readFileSync(new URL('derived/build.json',root)));const binary=fs.readFileSync(new URL('derived/life.bin',root));assert.equal(createHash('sha256').update(binary).digest('hex'),info.sha256);assert.equal(createHash('sha256').update(fs.readFileSync(new URL(info.source,root))).digest('hex'),info.source_sha256);const m=machine();
m.runBasicProgram(decodeBasicProgram(fs.readFileSync(new URL('derived/LIFE-BOOT.BAS',root))));m.eventScheduler.add(undefined,m.clockHz*.31,()=>m.writeMemoryBlock(info.origin,fs.readFileSync(new URL('derived/life.bin',root))));while(m.tStateCount<m.clockHz*2)m.step();
for(let i=0;i<1024;i++)m.writeMemory(15360+i,128);
const put=(x,y)=>{const p=15360+Math.floor(y/3)*64+Math.floor(x/2);m.writeMemory(p,m.readMemory(p)|(1<<((y%3)*2+x%2)));};
for(const x of [30,31,32])put(x,23);
m.z80.regs.sp=0x7000;m.writeMemory(0x7000,0);m.writeMemory(0x7001,0x60);m.jumpTo(info.symbols.GEN);const deadline=m.tStateCount+m.clockHz*10;while(m.z80.regs.pc!==0x6000&&m.tStateCount<deadline)m.step();assert.equal(m.z80.regs.pc,0x6000);
const alive=[];for(let y=0;y<48;y++)for(let x=0;x<64;x++)if(m.readMemory(15392+Math.floor(y/3)*64+Math.floor(x/2))&(1<<((y%3)*2+x%2)))alive.push([x,y]);assert.deepEqual(alive,[[31,22],[31,23],[31,24]]);

});
