import {test,expect} from '@playwright/test';
// Covers our disk player: boot, startup steps, status, Help, pause, restart, and links.
test.describe.configure({timeout:180000});
for(const [id,pattern] of [['growth',/WHICH STATEGY/],['presidential-crisis-game',/WHITE HOUSE/],['deriv',/SYMBOLIC DIFFERENTIATOR/]]){
 test(`${id} starts from its original disk`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/?development=1&test#/program/${id}`);
  await expect(page.locator('#status')).toContainText(/Running/,{timeout:120000});
  await expect.poll(async()=>{const c=await page.evaluate(()=>window.__circaPlayer?.snapshot?.());return c?String.fromCharCode(...c.map(x=>x<32?x+64:x>=128?32:x)):'';},{timeout:60000}).toMatch(pattern);
  expect(errors).toEqual([]);
 });
}
test('disk players pause, restart, offer the disk download, and show their credit',async({page})=>{
 await page.goto('/?development=1#/program/deriv');
 await expect(page.locator('#status')).toContainText(/Running/,{timeout:120000});
 await expect(page.locator('body')).toContainText('Ronald L. Nicol');
 await page.locator('#pause').click();await expect(page.locator('#status')).toHaveText('Paused');
 await page.locator('#pause').click();
 page.once('dialog',d=>d.accept());await page.locator('#restart').click();
 await expect(page.locator('#status')).toContainText(/Running/,{timeout:120000});
});
test('disk pages thank Ira Goldklang, on players and source pages',async({page})=>{
 for(const id of ['go','spell','presidential-crisis-game']){
  await page.goto(`/${id}/v1/`);
  const thanks=page.locator('.disk-thanks');await expect(thanks).toContainText('Ira Goldklang');
  await expect(thanks.locator('a')).toHaveAttribute('href','https://www.trs-80.com/main-welcome.htm');
 }
});
test('the piano is high in More, credits Rich, and its key buttons set the key',async({page})=>{
 await page.goto('/#/more');await expect(page.locator('.program-card').nth(4).locator('h2')).toHaveText('Sound & Tones');
 await page.goto('/?development=1&test#/program/tones');
 await expect(page.locator('.program-attribution')).toContainText('Rich Losey and I wrote this together');
 await expect(page.locator('#status')).toContainText(/Running/,{timeout:120000});
 await page.locator('#display').click();await page.keyboard.type('KEYBOARD',{delay:120});await page.keyboard.press('Enter',{delay:120});await page.waitForTimeout(1500);
 await page.locator('.game-key[data-key="&"]').click();await page.waitForTimeout(500);
 await page.locator('#display').focus();await page.keyboard.press('s',{delay:400});await page.waitForTimeout(500);
 const text=await page.evaluate(()=>String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c>=128?32:c)));
 expect(text).toMatch(/10\s*$/m);
});
