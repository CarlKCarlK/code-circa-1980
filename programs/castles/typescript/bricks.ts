import type {Castles} from './engine.ts';
export const BRICK_WIDTH=128,BRICK_HEIGHT=48;
/** File contents represent bricks only; the ground belongs to the game. */
export function brickMask(game:Castles):Uint8Array {
  const mask=new Uint8Array(BRICK_WIDTH*BRICK_HEIGHT);
  for(let y=0;y<47;y++)for(let x=0;x<128;x++)mask[y*128+x]=Number(game.point(x,y));
  return mask;
}
/** White represents bricks; legacy saves use black. */
export function pixelsToBricks(rgba:Uint8ClampedArray,width:number,height:number,whiteBricks=true):Uint8Array {
  return filterPicture(rgba,width,height,[.21,.72,.07],whiteBricks);
}
/** Signed channel weights compare each color with its midpoint. */
export function filterPicture(rgba:Uint8ClampedArray,width:number,height:number,weights:readonly number[],whiteBricks:boolean):Uint8Array {
  const mask=new Uint8Array(128*48);
  if(weights.every(weight=>weight===0))return mask;
  for(let y=0;y<Math.min(height,47);y++)for(let x=0;x<Math.min(width,128);x++){
    const i=(y*width+x)*4,alpha=rgba[i+3]/255;
    let score=0;
    for(let channel=0;channel<3;channel++)score+=weights[channel]*((rgba[i+channel]*alpha+(whiteBricks?0:255)*(1-alpha))-128);
    mask[y*128+x]=Number(whiteBricks?score>=0:score<0);
  }
  return mask;
}
/** A PNG pHYs chunk can describe the game's twice-tall pixels. */
export function hasBrickPixelAspect(bytes:Uint8Array):boolean {
  if(bytes.length<33||![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return false;
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  for(let offset=8;offset+12<=bytes.length;){
    const length=view.getUint32(offset),end=offset+12+length;if(end>bytes.length)return false;
    if(String.fromCharCode(...bytes.subarray(offset+4,offset+8))==='pHYs'&&length===9)
      return view.getUint32(offset+12)>0&&view.getUint32(offset+8)===2*view.getUint32(offset+12);
    offset=end;
  }
  return false;
}
/** Recognize both prior black-brick saves and current white-brick saves. */
export function brickPngPolarity(bytes:Uint8Array):'black'|'white'|null {
  if(bytes.length<33||![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return null;
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const width=view.getUint32(16),height=view.getUint32(20);
  if(width!==128||(height!==48&&height!==96))return null;
  for(let offset=8;offset+12<=bytes.length;){
    const length=view.getUint32(offset),end=offset+12+length;if(end>bytes.length)return null;
    const type=String.fromCharCode(...bytes.subarray(offset+4,offset+8));
    if(height===96&&type==='caSt'&&length===1){if(bytes[offset+8]===1)return 'black';if(bytes[offset+8]===2)return 'white';}
    if(height===48&&type==='pHYs'&&length===9)
      return view.getUint32(offset+8)===2&&view.getUint32(offset+12)===1&&bytes[offset+16]===0?'black':null;
    offset=end;
  }
  return null;
}
export function isBrickPng(bytes:Uint8Array):boolean {return brickPngPolarity(bytes)!==null;}
export function pictureGeometry(width:number,height:number,tallPixels:boolean,savedFormat:boolean) {
  if(savedFormat)return {width:128,height:48,x:0,y:0};
  const pixelHeight=tallPixels?1:2;
  const scale=Math.min(1,128/width,47*pixelHeight/height);
  const w=Math.max(1,Math.min(128,Math.round(width*scale)));
  const h=Math.max(1,Math.min(47,Math.round(height*scale/pixelHeight)));
  return {width:w,height:h,x:Math.floor((128-w)/2),y:Math.floor((47-h)/2)};
}
export function placePicture(mask:Uint8Array,geometry:{width:number;height:number;x:number;y:number}):Uint8Array {
  const placed=new Uint8Array(128*48);
  for(let y=0;y<Math.min(geometry.height,47);y++)for(let x=0;x<geometry.width;x++)
    placed[(y+geometry.y)*128+x+geometry.x]=mask[y*128+x];
  return placed;
}
export function placeBricks(game:Castles,mask:Uint8Array):void {
  if(mask.length!==128*48)throw Error('Expected a 128 × 48 brick map.');
  game.reset();
  for(let y=0;y<47;y++)for(let x=0;x<128;x++)if(mask[y*128+x])game.plot(x,y,true);
}
export function loadBricks(game:Castles,mask:Uint8Array):void {
  placeBricks(game,mask);
  for(const delay of game.settle(46)){}
  game.activity='building';game.stepMs=150;
}
function crc32(bytes:Uint8Array):number {
  let crc=0xffffffff;
  for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
function pngChunk(type:string,data:Uint8Array):Uint8Array {
  const chunk=new Uint8Array(data.length+12),view=new DataView(chunk.buffer);
  view.setUint32(0,data.length);chunk.set([...type].map(c=>c.charCodeAt(0)),4);chunk.set(data,8);
  view.setUint32(8+data.length,crc32(chunk.subarray(4,8+data.length)));return chunk;
}
function withBrickMetadata(png:Uint8Array,square:boolean,version=2):Uint8Array {
  const physical=new Uint8Array(9),view=new DataView(physical.buffer);
  view.setUint32(0,square?1:2);view.setUint32(4,1);
  const chunks=[pngChunk('pHYs',physical)];
  if(square)chunks.push(pngChunk('caSt',new Uint8Array([version])));
  const signature=[137,80,78,71,13,10,26,10];
  if(!signature.every((b,i)=>png[i]===b))throw Error('Invalid PNG signature.');
  const parts:Uint8Array[]=[png.subarray(0,8)];let inserted=false;
  const input=new DataView(png.buffer,png.byteOffset,png.byteLength);
  for(let offset=8;offset<png.length;){
    if(offset+12>png.length)throw Error('Incomplete PNG chunk.');
    const end=offset+12+input.getUint32(offset);
    if(end>png.length)throw Error('Incomplete PNG data.');
    const type=String.fromCharCode(...png.subarray(offset+4,offset+8));
    if(type!=='pHYs'&&type!=='caSt')parts.push(png.subarray(offset,end));
    if(type==='IHDR'){parts.push(...chunks);inserted=true;}
    offset=end;
  }
  if(!inserted)throw Error('PNG header is missing.');
  const result=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let position=0;
  for(const part of parts){result.set(part,position);position+=part.length;}
  return result;
}
/** Previous format, retained for recognizing and testing older saves. */
export function withBrickAspect(png:Uint8Array):Uint8Array {return withBrickMetadata(png,false);}
export function withSquareBrickMetadata(png:Uint8Array,version=2):Uint8Array {return withBrickMetadata(png,true,version);}
export async function saveBrickPng(game:Castles):Promise<Blob> {
  if(game.phase!=='building')throw Error('Return to building before saving bricks.');
  const mask=brickMask(game),canvas=document.createElement('canvas');canvas.width=128;canvas.height=96;
  const ctx=canvas.getContext('2d')!,pixels=ctx.createImageData(128,96);
  for(let y=0;y<96;y++)for(let x=0;x<128;x++){
    const color=mask[Math.floor(y/2)*128+x]?255:0;pixels.data.set([color,color,color,255],(y*128+x)*4);
  }
  ctx.putImageData(pixels,0,0);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not create PNG.')),'image/png'));
  const png=withSquareBrickMetadata(new Uint8Array(await blob.arrayBuffer()));
  return new Blob([png as BlobPart],{type:'image/png'});
}
export async function readBrickImage(file:File):Promise<Uint8Array> {
  const bitmap=await createImageBitmap(file);
  try{
    const bytes=new Uint8Array(await file.arrayBuffer());
    const polarity=brickPngPolarity(bytes),geometry=pictureGeometry(bitmap.width,bitmap.height,hasBrickPixelAspect(bytes),polarity!==null);
    const {width,height}=geometry;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(bitmap,0,0,width,height);
    return placePicture(pixelsToBricks(ctx.getImageData(0,0,width,height).data,width,height,polarity!=='black'),geometry);
  }finally{bitmap.close();}
}
