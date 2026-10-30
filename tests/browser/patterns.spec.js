import {test,expect} from '@playwright/test';
test('train trestle loads a supported full-width bridge with three feet and can be cleared',async({page})=>{
 await page.goto('/?test#/program/castles/typescript/play');
 await page.getByLabel('Prebuilt pattern').selectOption('trestle');await page.getByRole('button',{name:'Load pattern',exact:true}).click();
 await expect(page.locator('.drawing-feedback')).toContainText('Train trestle bridge loaded');
 const rows=await page.evaluate(()=>{
  const screen=window.__circaPlayer.snapshot();
  const at=(x,y)=>{const c=screen[Math.floor(y/3)*64+Math.floor(x/2)];return c>=128&&c<192&&!!(c&(1<<((y%3)*2+x%2)));};
  return {deck:Array.from({length:128},(_,x)=>at(x,24)).filter(Boolean).length,feet:Array.from({length:128},(_,x)=>x).filter(x=>at(x,46)),engine:at(24,16),cars:[41,58,75,92].map(x=>at(x,19))};
 });
 expect(rows).toEqual({deck:128,feet:[21,64,107],engine:true,cars:[true,true,true,true]});
 await page.locator('#display').screenshot({path:'test-results/castles-train-trestle.png'});
 await page.getByLabel('Prebuilt pattern').selectOption('blank');await page.getByRole('button',{name:'Load pattern',exact:true}).click();
 await expect(page.locator('.drawing-feedback')).toContainText('Empty field loaded');
});
