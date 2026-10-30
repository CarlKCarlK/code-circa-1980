import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Castles} from '../programs/castles/typescript/engine.ts';
import {brickMask,pixelsToBricks,loadBricks,withBrickAspect,isBrickPng} from '../programs/castles/typescript/bricks.ts';
test('brick files contain only blocks, excluding the ground and cannon settings',()=>{
 const game=new Castles();game.plot(64,46,true);game.power=.7;game.angle=.5;
 const mask=brickMask(game);assert.equal(mask.length,6144);assert.equal(mask.reduce((n,x)=>n+x,0),1);
 const loaded=new Castles();loadBricks(loaded,mask);assert.equal(loaded.point(64,46),true);assert.equal(loaded.point(0,47),true);
 assert.equal(loaded.power,0);assert.equal(loaded.angle,0);assert.equal(loaded.phase,'building');
});
test('picture conversion crops without scaling and composites transparency on black',()=>{
 const width=140,height=55,data=new Uint8ClampedArray(width*height*4);
 for(let i=3;i<data.length;i+=4)data[i]=255;
 const pixel=(x,y,rgba)=>data.set(rgba,(y*width+x)*4);
 pixel(64,10,[255,255,255,255]);pixel(65,10,[255,255,255,0]);pixel(66,10,[200,200,200,255]);pixel(67,10,[100,100,100,255]);pixel(130,10,[255,255,255,255]);pixel(64,50,[255,255,255,255]);
 const mask=pixelsToBricks(data,width,height);
 assert.equal(mask[10*128+64],1);assert.equal(mask[10*128+65],0);assert.equal(mask[10*128+66],1);assert.equal(mask[10*128+67],0);
 assert.equal(mask.reduce((n,x)=>n+x,0),2);
});
test('loading unsupported picture bricks settles them using original rules',()=>{
 const game=new Castles(),mask=new Uint8Array(6144);mask[10*128+80]=1;loadBricks(game,mask);
 assert.equal(game.point(80,10),false);assert.equal(game.point(80,46),true);assert.equal(game.activity,'building');
 assert.throws(()=>loadBricks(game,new Uint8Array(2)),/128/);
});
test('PNG aspect metadata specifies twice-tall pixels and replaces prior pHYs',()=>{
 const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jA7sAAAAASUVORK5CYII=','base64'));
 const saved=withBrickAspect(png),again=withBrickAspect(saved);assert.deepEqual(saved,again);assert.equal(isBrickPng(saved),false);
 const view=new DataView(saved.buffer);let count=0;
 for(let offset=8;offset<saved.length;offset+=view.getUint32(offset)+12){
  if(String.fromCharCode(...saved.subarray(offset+4,offset+8))==='pHYs'){
   count++;assert.equal(view.getUint32(offset+8),2);assert.equal(view.getUint32(offset+12),1);assert.equal(saved[offset+16],0);
  }
 }
 assert.equal(count,1);
});

test('white always means brick regardless of which shade is more common',()=>{
 assert.equal(pixelsToBricks(new Uint8ClampedArray([0,0,0,255]),1,1)[0],0);
 assert.equal(pixelsToBricks(new Uint8ClampedArray([255,255,255,255]),1,1)[0],1);
 assert.deepEqual([...pixelsToBricks(new Uint8ClampedArray([0,0,0,255,255,255,255,255]),2,1)].slice(0,2),[0,1]);
 assert.equal(pixelsToBricks(new Uint8ClampedArray([0,0,0,255]),1,1,false)[0],1);
});
