import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{page.on('dialog',dialog=>dialog.accept());});

const pixels=async page=>page.evaluate(()=>{
 const screen=window.__circaPlayer.snapshot();const points=[];
 for(let y=0;y<48;y++)for(let x=0;x<128;x++){
  const c=screen[Math.floor(y/3)*64+Math.floor(x/2)];
  if(c>=128&&c<192&&(c&(1<<((y%3)*2+x%2))))points.push([x,y]);
 }
 return points;
});
const hold=async(page,key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(120);};
async function boot(page,version='v03'){
 await page.goto(`/?development=1&test#/program/castles/${version}/play`);
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(async()=> (await pixels(page)).filter(p=>p[1]===47).length,{timeout:10000}).toBe(version==='v03'?128:126);
 await page.locator('#display').focus();
}

test('collection leads to instructions; versions and downloads remain available',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 await expect(page.getByRole('link',{name:'Play Castles →'})).toHaveAttribute('href',/castles\/typescript\/play\/bridge$/);
 await page.goto('/?development=1#/program/castles/typescript');
 await expect(page.getByRole('heading',{name:'Castles',exact:true})).toBeVisible();
 await expect(page).toHaveURL(/castles\/typescript$/);
 await expect(page.locator('.quick-start')).toContainText('Start with an arch and a tower');
 await expect(page.locator('canvas')).toHaveCount(0);
 await page.locator('.source-details > summary').click();
 for(const name of ['Download BASIC listing','Download original payload','Recovery provenance']){
  const href=await page.getByRole('link',{name,exact:true}).getAttribute('href');
  const response=await page.request.get(href);expect(response.ok()).toBeTruthy();
 }
 await page.locator('.versions summary').click();
 await expect(page.locator('.versions li')).toHaveCount(5);
 await page.getByRole('link',{name:'V04 · FALL BASIC 1',exact:true}).click();
 await expect(page.getByText('This version is preserved for study.')).toBeVisible();
 await expect(page.getByRole('link',{name:'Play Castles'})).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('original v03 builds a tower, fires, pauses, releases keys and restarts',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await boot(page);
 await hold(page,'8',160);await hold(page,'1',1500);
 await expect.poll(async()=> (await pixels(page)).filter(([x,y])=>x===64&&y<46).length).toBeGreaterThan(3);
 await hold(page,'4',700);
 const before=await pixels(page);
 await page.screenshot({path:'test-results/castles-built.png',fullPage:true});
 await hold(page,'q',350);await hold(page,'5',1500);await hold(page,'m',1800);
 // Cannon trajectories must appear away from the center construction.
 await expect.poll(async()=> (await pixels(page)).filter(([x,y])=>y<46&&(x<55||x>75)).length,{timeout:8000}).toBeGreaterThan(0);
 await page.screenshot({path:'test-results/castles-bombardment.png',fullPage:true});
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const paused=await page.evaluate(()=>window.__circaPlayer.diagnostics());
 await page.waitForTimeout(200);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(paused.tStates);
 await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Restart',exact:true}).click();
 await expect.poll(async()=> (await pixels(page)).filter(p=>p[1]===47).length).toBe(128);
 await expect.poll(async()=> (await pixels(page)).filter(([x,y])=>y<46).length).toBeLessThan(2);
 expect(before.length).toBeGreaterThan(130);
 await page.keyboard.down('1');
 await page.getByRole('button',{name:'Pause',exact:true}).focus();
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().held)).toEqual([]);
 await page.keyboard.up('1');
 // Navigation outside the focused display must not be captured by the emulator.
 await page.getByRole('link',{name:'Collection',exact:true}).click();
 await expect(page.locator('canvas')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__circaPlayer)).toBeUndefined();
 expect(errors).toEqual([]);
});

