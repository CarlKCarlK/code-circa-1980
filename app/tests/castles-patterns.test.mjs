import {test} from 'node:test';
import assert from 'node:assert/strict';
import {trestleBridge} from '../../programs/castles/typescript/patterns.ts';
import {Castles} from '../../programs/castles/typescript/engine.ts';
import {loadBricks,brickMask} from '../../programs/castles/typescript/bricks.ts';
import {runFall} from './helpers/reference.mjs';
test('train trestle has a full mid-height deck and the minimum three ground feet',()=>{
 const mask=trestleBridge();
 for(let x=0;x<128;x++)assert.equal(mask[24*128+x],1);
 const feet=[...mask.slice(46*128,47*128)].flatMap((v,x)=>v?[x]:[]);
 assert.deepEqual(feet,[21,64,107]);assert.equal(feet.length,Math.ceil(128/(2*(46-24)+1)));
 const game=new Castles();loadBricks(game,mask);assert.deepEqual(brickMask(game),mask);
 for(let y=0;y<46;y++)for(let x=0;x<128;x++)if(mask[y*128+x])
  assert.ok([-1,0,1].some(dx=>x+dx>=0&&x+dx<128&&game.point(x+dx,y+1)),`Unsupported ${x},${y}`);
 assert.deepEqual(runFall(game.screen,46),game.screen);
});
