// Renders each gallery thumbnail as a 1200x630 PNG for link previews, plus assets/og/manifest.json mapping programs to them. Run against a preview server.
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '@playwright/test';
import {projectRoot} from './web-versions.mjs';

const base=process.env.PREVIEW_BASE_URL??'http://127.0.0.1:5297/';
const out=path.join(projectRoot,'app/assets/og');
const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{});
const page=await browser.newPage({viewport:{width:1200,height:630}});
const cards=async route=>{
  await page.goto(new URL(route,base).href);
  await page.waitForSelector('.program-card img');
  return page.$$eval('.program-card',list=>list.map(card=>({href:card.querySelector('.card-art').href,src:card.querySelector('img').src})));
};
const programs={};
for(const route of ['#/','#/more'])for(const {href,src} of await cards(route)){
  const id=new URL(href).pathname.match(/([^/]+)\/v\d+\/$/)?.[1]??href.match(/#\/program\/([^/]+)/)?.[1];
  if(!id)throw Error(`No program in card link: ${href}`);
  // Vite adds a content hash to built asset names.
  programs[id]={src,art:path.basename(new URL(src).pathname).replace(/-[\w-]{8}(\.\w+)$/,'$1')};
}
// AIM shares SPI's gallery entry, so it has no card of its own.
programs.aim=programs.spi;
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(out,{recursive:true});
// The whole thumbnail stays visible, on a background taken from its own left edge.
for(const {src,art} of new Map(Object.values(programs).map(p=>[p.art,p])).values()){
  const bytes=await (await page.request.get(src)).body();
  const type=art.endsWith('.svg')?'image/svg+xml':'image/png';
  await page.setContent(`<!doctype html><body style="margin:0;width:1200px;height:630px;display:flex;align-items:center;justify-content:center;overflow:hidden"><img style="width:1200px;height:630px;object-fit:contain;image-rendering:pixelated" src="data:${type};base64,${bytes.toString('base64')}">`);
  await page.waitForFunction(()=>document.images[0].complete&&document.images[0].naturalWidth>0);
  await page.evaluate(()=>{
    // An SVG with no size of its own can letterbox itself here, so skip transparent pixels.
    const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
    const draw=canvas.getContext('2d');draw.drawImage(document.images[0],0,0,64,64);
    const row=draw.getImageData(0,32,64,1).data;
    let x=0;while(x<63&&row[x*4+3]<255)x++;
    document.body.style.background=`rgb(${row[x*4]},${row[x*4+1]},${row[x*4+2]})`;
  });
  await page.screenshot({path:path.join(out,art.replace(/\.\w+$/,'.png')),clip:{x:0,y:0,width:1200,height:630}});
}
await browser.close();
const manifest=Object.fromEntries(Object.entries(programs).sort(([a],[b])=>a.localeCompare(b,'en')).map(([id,{art}])=>[id,art.replace(/\.\w+$/,'.png')]));
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,1)+'\n');
console.log(`${Object.keys(manifest).length} programs, ${new Set(Object.values(manifest)).size} images.`);
