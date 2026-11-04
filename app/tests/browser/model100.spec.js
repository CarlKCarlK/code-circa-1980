import {test,expect} from '@playwright/test';
const screen=page=>page.evaluate(()=>String.fromCharCode(...window.__circaPlayer.snapshot()));
async function open(page,id){
 await page.goto(`/?development=1&test#/program/model-100-${id}`);
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer?.diagnostics().frames??0),{timeout:20000}).toBeGreaterThan(700);
}
async function answer(page,text){await page.getByRole('textbox',{name:'Answer for the original program'}).fill(text);await page.getByRole('button',{name:'Send + Enter'}).click();}
async function darkPixels(page){
 const png=await page.locator('iframe').screenshot();
 return page.evaluate(async base64=>{
  const bitmap=await createImageBitmap(await (await fetch('data:image/png;base64,'+base64)).blob());
  const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);
  const pixels=ctx.getImageData(0,0,bitmap.width,bitmap.height).data;
  let dark=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]<50&&pixels[i+1]<50&&pixels[i+2]<50)dark++;return dark;
 },png.toString('base64'));
}
test('Model 100 tokenized BASIC accepts input and plots Traveling Salesman routes',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page,'traveling-salesman');
 await expect.poll(()=>screen(page)).toContain('How many cites?');
 await answer(page,'6');await expect.poll(()=>screen(page)).toContain('random sequence?');
 await answer(page,'1');
 await expect.poll(()=>screen(page),{timeout:15000}).not.toContain('random sequence?');
 await expect.poll(()=>darkPixels(page),{timeout:20000}).toBeGreaterThan(300);
 await page.locator('#display').screenshot({path:'test-results/model100-traveling-salesman.png'});
 expect(errors).toEqual([]);
});
test('Model 100 packed-bit LIFE reaches its first graphics output',async({page})=>{
 test.setTimeout(90000);await open(page,'numeric-processing');
 await expect.poll(()=>darkPixels(page),{timeout:60000}).toBeGreaterThan(0);
});
test('Model 100 input reversal, focus, Help, pause, and restart use the original machine',async({page})=>{
 await open(page,'input-reversal');await answer(page,'.X');
 await expect.poll(()=>screen(page)).toContain('.X');await expect.poll(()=>screen(page)).toMatch(/1\s+0\s+2/);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await page.waitForTimeout(80);
 const frames=await page.evaluate(()=>window.__circaPlayer.diagnostics().frames);await page.waitForTimeout(250);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().frames)).toBe(frames);
 await page.getByRole('button',{name:'Help',exact:true}).click();await page.getByRole('button',{name:'Close help'}).click();
 await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.getByRole('textbox',{name:'Answer for the original program'}).fill('untouched');
 await page.keyboard.press('a');expect(await page.getByRole('textbox',{name:'Answer for the original program'}).inputValue()).toBe('untoucheda');
 await expect.poll(()=>screen(page)).not.toContain('untouched');
 await page.locator('#display').focus();await page.keyboard.down('x');await page.getByRole('button',{name:'Pause',exact:true}).click();
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().held)).toEqual([]);
 await page.getByRole('button',{name:'Restart',exact:true}).click();await expect.poll(()=>screen(page),{timeout:15000}).not.toContain('.X');
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().frames),{timeout:15000}).toBeGreaterThan(700);
});
for(const [id,prompt]of [['jab','layout?'],['life-backwards','Setting up'],['strategy-game','The Secret War'],['study-program','Lesson (.do assumed)?'],['transaction-simulation','?SN Error in 0']]){
 test(`Model 100 ${id}: actual ROM startup`,async({page})=>{await open(page,id);await expect.poll(()=>screen(page),{timeout:20000}).toContain(prompt);});
}
test('Model 100 player fits a narrow screen and navigation stops the machine',async({page})=>{
 await page.setViewportSize({width:390,height:900});await open(page,'jab');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Gallery',exact:true}).click();await expect(page.locator('iframe')).toHaveCount(0);
});
