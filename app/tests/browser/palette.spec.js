import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{page.on('dialog',dialog=>dialog.accept());});
test('docked controls drive building, firing, pause, and erase all',async({page})=>{
 await page.goto('/?development=1&test#/program/castles/typescript/play');
 await expect(page.locator('#control-dock .docked-palette')).toBeVisible();
 await page.getByRole('button',{name:'Fire cannons',exact:true}).click();
 await expect(page.getByLabel('Cannon power')).toBeVisible();
 await page.getByLabel('Cannon power').evaluate(el=>{el.value='5';el.dispatchEvent(new Event('input',{bubbles:true}));});await page.getByLabel('Cannon angle').evaluate(el=>{el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await expect.poll(()=>page.evaluate(()=>window.__circaPlayer.diagnostics().cannonSettings)).toEqual({power:5,angle:12});
 await page.getByRole('button',{name:'Return to building',exact:true}).click();
 await expect(page.getByRole('button',{name:'Draw',exact:true})).toBeEnabled();
 await expect(page.locator('#status')).toContainText('Building');
 await page.getByRole('button',{name:'Fire cannons',exact:true}).click();
 await expect(page.getByRole('button',{name:'Return to building',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Erase all',exact:true}).click();await expect(page.getByRole('button',{name:'Draw',exact:true})).toBeVisible();
});
