// Measure emulated CPU cycles, not host-machine execution speed.
import fs from 'node:fs';
import {machine,fallBinary,fallInfo} from '../tests/helpers/reference.mjs';
import {Castles} from '../../programs/castles/typescript/engine.ts';
import {decodeBasicProgram} from 'trs80-base';
const clockHz=machine().clockHz;
function routine(entry,x,y,blocks=[],moving=false){
 const m=machine(),g=new Castles();for(const [a,b]of blocks)g.plot(a,b,true);
 m.writeMemoryBlock(0x3c00,g.screen);m.writeMemoryBlock(fallInfo.origin,fallBinary);m.z80.regs.de=y*256+x;
 m.z80.regs.sp=entry==='LUP2'?0x6ffe:0x7000;
 m.writeMemory(0x6ffe,x);m.writeMemory(0x6fff,y);m.writeMemory(0x7000,0);m.writeMemory(0x7001,0x60);
 m.writeMemory(fallInfo.symbols.CHK,moving?127:0);m.jumpTo(fallInfo.symbols[entry]);
 let first=true,moved=false;
 while(m.z80.regs.pc!==0x6000&&m.tStateCount<10000000){
  if(!first&&entry==='LUP2'&&m.z80.regs.pc===fallInfo.symbols.LUP2){moved=true;break;}
  first=false;m.step();
 }
 if(m.tStateCount>=10000000)throw Error('Routine timing fixture timed out');
 return {cycles:m.tStateCount,moved};
}
const testBase=routine('TEST',64,0).cycles;
const rowIncrement=routine('TEST',64,3).cycles-testBase;
const oddAdjustment=routine('TEST',65,0).cycles-testBase;
const writeExtra=routine('RESET',64,0).cycles-testBase;
const testCost=(x,y)=>testBase+rowIncrement*Math.floor(y/3)+(x%2)*oddAdjustment;
const loopControl=[[],[]];
for(let moving=0;moving<2;moving++)for(let mask=0;mask<8;mask++){
 const x=64,y=30,blocks=[[x,y]];
 if(!(mask&1))blocks.push([x,y+1]);if(!(mask&2))blocks.push([x-1,y+1]);if(!(mask&4))blocks.push([x+1,y+1]);
 const sample=routine('LUP2',x,y,blocks,!!moving);
 let modeled=testCost(x,y+1)+testCost(x-1,y+1)+testCost(x+1,y+1);
 if(sample.moved){const nextX=!(mask&1)?(!(mask&2)?x+1:x-1):x;modeled+=testCost(x,y)+writeExtra+testCost(nextX,y+1)+writeExtra;}
 loopControl[moving][mask]=sample.cycles-modeled;
}
// Run the complete, unchanged v05 BASIC plus the derived routine. The current
// BASIC line number at 0x40A2 lets us timestamp existing statement boundaries.
const m=machine();m.runBasicProgram(decodeBasicProgram(fs.readFileSync(new URL('../../programs/castles/versions/v05/24-FALL-GRAPHICS-BASIC-V2.BAS',import.meta.url))));
m.eventScheduler.add(undefined,m.clockHz*.31,()=>m.writeMemoryBlock(fallInfo.origin,fallBinary));
while(m.tStateCount<m.clockHz*8)m.step();
m.keyboard.keyEvent('q',true);
const flight=[],setup=[],exit=[],impacts=[];let previous=-1,flightStart=0,setupStart=0,impactStart=0,passed120=false;
while(m.tStateCount<m.clockHz*25){
 m.step();const line=m.readMemory(0x40a2)+256*m.readMemory(0x40a3);
 if(line===previous)continue;
 const at=m.tStateCount;
 if(line===80){setupStart=at;if(flightStart&&!passed120)exit.push(at-flightStart);flightStart=0;}
 if(line===100){if(passed120&&flightStart)flight.push(at-flightStart);if(setupStart){setup.push(at-setupStart);setupStart=0;}flightStart=at;passed120=false;}
 if(line===120)passed120=true;
 if(line===180)impactStart=at;
 if(line===195&&impactStart){impacts.push(at-impactStart);impactStart=0;}
 previous=line;
}
const median=values=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)];};
if(flight.length<5||setup.length<5||impacts.length<1)throw Error('Insufficient original-program measurements');
const profile={reference:'Castles v05 + derived FALL assembly v6',model:'TRS-80 Model III, Level II',clockHz,
 method:'Headless instruction stepping; BASIC current-line timestamps and isolated assembled-routine fixtures. CPU time, not host wall time.',
 basic:{flightCycles:median(flight),shotSetupCycles:median(setup),shotExitCycles:median(exit),impactAttemptCycles:Math.round(median(impacts)/9)},
 fall:{testBaseCycles:testBase,testRowIncrementCycles:rowIncrement,oddXAdjustmentCycles:oddAdjustment,writeExtraCycles:writeExtra,emptyEntryControlCycles:49,occupiedEntryControlCycles:74,groundReturnCycles:41,outerCellCycles:31,outerRowCycles:21,routineStartCycles:24,routineReturnCycles:10,loopControlCycles:loopControl},
 samples:{flightSteps:flight.length,shotSetups:setup.length,shotExits:exit.length,completeImpacts:impacts.length,
 flightMs:flight.map(n=>Number((n/clockHz*1000).toFixed(3))),setupMs:setup.map(n=>Number((n/clockHz*1000).toFixed(3))),impactMs:impacts.map(n=>Number((n/clockHz*1000).toFixed(3)))}};
fs.writeFileSync(new URL('../../programs/castles/typescript/timing-calibration.json',import.meta.url),JSON.stringify(profile,null,2)+'\n');
console.log(JSON.stringify({clockHz,basicMs:Object.fromEntries(Object.entries(profile.basic).map(([k,v])=>[k.replace('Cycles',''),v/clockHz*1000])),fall:profile.fall,sampleCounts:[flight.length,setup.length,impacts.length]},null,2));