test('earlier self-contained versions boot and accept their original build controls',async({page})=>{
 for(const version of ['v01','v02']){
  await boot(page,version);
  // Build along the ground so variable emulator polling cannot skip a support row.
  for(let i=0;i<4;i++){
   await hold(page,'Enter',120);await hold(page,'4',80);
  }
  await expect.poll(async()=> (await pixels(page)).filter(([x,y])=>y===46).length).toBeGreaterThan(1);
  await hold(page,' ',250);
  await expect(page.locator('#status')).toContainText('Running original BASIC');
 }
});

test('phone layout has no horizontal overflow and on-screen keys draw',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/?development=1#/program/castles/v03');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'test-results/castles-instructions-mobile.png',fullPage:true});
 await boot(page);
 for(const [key,ms] of [['8',160],['1',1400]]){
  const button=page.getByRole('button',{name:`Game key ${key}`,exact:true});
  await button.scrollIntoViewIfNeeded();const box=await button.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(ms);await page.mouse.up();
 }
 await expect.poll(async()=> (await pixels(page)).filter(([x,y])=>x===64&&y<46).length).toBeGreaterThan(2);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().held)).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('v05 original runs with the assembled FALL dependency',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/castles/v05/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(async()=> (await pixels(page)).filter(p=>p[1]===47).length,{timeout:15000}).toBe(128);
 await page.locator('#display').focus();
 await hold(page,'8',180);await hold(page,'1',1600);
 expect((await pixels(page)).filter(([x,y])=>x===64&&y<46).length).toBeGreaterThan(3);
 await hold(page,'q',400);await hold(page,'5',1800);await hold(page,'m',1800);
 await expect.poll(async()=> (await pixels(page)).filter(([x,y])=>y<46&&(x<55||x>75)).length,{timeout:8000}).toBeGreaterThan(0);
 const text=await page.evaluate(()=>window.__circaPlayer.snapshot().map(c=>c<128?String.fromCharCode(c):' ').join(''));
 expect(text).not.toMatch(/Error|READY/);expect(errors).toEqual([]);
});

test('TypeScript follows the instructions, builds, bombards, pauses and restarts',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/castles/v05');
 await page.getByRole('link',{name:'Browser version',exact:true}).click();
 await expect(page).toHaveURL(/castles\/typescript$/);
 await expect(page.locator('.quick-start')).toContainText('Start with an arch and a tower');
 await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('link',{name:'Build from scratch',exact:true}).click();
 await expect(page.locator('#status')).toContainText('Building');
 await page.locator('#display').focus();
 await hold(page,'8',180);await hold(page,'1',1600);
 expect((await pixels(page)).filter(([x,y])=>x===64&&y<46).length).toBeGreaterThan(3);
 await page.screenshot({path:'test-results/castles-typescript-built.png',fullPage:true});
 await hold(page,'q',300);await hold(page,'5',800);await hold(page,'m',1800);
 await expect(page.locator('#status')).toContainText('Firing');
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().shots),{timeout:8000}).toBeGreaterThan(1);
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().activity)).toBe('flight');
 const beforeFlight=await page.evaluate(()=>window.__circaPlayer.diagnostics().ticks);
 await page.waitForTimeout(600);
 const steps=await page.evaluate(()=>window.__circaPlayer.diagnostics().ticks)-beforeFlight;
 expect(steps).toBeGreaterThanOrEqual(3);expect(steps).toBeLessThanOrEqual(8); // ~117ms/step, not 20ms.

 await expect(page.locator('#status')).not.toContainText('Stopped');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const tick=await page.evaluate(()=>window.__circaPlayer.diagnostics().ticks);await page.waitForTimeout(180);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().ticks)).toBe(tick);
 await page.getByRole('button',{name:'Erase all',exact:true}).click();
 await expect(page.locator('#status')).toContainText('Building');
 expect((await pixels(page)).filter(([x,y])=>y<46)).toHaveLength(0);
 await page.keyboard.down('1');await page.getByRole('button',{name:'Pause',exact:true}).focus();
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().held)).toEqual([]);await page.keyboard.up('1');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('link',{name:'Collection',exact:true}).click();
 await expect(page.locator('canvas')).toHaveCount(0);expect(errors).toEqual([]);
});
