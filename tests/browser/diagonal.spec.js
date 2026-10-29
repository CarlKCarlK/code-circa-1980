import {test,expect} from '@playwright/test';
test('bare Castles route selects TypeScript while the original remains selectable',async({page})=>{
 await page.goto('/#/program/castles');
 await expect(page.getByRole('link',{name:'TypeScript',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Original · emulator',exact:true}).click();
 await expect(page).toHaveURL(/castles\/v05$/);
});
test('grid assist and diagonal lock draw thin supported diagonal strokes',async({page})=>{
 for(const direction of ['grid','diagonal']){
  await page.goto('/?test#/program/castles/typescript/play');
  await page.getByLabel('Drawing direction').selectOption(direction);
  const canvas=page.locator('#display canvas');await canvas.scrollIntoViewIfNeeded();const r=await canvas.boundingBox();
  const at=async(x,y)=>page.mouse.move(r.x+(10+(x+.5)*4)*r.width/532,r.y+(10+(y+.5)*8)*r.height/404);
  await at(64,46);await page.mouse.down();
  for(const [x,y] of [[65,44],[66,43],[67,42],[69,41],[72,37],[74,36]])await at(x,y);
  await page.mouse.up();
  const pixels=await page.evaluate(()=>{
   const s=window.__circaPlayer.snapshot(),out=[];
   for(let y=2;y<47;y++)for(let x=1;x<=126;x++){
    const c=s[Math.floor(y/3)*64+Math.floor(x/2)];
    if(c>=128&&c<192&&(c&(1<<((y%3)*2+x%2))))out.push([x,y]);
   }return out;
  });
  expect(pixels.length).toBeGreaterThan(8);
  for(const [x,y] of pixels)expect(x-64).toBe(46-y);
 }
});
