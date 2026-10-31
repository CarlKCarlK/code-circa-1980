import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c))).join('\n');
});
// Lit block-graphics dots on screen (each graphics character holds six).
const litDots=async page=>page.evaluate(()=>Array.from(window.__circaPlayer.snapshot()).reduce((n,c)=>n+(c>=128&&c<192?[...(c&63).toString(2)].filter(b=>b==='1').length:0),0));

test('collection and program links open the v03 player directly, with drafts as source only',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'3-D Plot'});
 await expect(card).toContainText('04 / Graphics');
 await expect(card.getByRole('link',{name:'Run 3-D Plot →'})).toHaveAttribute('href',/#\/program\/plot3d\/basic\/play$/);
 await page.goto('/?development=1#/program/plot3d');
 await expect(page).toHaveURL(/#\/program\/plot3d\/basic\/play$/);
 await expect(page.locator('#display')).toBeVisible();
 await expect(page.locator('.source-details')).toHaveAttribute('open','');
 await expect(page.locator('.source-details .program-history')).toContainText('LINE');
 await expect(page.locator('.source-details .program-differences')).toContainText('CKADIE');
 await page.getByRole('button',{name:'Help'}).click();
 await expect(page.locator('.player-help')).toContainText('HOW MANY LINES');
 await page.getByRole('button',{name:'Close help'}).click();
 for(const id of ['v01','v02']){
  await page.goto(`/?development=1#/program/plot3d/${id}`);
  await expect(page.locator('.source-only')).toContainText('Source only');
  await expect(page.getByRole('link',{name:'Run the playable version →'})).toHaveAttribute('href','#/program/plot3d/basic/play');
  await expect(page.locator('#display')).toHaveCount(0);
 }
 expect(errors).toEqual([]);
});

test('original v03 runs: standard settings draw the funnel, then pause and restart',async({page})=>{
 test.setTimeout(240000); // The standard picture takes about 85 emulated seconds.
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/plot3d/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('3-D PLOT   (C) 1979   CARL KADIE');
 await expect.poll(()=>screenText(page),{timeout:5000}).toMatch(/TILT\? *$/m);
 await page.getByRole('button',{name:'Answer every question with Enter'}).click();
 await expect(page.locator('#display')).toBeFocused();
 await expect.poll(()=>litDots(page),{timeout:20000}).toBeGreaterThan(20);
 // Done: the program prints D in the top-left corner and loops.
 await expect.poll(()=>screenText(page),{timeout:200000,intervals:[2000]}).toMatch(/^D/);
 expect(await litDots(page)).toBeGreaterThan(400);
 await page.getByRole('button',{name:'Pause'}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume'}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Restart'}).click();
 await expect.poll(()=>screenText(page),{timeout:15000}).toMatch(/TILT\? *$/m);
 expect(await litDots(page)).toBe(0);
 expect(errors).toEqual([]);
});
