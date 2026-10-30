import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Castles} from '../../programs/castles/typescript/engine.ts';
import {StrokeGuide,screenCell,paintStroke,strokeCells} from '../../programs/castles/typescript/pointer.ts';

test('pointer coordinates respect scaled non-square graphics, CRT padding, and build boundaries',()=>{
 const rect={left:100,top:200,width:1064,height:808};
 const at=(x,y)=>screenCell(100+(10+(x+.5)*4)*2,200+(10+(y+.5)*8)*2,rect);
 assert.deepEqual(at(64,46),{x:64,y:46});assert.deepEqual(at(1,2),{x:1,y:2});
 assert.equal(at(64,47),null);assert.equal(at(0,20),null);assert.equal(at(127,20),null);
 assert.equal(screenCell(105,205,rect),null);
});
test('fast vertical and diagonal drags build contiguous supported structures',()=>{
 for(const to of [{x:64,y:25},{x:85,y:25}]){
  const game=new Castles(),from={x:64,y:46};assert.equal(paintStroke(game,from,to,'draw'),'');
  for(const {x,y}of strokeCells(from,to))assert.equal(game.point(x,y),true);
 }
});
test('hover/free movement does not paint and a floating start stays empty',()=>{
 const game=new Castles(),before=game.screen.slice();
 paintStroke(game,{x:10,y:10},{x:90,y:10},'move');assert.deepEqual(game.screen,before);
 assert.equal(paintStroke(game,{x:90,y:10},{x:90,y:10},'draw'),'unsupported');assert.deepEqual(game.screen,before);
});
test('erase retains directly or diagonally supported blocks; top-down strokes remove a tower',()=>{
 const game=new Castles();paintStroke(game,{x:64,y:46},{x:64,y:25},'draw');
 assert.equal(game.editAt(64,46,'erase'),'protected');assert.equal(game.point(64,46),true);
 assert.equal(game.editAt(63,46,'erase'),'protected');
 assert.equal(paintStroke(game,{x:64,y:25},{x:64,y:46},'erase'),'');
 for(let y=25;y<=46;y++)assert.equal(game.point(64,y),false);
 assert.equal(game.point(64,47),true);assert.equal(game.editAt(64,47,'erase'),'outside');
});
test('bombardment locks mouse edits and movement',()=>{
 const game=new Castles();game.beginBombardment();const before=game.screen.slice(),cursor={...game.cursor};
 assert.equal(game.editAt(64,46,'draw'),'unavailable');
 assert.equal(paintStroke(game,{x:10,y:10},{x:90,y:10},'move'),'unavailable');
 assert.deepEqual(game.screen,before);assert.deepEqual(game.cursor,cursor);
});

test('grid guide tolerates one-column jitter and retains logical one-to-one diagonals',()=>{
 const vertical=new StrokeGuide({x:64,y:46});
 assert.deepEqual(vertical.update({x:65,y:43}),{x:64,y:43});
 assert.deepEqual(vertical.update({x:63,y:35}),{x:64,y:35});
 const diagonal=new StrokeGuide({x:64,y:46});
 assert.deepEqual(diagonal.update({x:70,y:40}),{x:70,y:40});
 assert.deepEqual(diagonal.update({x:75,y:36}),{x:75,y:35});
 const short=new StrokeGuide({x:64,y:46});
 assert.deepEqual(short.update({x:64,y:45},true),{x:64,y:45});
});
test('palette cannon settings survive input release and apply together before a shot',()=>{
 const game=new Castles();game.key('q',true);game.step();game.release();
 game.setCannonSetting('power',5);game.setCannonSetting('angle',12);game.release();
 assert.deepEqual(game.cannonSettings(),{power:5,angle:12});game.step();
 assert.equal(game.power,.5);assert.equal(game.angle,12/26);
 game.reset();assert.deepEqual(game.cannonSettings(),{power:0,angle:0});
});

test('diagonal intent at the start does not leave an extra vertical block',()=>{
 for(const sign of [-1,1]){
  const game=new Castles(),start={x:64,y:46},guide=new StrokeGuide(start);let last=start;
  paintStroke(game,start,start,'draw');
  for(const [dx,dy] of [[1,-2],[2,-3],[3,-4],[5,-5],[8,-9],[10,-10]]){
   const next=guide.update({x:64+sign*dx,y:46+dy});paintStroke(game,last,next,'draw');last=next;
  }
  for(let y=2;y<47;y++)for(let x=1;x<=126;x++)if(game.point(x,y))assert.equal(x,64+sign*(46-y));
  assert.equal(game.point(64,45),false);
 }
});
test('explicit diagonal remains thin despite a strongly vertical initial movement',()=>{
 const guide=new StrokeGuide({x:64,y:46},true);
 for(const raw of [{x:65,y:43},{x:66,y:40},{x:69,y:38},{x:70,y:35}]){
  const next=guide.update(raw);assert.equal(next.x-64,46-next.y);
 }
});

test('switching back to building preserves the structure, cannon settings and positions',()=>{
 const game=new Castles();paintStroke(game,{x:64,y:46},{x:64,y:30},'draw');
 game.beginBombardment();game.setCannonSetting('power',7);game.setCannonSetting('angle',12);game.step();
 const cannons=[...game.cannons],screen=game.screen.slice();
 game.key('5',true);game.beginBuilding();
 assert.equal(game.phase,'building');assert.equal(game.activity,'building');assert.equal(game.held.size,0);
 assert.deepEqual(game.screen,screen);assert.equal(game.editAt(64,29,'draw'),'changed');
 game.beginBombardment();assert.deepEqual(game.cannons,cannons);assert.equal(game.point(64,29),true);
 assert.equal(game.power,.7);assert.equal(game.angle,12/26);
});
test('returning during a flight removes its moving point and does not erase later edits',()=>{
 const game=new Castles(upper=>upper?1:.5);game.beginBombardment();game.setCannonSetting('angle',12);
 game.step();game.step();assert.equal(game.activity,'flight');game.beginBuilding();
 const screen=game.screen.slice();game.step();assert.deepEqual(game.screen,screen);
 game.beginBombardment();game.step();assert.equal(game.phase,'bombarding');
});
