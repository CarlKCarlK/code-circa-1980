import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c))).join('\n');
});
// Lit block-graphics dots on screen (each graphics character holds six).
const litDots=async page=>page.evaluate(()=>Array.from(window.__circaPlayer.snapshot()).reduce((n,c)=>n+(c>=128&&c<192?[...(c&63).toString(2)].filter(b=>b==='1').length:0),0));
const modern=async page=>page.evaluate(()=>{const s=window.__circaPlayer.snapshot();return {...s,count:s.dots.reduce((n,d)=>n+d,0)};});

test('collection opens the TypeScript player; drafts are source only',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'3-D Plot'});
 await expect(card).toContainText('04 / Graphics');
 await expect(card.getByRole('link',{name:'Run 3-D Plot →'})).toHaveAttribute('href',/#\/program\/plot3d\/typescript\/play$/);
 await page.goto('/?development=1#/program/plot3d');
 await expect(page).toHaveURL(/#\/program\/plot3d\/typescript\/play$/);
 await expect(page.locator('.source-details .program-history')).toContainText('LINE');
 await expect(page.locator('.source-details .program-differences')).toContainText('CKADIE');
 await page.getByRole('button',{name:'Help'}).click();
 await expect(page.locator('.player-help')).toContainText('PI and E');
 await page.getByRole('button',{name:'Close help'}).click();
 for(const id of ['v01','v02']){
  await page.goto(`/?development=1#/program/plot3d/${id}`);
  await expect(page.locator('.source-only')).toContainText('Source only');
  await expect(page.locator('#display')).toHaveCount(0);
 }
 expect(errors).toEqual([]);
});

test('TypeScript: instant funnel matches the original, formulas, errors, speeds and redraw',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/plot3d/typescript/play');
 await page.getByRole('button',{name:'Instant'}).click();
 await page.getByRole('button',{name:'Draw',exact:true}).click();
 await expect.poll(async()=>(await modern(page)).done).toBe(true);
 // 562 dots: the standard picture the original draws in the emulator.
 expect((await modern(page)).count).toBe(562);
 await expect(page.locator('#status')).toContainText('about 84 s');
 // Sliders redraw instantly at any speed: these settings draw the recorded 1203-dot picture.
 await page.getByRole('button',{name:'Fast'}).click();
 await page.locator('#plot3d-tilt').fill('1');
 await page.locator('#plot3d-xscale').fill('1.5');
 await page.locator('#plot3d-lines').fill('11');
 await expect(page.locator('output[for=plot3d-lines]')).toHaveText('11');
 const steep=await modern(page);expect(steep.done).toBe(true);expect(steep.count).toBe(1203);
 await page.locator('#plot3d-tilt').fill('0.5');await page.locator('#plot3d-xscale').fill('1');await page.locator('#plot3d-lines').fill('7');
 expect((await modern(page)).count).toBe(562);
 await page.getByRole('button',{name:'Instant'}).click();
 await page.getByLabel('Surface').selectOption({label:'Saddle'});
 await expect(page.locator('#plot3d-formula')).toHaveValue('Y=X^2-Z^2');
 await expect.poll(async()=>(await modern(page)).count).not.toBe(562);
 await page.locator('#plot3d-formula').fill('y=sqr(x)');
 await page.locator('#plot3d-formula').press('Enter');
 await expect(page.locator('.plot3d-message')).toHaveText('?FC Error in 200');
 await expect(page.getByLabel('Surface')).toHaveValue('custom');
 await page.locator('#plot3d-formula').fill('Y=SIN(X');
 await page.getByRole('button',{name:'Draw',exact:true}).click();
 await expect(page.locator('.plot3d-message')).toContainText('?SN Error');
 await page.getByLabel('Surface').selectOption({label:'Funnel (original)'});
 await page.getByRole('button',{name:'1979 pace'}).click();
 await page.getByRole('button',{name:'Redraw'}).click();
 await page.waitForTimeout(1500);
 const slow=await modern(page);expect(slow.done).toBe(false);expect(slow.count).toBeLessThan(100);
 await page.getByRole('button',{name:'Pause'}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume'}).click();
 await page.getByRole('button',{name:'Fast'}).click();
 await expect.poll(async()=>(await modern(page)).done,{timeout:15000}).toBe(true);
 expect((await modern(page)).count).toBe(562);
 expect(errors).toEqual([]);
});

test('original v03 runs fast: standard settings draw the funnel, then pause and restart',async({page})=>{
 test.setTimeout(90000); // The standard picture takes about 85 emulated seconds, about 4 at ×20.
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/plot3d/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('3-D PLOT   (C) 1979   CARL KADIE');
 await expect.poll(()=>screenText(page),{timeout:5000}).toMatch(/TILT\? *$/m);
 await page.getByRole('button',{name:'Fast (×20)'}).click();
 await page.getByRole('button',{name:'Answer every question with Enter'}).click();
 await expect(page.locator('#display')).toBeFocused();
 const start=Date.now();
 // Done: the program prints D in the top-left corner and loops.
 await expect.poll(()=>screenText(page),{timeout:60000,intervals:[500]}).toMatch(/^D/);
 expect(Date.now()-start).toBeLessThan(30000);
 expect(await litDots(page)).toBeGreaterThan(400);
 await page.getByRole('button',{name:'Pause'}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume'}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Restart'}).click();
 await expect.poll(()=>screenText(page),{timeout:15000}).toMatch(/TILT\? *$/m);
 // The picture is gone; only the blinking cursor (a 2-dot graphics block) may show.
 expect(await litDots(page)).toBeLessThanOrEqual(2);
 expect(errors).toEqual([]);
});

test('original v03: the line-200 box breaks in, types the new line and runs it',async({page})=>{
 test.setTimeout(60000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/plot3d/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toMatch(/TILT\? *$/m);
 await page.getByLabel('Surface').selectOption({label:'Saddle'});
 await page.getByRole('button',{name:'Type into BASIC'}).click();
 await expect(page.locator('#display')).toBeFocused();
 // RUN clears the screen and asks the questions again, now with the new line 200.
 await page.waitForTimeout(4000);
 await expect.poll(()=>screenText(page),{timeout:15000}).toMatch(/^3-D PLOT[\s\S]*TILT\? *$/m);
 // BREAK and LIST show what BASIC stored: ^ arrives as the up-arrow, shown here as [.
 await page.locator('#display').press('Escape');
 await page.keyboard.type('LIST 200');await page.keyboard.press('Enter');
 await expect.poll(()=>screenText(page),{timeout:10000}).toMatch(/^200 Y=X\[2-Z\[2 *$/m);
 expect(errors).toEqual([]);
});
