import {test,expect} from '@playwright/test';
const sounds=page=>page.evaluate(()=>window.__circaPlayer.diagnostics().sounds);
test.beforeEach(async({page})=>{page.on('dialog',dialog=>dialog.accept());});
test('shots, hits, and falling blocks make sounds; mute stops them and persists',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/?development=1&test#/program/castles/typescript/play/castle');
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toBeVisible();
 // The full-width trestle bridge is hard to miss, so hits do not depend on cannon placement.
 await page.getByLabel('Starting scene').selectOption('trestle');
 await page.getByRole('button',{name:'Fire cannons',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().cannonSettings)).toEqual({power:1,angle:1});
 for(const [label,value] of [['Cannon power','5'],['Cannon angle','12']])
  await page.getByLabel(label).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
 await expect.poll(async()=>{const s=await sounds(page);return s.fire>0&&s.impact>0&&s.fall>0;},{timeout:60000,intervals:[500]}).toBe(true);
 await page.getByRole('button',{name:'Sound on',exact:true}).click();
 await expect(page.getByRole('button',{name:'Sound off',exact:true})).toHaveAttribute('aria-pressed','false');
 const muted=await sounds(page);await page.waitForTimeout(4000);
 expect(await sounds(page)).toEqual(muted);
 await page.reload();
 await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
});
