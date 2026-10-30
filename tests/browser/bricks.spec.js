import fs from 'node:fs/promises';
import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{page.on('dialog',dialog=>dialog.accept());});
import {withBrickAspect,withSquareBrickMetadata} from '../../programs/castles/typescript/bricks.ts';
async function boot(page){await page.goto('/?development=1&test#/program/castles/typescript/play');await page.locator('.advanced-tools summary').click();await expect(page.getByRole('button',{name:'Save bricks',exact:true})).toBeEnabled();}
const point=(page,x,y)=>page.evaluate(([x,y])=>{
 const c=window.__circaPlayer.snapshot()[Math.floor(y/3)*64+Math.floor(x/2)];return c>=128&&c<192&&!!(c&(1<<((y%3)*2+x%2)));
},[x,y]);
const fieldMask=page=>page.evaluate(()=>{
 const screen=window.__circaPlayer.snapshot();return Array.from({length:128*47},(_,i)=>{
  const x=i%128,y=Math.floor(i/128),c=screen[Math.floor(y/3)*64+Math.floor(x/2)];
  return c>=128&&c<192&&!!(c&(1<<((y%3)*2+x%2)));
 });
});
test('bricks save as square-pixel PNG and reload without game state',async({page})=>{
 await boot(page);const canvas=page.locator('#display canvas');await canvas.scrollIntoViewIfNeeded();const r=await canvas.boundingBox();
 const at=(x,y)=>page.mouse.move(r.x+(10+(x+.5)*4)*r.width/532,r.y+(10+(y+.5)*8)*r.height/404);
 await at(64,46);await page.mouse.down();await at(64,30);await page.mouse.up();
 expect(await point(page,64,30)).toBe(true);
 const original=await fieldMask(page);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Save bricks',exact:true}).click();
 const file=await download,path=await file.path(),bytes=await fs.readFile(path);
 expect(bytes.readUInt32BE(16)).toBe(128);expect(bytes.readUInt32BE(20)).toBe(96);
 let physical;
 for(let i=8;i<bytes.length;i+=12+bytes.readUInt32BE(i))if(bytes.toString('ascii',i+4,i+8)==='pHYs')physical=[bytes.readUInt32BE(i+8),bytes.readUInt32BE(i+12),bytes[i+16]];
 expect(physical).toEqual([1,1,0]);
 const pixels=await page.evaluate(async base64=>{
  const bitmap=await createImageBitmap(await (await fetch(`data:image/png;base64,${base64}`)).blob());
  const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d');ctx.drawImage(bitmap,0,0);
  const rgba=ctx.getImageData(0,0,128,96).data;let mismatched=0;
  for(let y=0;y<96;y+=2)for(let x=0;x<128;x++)for(let channel=0;channel<4;channel++)if(rgba[(y*128+x)*4+channel]!==rgba[((y+1)*128+x)*4+channel])mismatched++;
  return {mismatched,brick:rgba[(60*128+64)*4],empty:rgba[(60*128+20)*4],ground:rgba[(95*128+64)*4]};
 },bytes.toString('base64'));
 expect(pixels).toEqual({mismatched:0,brick:255,empty:0,ground:0});
 await page.getByRole('button',{name:'New construction',exact:true}).click();expect(await point(page,64,30)).toBe(false);
 await page.getByLabel('Brick image file').setInputFiles(path);
 await page.getByRole('dialog',{name:'Load picture'}).getByRole('button',{name:'OK'}).click();
 await expect(page.getByText('Loaded bricks; unsupported blocks have settled.',{exact:true})).toBeVisible();
 for(let y=30;y<=46;y++)expect(await point(page,64,y)).toBe(true);
 expect(await fieldMask(page)).toEqual(original);
 expect((await page.evaluate(()=>window.__circaPlayer.diagnostics())).shots).toBe(0);
});
test('old rectangular-pixel saves and dense square-pixel saves keep black bricks',async({page})=>{
 await boot(page);
 const makeImage=height=>page.evaluate(height=>{
  const scale=height/48,c=document.createElement('canvas');c.width=128;c.height=height;const ctx=c.getContext('2d');
  ctx.fillStyle='black';ctx.fillRect(0,0,128,47*scale);ctx.fillStyle='white';ctx.fillRect(30,20*scale,1,scale);ctx.fillRect(0,47*scale,128,scale);
  return c.toDataURL('image/png').split(',')[1];
 },height);
 const legacy=Buffer.from(withBrickAspect(Buffer.from(await makeImage(48),'base64')));
 const square=Buffer.from(withSquareBrickMetadata(Buffer.from(await makeImage(96),'base64'),1));
 for(const bytes of [legacy,square]){
  await page.getByLabel('Brick image file').setInputFiles({name:'dense.png',mimeType:'image/png',buffer:bytes});
  const dialog=page.getByRole('dialog',{name:'Load picture'});await expect(dialog).toBeVisible();
  const shade=await dialog.locator('canvas').evaluate(c=>{
   const ctx=c.getContext('2d');return [ctx.getImageData(11,11,1,1).data[0],ctx.getImageData(10+30*4+1,10+20*8+1,1,1).data[0]];
  });
  expect(shade).toEqual([230,51]);await dialog.getByRole('button',{name:'Cancel'}).click();
 }
});
test('JPEG and ordinary PNG imports scale and sample the whole picture, then settle bricks',async({page})=>{
 await boot(page);
 for(const [type,darkBackground] of [['image/jpeg',true],['image/png',true]]){
  const data=await page.evaluate(({type,darkBackground})=>{
   const c=document.createElement('canvas');c.width=256;c.height=94;const ctx=c.getContext('2d');
   ctx.fillStyle=darkBackground?'black':'white';ctx.fillRect(0,0,256,94);ctx.fillStyle=darkBackground?'white':'black';ctx.fillRect(160,20,4,2);ctx.fillRect(240,40,4,2);
   return c.toDataURL(type,1).split(',')[1];
  },{type,darkBackground});
  await page.getByLabel('Brick image file').setInputFiles({name:type==='image/png'?'picture.png':'picture.jpg',mimeType:type,buffer:Buffer.from(data,'base64')});
  await page.getByRole('dialog',{name:'Load picture'}).getByRole('button',{name:'OK'}).click();
  await expect(page.getByText('Loaded bricks; unsupported blocks have settled.',{exact:true})).toBeVisible();
  expect(await point(page,80,10)).toBe(false);expect(await point(page,80,46)).toBe(true);expect(await point(page,120,46)).toBe(true);
 }
 await page.getByLabel('Brick image file').setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('invalid')});
 await expect(page.getByText(/Could not load this picture/)).toBeVisible();expect(await point(page,80,46)).toBe(true);
});
test('white stays bricks even when it is the background',async({page})=>{
 await boot(page);
 const data=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=c.height=40;const ctx=c.getContext('2d');
  ctx.fillStyle='white';ctx.fillRect(0,0,40,40);ctx.fillStyle='black';ctx.fillRect(10,10,20,20);
  return c.toDataURL().split(',')[1];
 });
 await page.getByLabel('Brick image file').setInputFiles({name:'white-background.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
 const dialog=page.getByRole('dialog',{name:'Load picture'});
 const shades=await dialog.locator('canvas').evaluate(c=>{
  const ctx=c.getContext('2d');return [ctx.getImageData(10+44*4+1,10+13*8+1,1,1).data[0],ctx.getImageData(10+54*4+1,10+18*8+1,1,1).data[0]];
 });
 expect(shades).toEqual([230,51]);await dialog.getByRole('button',{name:'Cancel'}).click();
});
test('import displays the original picture before visibly falling and can pause',async({page})=>{
 await boot(page);
 const data=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=128;c.height=94;const ctx=c.getContext('2d');
  ctx.fillStyle='black';ctx.fillRect(0,0,128,94);ctx.fillStyle='white';ctx.fillRect(80,20,1,2);
  return c.toDataURL().split(',')[1];
 });
 await page.getByLabel('Brick image file').setInputFiles({name:'fall.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
 await page.getByRole('dialog',{name:'Load picture'}).getByRole('button',{name:'OK'}).click();
 expect(await point(page,80,10)).toBe(true);expect(await point(page,80,46)).toBe(false);
 await expect(page.getByText('Picture loaded; loose bricks are falling.')).toBeVisible();
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const paused=await fieldMask(page);await page.waitForTimeout(300);expect(await fieldMask(page)).toEqual(paused);
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 const seen=await page.evaluate(()=>new Promise(resolve=>{
  const positions=[];const start=performance.now();function frame(){
   const screen=window.__circaPlayer.snapshot();
   for(let y=0;y<47;y++){const c=screen[Math.floor(y/3)*64+40];if(c>=128&&c<192&&(c&(1<<((y%3)*2))))positions.push(y);}
   if(window.__circaPlayer.diagnostics().activity==='building'||performance.now()-start>10000)resolve(positions);else requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
 }));
 expect(seen.some(y=>y>10&&y<46)).toBe(true);expect(await point(page,80,46)).toBe(true);
 await expect(page.getByText('Loaded bricks; unsupported blocks have settled.',{exact:true})).toBeVisible();
});
test('picture preview responds to signed color controls and changes the field only on OK',async({page})=>{
 await boot(page);
 const field=page.locator('#display canvas');await field.scrollIntoViewIfNeeded();const fieldBox=await field.boundingBox();
 await page.mouse.click(fieldBox.x+(10+64.5*4)*fieldBox.width/532,fieldBox.y+(10+46.5*8)*fieldBox.height/404);
 expect(await point(page,64,46)).toBe(true);
 const data=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=2;c.height=1;const ctx=c.getContext('2d');
  ctx.fillStyle='red';ctx.fillRect(0,0,1,1);ctx.fillStyle='lime';ctx.fillRect(1,0,1,1);
  return c.toDataURL('image/png').split(',')[1];
 });
 const upload=()=>page.getByLabel('Brick image file').setInputFiles({name:'colors.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')});
 await upload();const dialog=page.getByRole('dialog',{name:'Load picture'});await expect(dialog).toBeVisible();
 expect(await dialog.getByRole('slider').count()).toBe(3);
 const previewBox=await dialog.locator('canvas').boundingBox();expect(Math.abs(previewBox.width-fieldBox.width)).toBeLessThan(5);
 const previewPixel=()=>dialog.locator('canvas').evaluate(c=>[...c.getContext('2d').getImageData(10+63*4+1,10+23*8+1,1,1).data]);
 await dialog.getByLabel('Green cutoff').fill('0');await dialog.getByLabel('Blue cutoff').fill('0');
 await dialog.getByLabel('Red cutoff').fill('1');const positive=await previewPixel();
 await dialog.getByLabel('Red cutoff').fill('-1');const negative=await previewPixel();expect(negative).not.toEqual(positive);
 expect(await point(page,63,46)).toBe(false);expect(await point(page,64,46)).toBe(true);
 await dialog.getByRole('button',{name:'Cancel'}).click();expect(await point(page,63,46)).toBe(false);expect(await point(page,64,46)).toBe(true);
 await upload();await expect(dialog).toBeVisible();
 await dialog.getByLabel('Green cutoff').fill('0');await dialog.getByLabel('Blue cutoff').fill('0');await dialog.getByLabel('Red cutoff').fill('1');
 await dialog.getByRole('button',{name:'OK'}).click();
 await expect(page.getByText('Loaded bricks; unsupported blocks have settled.',{exact:true})).toBeVisible();
 expect(await point(page,63,46)).toBe(true);
});
test('picture preview centers and corrects square pixels while honoring twice-tall PNG pixels',async({page})=>{
 await boot(page);
 const data=await page.evaluate(()=>{
  const c=document.createElement('canvas');c.width=c.height=40;const ctx=c.getContext('2d');
  ctx.fillStyle='black';ctx.fillRect(0,0,40,40);ctx.fillStyle='white';ctx.fillRect(10,10,20,20);
  return c.toDataURL('image/png').split(',')[1];
 });
 for(const [bytes,expectedHeight] of [[Buffer.from(data,'base64'),10],[Buffer.from(withBrickAspect(Buffer.from(data,'base64'))),20]]){
  await page.getByLabel('Brick image file').setInputFiles({name:'shape.png',mimeType:'image/png',buffer:bytes});
  const dialog=page.getByRole('dialog',{name:'Load picture'});await expect(dialog).toBeVisible();
  const bounds=await dialog.locator('canvas').evaluate(c=>{
   const ctx=c.getContext('2d');let minX=128,maxX=-1,minY=47,maxY=-1;
   for(let y=0;y<47;y++)for(let x=0;x<128;x++){
    const p=ctx.getImageData(10+x*4+1,10+y*8+1,1,1).data;
    if(p[0]>200){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
   }
   return {minX,maxX,minY,maxY};
  });
  expect(bounds.maxX-bounds.minX+1).toBe(20);expect(bounds.maxY-bounds.minY+1).toBe(expectedHeight);
  expect((bounds.maxX+bounds.minX)/2).toBe(63.5);expect(Math.abs((bounds.maxY+bounds.minY)/2-23)).toBeLessThanOrEqual(.5);
  await dialog.getByRole('button',{name:'Cancel'}).click();
 }
});
