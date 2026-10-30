import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Castles,seededRandom,projectileHeight} from '../../programs/castles/typescript/engine.ts';
import {runBasic,runFall,screenBytes,fallInfo,fallBinary,machine} from './helpers/reference.mjs';
import {decodeBasicProgram} from 'trs80-base';
const listing=fs.readFileSync(new URL('../../programs/castles/versions/v05/24-FALL-GRAPHICS-BASIC-V2.ASC',import.meta.url),'utf8');
const finish=generator=>{let count=0;for(const _ of generator){if(++count>100000)throw Error('Simulation failed to finish');}};

test('assembled dependency matches both BASIC interface addresses',()=>{
 assert.equal(fallBinary.length,214);assert.equal(fallInfo.origin,32512);assert.equal(fallInfo.parameter_address,32725);
});
test('v05 original boots with the derived routine, preserving the same initial field',()=>{
 const m=machine();const raw=fs.readFileSync(new URL('../../programs/castles/versions/v05/24-FALL-GRAPHICS-BASIC-V2.BAS',import.meta.url));
 m.runBasicProgram(decodeBasicProgram(raw));
 m.eventScheduler.add(undefined,m.clockHz*.31,()=>m.writeMemoryBlock(fallInfo.origin,fallBinary));
 while(m.tStateCount<m.clockHz*8)m.step();
 assert.deepEqual(screenBytes(m),new Castles().screen);
 assert.equal(m.readMemory(fallInfo.origin),fallBinary[0]);
});
test('BASIC graphics use truncation and RESET replaces a text cell with graphics',()=>{
 const m=runBasic('10 CLS:SET(.9,.9):POKE32000,PEEK(15360):PRINT@0,".";:POKE32001,POINT(0,0):RESET(0,0):POKE32002,PEEK(15360):POKE32256,42\n20 GOTO20');
 assert.equal(m.readMemory(32000),129);assert.equal(m.readMemory(32001),0);assert.equal(m.readMemory(32002),128);
 const game=new Castles();game.screen[0]=46;assert.equal(game.point(0,0),false);game.plot(.9,.9,false);assert.equal(game.screen[0],128);
});
for(const [name,mode,keys,cursor,blocks]of [
 ['supported vertical draw','DRAW',['8','1'],[64,46],[[64,46]]],
 ['unsupported draw','DRAW',['8','1'],[64,20],[]],
 ['diagonal support','DRAW',['8','4'],[64,30],[[64,31]]],
 ['erase blocked by upper support','ERASE',['9'],[64,30],[[64,30],[65,29]]],
 ['erase exposed block','ERASE',['9'],[64,30],[[64,30]]],
 ['boundary rejects movement','UP',['3'],[1,46],[]]
]){
 test(`builder matches original BASIC: ${name}`,()=>{
  const game=new Castles();game.cursor={x:cursor[0],y:cursor[1]};for(const [x,y]of blocks)game.plot(x,y,true);
  const dx=keys.includes('4')?1:keys.includes('3')?-1:0,dy=keys.includes('1')?-1:0;
  const prefix=`10 CLS\n15 FORI=1 TO 96:PRINTSTRING$(10,128);:NEXTI\n20 FOR X=0TO127:SET(X,47):NEXTX\n30 ${blocks.map(([x,y])=>`SET(${x},${y})`).join(':')||'REM EMPTY'}\n100 X=${cursor[0]}:Y=${cursor[1]}:DX=${dx}:DY=${dy}:P$="${mode}":L$="LONG":GOTO550\n`;
  const body=listing.split('\n').filter(line=>{const n=parseInt(line);return n>=550&&n<=600;}).join('\n');
  const m=runBasic(prefix+body+'\n650 POKE32256,42:GOTO650');
  for(const k of keys)game.key(k,true);game.buildStep();
  assert.deepEqual(game.screen,screenBytes(m));
 });
}
test('single-block shortcut and shift movement retain the v05 controls',()=>{
 const game=new Castles();game.key('0',true);game.buildStep();assert.equal(game.point(64,46),true);assert.equal(game.mode,'move');
 game.release();game.key('Shift',true);game.key('4',true);game.buildStep();assert.equal(game.cursor.x,69);
});
test('projectile formula agrees with BASIC pixel conversion at representative distances',()=>{
 const m=runBasic('10 VX=.8:VY=.4:A=.01:FOR X=1TO60:Y=VY*X/VX-.5*A*X*X/VX/VX:POKE32000+X,46-Y:NEXTX:POKE32256,42\n20 GOTO20');
 for(let x=1;x<=60;x++)assert.equal(Math.floor(Math.fround(46-projectileHeight(.8,.4,x))),m.readMemory(32000+x));
});
test('settling matches assembled Z80 routine for isolated, supported and edge blocks',()=>{
 for(const blocks of [ [[64,20]],[[64,20],[63,21]],[[64,20],[64,21],[64,22]],[[0,10],[127,10]],[[64,20],[63,25],[64,25],[65,25]] ]){
  const game=new Castles();for(const [x,y]of blocks)game.plot(x,y,true);
  const expected=runFall(game.screen,30);finish(game.settle(30));assert.deepEqual(game.screen,expected);
 }
});
test('settling matches Z80 across 24 reproducible scattered-block arrangements',()=>{
 const random=seededRandom(1982);
 for(let scenario=0;scenario<24;scenario++){
  const game=new Castles();for(let i=0;i<80;i++)game.plot(random(128)-1,random(44)+1,true);
  const expected=runFall(game.screen,45);finish(game.settle(45));assert.deepEqual(game.screen,expected,`scenario ${scenario}`);
 }
});
test('bombardment alternates cannons, honors power/angle and can be reset',()=>{
 const game=new Castles(seededRandom(1982));game.key('q',true);game.buildStep();game.key('q',false);
 assert.equal(game.phase,'bombarding');assert.ok(game.cannons[0]>=21&&game.cannons[0]<=35);assert.ok(game.cannons[1]>=92&&game.cannons[1]<=106);
 game.key('5',true);game.step();game.key('5',false);assert.equal(game.power,.5);
 game.key('m',true);
 for(let i=0;i<500&&game.shots<3;i++)game.step();
 assert.ok(game.shots>=3);assert.equal(game.phase,'bombarding',game.error);assert.equal(game.angle,12/26);
 game.reset();assert.equal(game.phase,'building');assert.equal(game.shots,0);assert.equal(game.held.size,0);
});

