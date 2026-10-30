import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Castles,seededRandom} from '../../programs/castles/typescript/engine.ts';
import calibration from '../../programs/castles/typescript/timing-calibration.json' with {type:'json'};
import {measureFall} from './helpers/reference.mjs';

test('settling simulation budgets match actual Z80 cycles across supported and falling fixtures',()=>{
 for(const blocks of [[],[[64,20]],[[64,20],[63,21]],[[64,20],[64,21],[64,22]],[[0,10],[127,10]]]){
  const game=new Castles();for(const [x,y]of blocks)game.plot(x,y,true);
  const actual=measureFall(game.screen,30);let elapsed=0;for(const duration of game.settle(30))elapsed+=duration;
  assert.ok(Math.abs(elapsed-actual.cycles/actual.clockHz*1000)<0.00001,JSON.stringify(blocks));
  assert.deepEqual(game.screen,actual.screen);
 }
});
test('scattered-block settling timing stays within 0.1 percent of the Z80 reference',()=>{
 const random=seededRandom(1982);
 for(let fixture=0;fixture<8;fixture++){
  const game=new Castles();for(let i=0;i<60;i++)game.plot(random(128)-1,random(44)+1,true);
  const actual=measureFall(game.screen,45);let elapsed=0;for(const delay of game.settle(45))elapsed+=delay;
  const reference=actual.cycles/actual.clockHz*1000;
  assert.ok(Math.abs(elapsed/reference-1)<.001,`fixture ${fixture}: ${elapsed} vs ${reference}`);
  assert.deepEqual(game.screen,actual.screen);
 }
});
test('cannon setup, flight, and inter-shot delays use the measured BASIC timing',()=>{
 const game=new Castles(seededRandom(1982));game.beginBombardment();
 const observed=new Map();
 for(let i=0;i<2000&&observed.size<3;i++){game.step();if(['aiming','flight','between-shots'].includes(game.activity))observed.set(game.activity,game.stepMs);}
 assert.ok(Math.abs(observed.get('aiming')-calibration.basic.shotSetupCycles/calibration.clockHz*1000)<1e-9);
 assert.ok(Math.abs(observed.get('flight')-calibration.basic.flightCycles/calibration.clockHz*1000)<1e-9);
 assert.ok(Math.abs(observed.get('between-shots')-calibration.basic.shotExitCycles/calibration.clockHz*1000)<1e-9);
 assert.ok(observed.get('flight')>100&&observed.get('flight')<130); // Old shared interval was 20ms.
});
