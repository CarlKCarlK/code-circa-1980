import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Castles} from '../programs/castles/typescript/engine.ts';
import {screenCell,paintStroke,strokeCells} from '../programs/castles/typescript/pointer.ts';

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