test('BASIC USR calls the assembled v6 routine and returns with matching settled screen',()=>{
 const m=runBasic('10 CLS\n15 FORI=1 TO 96:PRINTSTRING$(10,128);:NEXTI\n20 FOR X=0TO127:SET(X,47):NEXTX\n30 SET(64,20):POKE32725,30:POKE16526,0:POKE16527,127:DV=USR(0):POKE32256,42\n40 GOTO40',12,true);
 const game=new Castles();game.plot(64,20,true);finish(game.settle(30));assert.deepEqual(game.screen,screenBytes(m));
});

test('controlled impact/debris streams match BASIC plus the Z80 settling call',()=>{
 for(const seed of [1,1982,42,99]){
  const values=[],random=seededRandom(seed);
  const game=new Castles(n=>{const v=random(n);values.push(v);return v;});
  const blocks=[[64,30],[63,30],[65,30],[64,31],[63,31],[64,29],[64,28],[66,32]];
  for(const [x,y]of blocks)game.plot(x,y,true);
  finish(game.impact(64,30));
  let impact=listing.split('\n').find(line=>line.startsWith('180 '));
  impact=impact.replace('FORCC=1TO9:', 'FORCC=1TO9:READ R4,R5,R6,R7:');
  for(const name of ['R4','R5','R6','R7'])impact=impact.replace('RND(3)',name);
  const scatter=listing.split('\n').find(line=>line.startsWith('190 '));
  const settle=listing.split('\n').find(line=>line.startsWith('195 '));
  const remove=listing.split('\n').find(line=>line.startsWith('990 '));
  const prefix='10 CLS\n15 FORI=1 TO 96:PRINTSTRING$(10,128);:NEXTI\n20 FOR X=0TO127:SET(X,47):NEXTX\n30 '+blocks.map(([x,y])=>`SET(${x},${y})`).join(':')+'\n100 NX=64:NY=30:OX=0:OY=0:GOTO180\n';
  // Replace only the random source with recorded draws; keep impact statements.
  const code=prefix+impact+'\n'+scatter+'\n'+settle+'\n200 POKE32256,42:GOTO200\n980 READ R8:IF R8=1 THEN RETURN\n'+remove+'\n3000 DATA '+values.join(',');
  const reference=runBasic(code,12,true);assert.deepEqual(game.screen,screenBytes(reference),`impact seed ${seed}`);
 }
});
