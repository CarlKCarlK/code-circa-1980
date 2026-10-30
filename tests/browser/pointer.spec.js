import {test,expect} from '@playwright/test';
async function boot(page){
 await page.goto('/?development=1&test#/program/castles/typescript/play');
 await expect(page.locator('#status')).toContainText('TypeScript · Building');
}
async function at(page,x,y){
 const canvas=page.locator('#display canvas');await canvas.scrollIntoViewIfNeeded();const r=await canvas.boundingBox();
 return {x:r.x+(10+(x+.5)*4)*r.width/532,y:r.y+(10+(y+.5)*8)*r.height/404};
}
const point=async(page,x,y)=>page.evaluate(([x,y])=>{
 const c=window.__circaPlayer.snapshot()[Math.floor(y/3)*64+Math.floor(x/2)];return !!(c>=128&&c<192&&(c&(1<<((y%3)*2+x%2))));
},[x,y]);
async function drag(page,from,to,button='left'){
 const a=await at(page,...from),b=await at(page,...to);
 await page.mouse.move(a.x,a.y);await page.mouse.down({button});await page.mouse.move(b.x,b.y);await page.mouse.up({button});
}

test('mouse hover is free, strokes remain supported, and right-drag erases only exposed blocks',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await boot(page);
 const floating=await at(page,90,15);await page.mouse.move(floating.x,floating.y);
 expect(await point(page,90,15)).toBe(false);
 await page.mouse.click(floating.x,floating.y);expect(await point(page,90,15)).toBe(false);
 await expect(page.locator('.drawing-feedback')).toContainText('Needs support');
 await drag(page,[64,46],[64,25]);
 for(let y=25;y<=46;y++)expect(await point(page,64,y)).toBe(true);
 await drag(page,[64,46],[64,44],'right');
 expect(await point(page,64,46)).toBe(true);await expect(page.locator('.drawing-feedback')).toContainText('Erase from the top');
 await drag(page,[64,25],[64,35],'right');
 for(let y=25;y<=35;y++)expect(await point(page,64,y)).toBe(false);
 expect(await point(page,64,36)).toBe(true);expect(await point(page,64,47)).toBe(true);
 await expect(page.getByRole('button',{name:'Draw',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Erase',exact:true}).click();await drag(page,[64,36],[64,46]);
 expect(await point(page,64,46)).toBe(false);expect(await point(page,64,47)).toBe(true);
 await page.screenshot({path:'test-results/castles-mouse-tools.png',fullPage:true});expect(errors).toEqual([]);
});

test('hover, keyboard-only modes, cancelled strokes, pause and bombardment do not paint unexpectedly',async({page})=>{
 await boot(page);await expect(page.getByRole('button',{name:'Move',exact:true})).toHaveCount(0);
 const hover=await at(page,30,25);await page.mouse.move(hover.x,hover.y);expect(await point(page,30,25)).toBe(false);
 await page.locator('#display').focus();await page.keyboard.press('7',{delay:180});
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().mode)).toBe('move');
 await expect(page.getByRole('button',{name:'Draw',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Draw',exact:true}).click();
 const start=await at(page,80,46),end=await at(page,80,25);await page.mouse.move(start.x,start.y);await page.mouse.down();
 await page.locator('#display canvas').dispatchEvent('pointercancel',{pointerId:1});
 await page.mouse.move(end.x,end.y);await page.mouse.up();
 expect(await point(page,80,46)).toBe(true);expect(await point(page,80,45)).toBe(false);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().dragging)).toBe(false);
 await page.getByLabel('Mouse controls', {exact:true}).uncheck();
 await drag(page,[90,46],[90,25]);expect(await point(page,90,46)).toBe(false);
 await page.getByRole('button',{name:'Restart',exact:true}).click();
 await page.locator('#display').focus();await page.keyboard.press('8',{delay:180});await page.keyboard.down('1');await page.waitForTimeout(700);await page.keyboard.up('1');
 expect(await point(page,64,45)).toBe(true);
 await page.getByLabel('Mouse controls', {exact:true}).check();
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await drag(page,[90,46],[90,25]);expect(await point(page,90,46)).toBe(false);
 await page.getByRole('button',{name:'Restart',exact:true}).click();
 await page.locator('#display').focus();await page.keyboard.press('q',{delay:40});
 await expect(page.getByRole('button',{name:'Draw',exact:true})).toBeDisabled();
 const before=await page.evaluate(()=>window.__circaPlayer.diagnostics().cursor);
 await drag(page,[90,46],[90,25]);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().cursor)).toEqual(before);
 await expect(page.locator('#status')).toContainText('Bombardment');
});

test('touch taps draw and erase correctly on a narrow scaled canvas',async({browser})=>{
 const context=await browser.newContext({hasTouch:true,viewport:{width:390,height:844}});const page=await context.newPage();
 try{
  await page.goto(`${test.info().project.use.baseURL}/?development=1&test#/program/castles/typescript/play`);
  await expect(page.locator('#status')).toContainText('TypeScript · Building');
  for(const y of [46,45]){const p=await at(page,64,y);await page.touchscreen.tap(p.x,p.y);expect(await point(page,64,y)).toBe(true);}
  await page.getByRole('button',{name:'Expand controls',exact:true}).click();
  await page.getByRole('button',{name:'Erase',exact:true}).click();
  await page.getByRole('button',{name:'Collapse controls',exact:true}).click();
  const p=await at(page,64,45);await page.touchscreen.tap(p.x,p.y);expect(await point(page,64,45)).toBe(false);
  expect(await point(page,64,46)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});
