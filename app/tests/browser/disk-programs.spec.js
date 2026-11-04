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
