import {test,expect} from '@playwright/test';
const start='/?development=1&test#/program/castles';
const snapshot=page=>page.evaluate(()=>window.__circaPlayer.snapshot());
async function inViewport(page,locator){const box=await locator.boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(await page.evaluate(()=>innerHeight));}
for(const viewport of [{width:1280,height:960},{width:390,height:844}]){
 test(`start and phase action fit ${viewport.width}px without overlay`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto(start);
  await inViewport(page,page.getByRole('link',{name:'Play Castles'}));
  await page.getByRole('link',{name:'Play Castles'}).click();
  await expect(page.locator('#status')).toContainText('Building · draw');
  const canvas=page.locator('#display canvas');await inViewport(page,canvas);
  await inViewport(page,page.getByRole('button',{name:'Fire cannons',exact:true}));
  const c=await canvas.boundingBox(),dock=await page.locator('#control-dock').boundingBox();
  expect(dock.x>=c.x+c.width||dock.y>=c.y+c.height).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Fire cannons',exact:true}).click();
  await expect(page.getByLabel('Cannon power')).toBeVisible();
  await page.getByLabel('Cannon power').fill('6');await page.getByLabel('Cannon angle').fill('13');
  await expect(page.getByLabel('Cannon angle').locator('..')).toContainText('45°');
  await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().cannonSettings)).toEqual({power:6,angle:13});
  await page.getByRole('button',{name:'Return to building',exact:true}).click();
  await expect(page.locator('#status')).toContainText('Building');
  await page.screenshot({path:`test-results/castles-v2-${viewport.width}.png`,fullPage:true});
 });
}
test('help and switching preserve exact construction and pause state',async({page})=>{
 await page.goto(start);await page.getByRole('link',{name:'Play Castles'}).click();
 await expect(page.locator('#status')).toContainText('Building');
 const before=await snapshot(page);
 await page.getByRole('button',{name:'Help',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Castles help'})).toBeVisible();
 const paused=await page.evaluate(()=>window.__circaPlayer.diagnostics());expect(paused.paused).toBe(true);
 await page.waitForTimeout(180);expect((await page.evaluate(()=>window.__circaPlayer.diagnostics())).ticks).toBe(paused.ticks);
 await page.getByRole('button',{name:'Close help',exact:true}).click();
 expect(await snapshot(page)).toEqual(before);
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().paused)).toBe(false);
 await expect(page.getByRole('button',{name:'Help',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await page.getByRole('button',{name:'Help',exact:true}).click();await page.keyboard.press('Escape');
 expect((await page.evaluate(()=>window.__circaPlayer.diagnostics())).paused).toBe(true);
 await page.getByRole('link',{name:'Original TRS-80',exact:true}).click();
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const original=await snapshot(page);
 await page.getByRole('link',{name:'Browser version',exact:true}).click();
 await expect(page.locator('#display canvas')).toHaveAttribute('aria-label','Castles TypeScript playing field');
 expect(await snapshot(page)).toEqual(before);
 expect((await page.evaluate(()=>window.__circaPlayer.diagnostics())).paused).toBe(true);
 await page.goBack();await expect(page.locator('#status')).toHaveText('Paused');
 expect(await snapshot(page)).toEqual(original);
});
test('cancelling clears and saves preserves layout; named PNG downloads',async({page})=>{
 await page.goto(start);await page.getByRole('link',{name:'Play Castles'}).click();
 await expect(page.locator('#status')).toContainText('Building');const before=await snapshot(page);
 page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Clear field',exact:true}).click();expect(await snapshot(page)).toEqual(before);
 await page.locator('.advanced-tools summary').click();
 await page.getByLabel('Starting scene').selectOption('blank');
 page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Load',exact:true}).click();expect(await snapshot(page)).toEqual(before);
 page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('button',{name:'Save bricks',exact:true}).click();expect(await snapshot(page)).toEqual(before);
 page.once('dialog',dialog=>dialog.accept('my bridge.png'));const download=page.waitForEvent('download');await page.getByRole('button',{name:'Save bricks',exact:true}).click();expect((await download).suggestedFilename()).toBe('my bridge.png');expect(await snapshot(page)).toEqual(before);
 page.once('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Load',exact:true}).click();
 const after=await snapshot(page);expect(after).not.toEqual(before);
 await page.getByRole('link',{name:'Collection',exact:true}).click();await page.goBack();
 await expect(page.locator('#status')).toContainText('Building');expect(await snapshot(page)).toEqual(after);
});
test('full screen retains Help, phase action, pause and exit in both implementations',async({page})=>{
 for(const edition of ['typescript','v05']){
  await page.goto(`/?development=1&test#/program/castles/${edition}/play`);
  await expect(page.locator('#status')).toContainText(edition==='typescript'?'Building':'Running original BASIC');
  await page.getByRole('button',{name:'Full screen',exact:true}).click();
  await expect(page.getByRole('button',{name:'Exit full screen',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Close help',exact:true}).click();
  if(edition==='typescript')await expect(page.getByRole('button',{name:'Fire cannons',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Pause',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Exit full screen',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>document.fullscreenElement)).toBe(null);
 }
});
