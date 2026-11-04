import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
const ids=['trigectior','relativity','reflex','nuclear','johnscircle'];
test('More has thirty-four cards with readable artwork and direct new player links',async({page})=>{
 await page.goto('/#/more');await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
 for(const title of ['Trajectory','Relativity','Reflex Tests','Nuclear Equation Completer','John’s Circle'])await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(1);
 expect(await page.locator('.program-card img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 for(const width of [1280,390]){await page.setViewportSize({width,height:960});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByRole('link',{name:'Play John’s Circle →'}).click();await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('.player-help')).toBeHidden();await expect(page.locator('.instructions-start')).toHaveCount(0);
});
for(const id of ids)test(`${id}: frozen v1 starts directly, downloads its payload, and returns to More`,async({page})=>{
 test.setTimeout(60000);await page.goto(`/${id}/v1/?test`);await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('#status')).toContainText('Running original BASIC');expect(new URL(page.url()).hash).toBe('');if(id==='trigectior')await expect(page.locator('.player-header h1')).toHaveText('Trajectory');
 const link=page.getByRole('link',{name:'Download original payload',exact:true});expect((await page.request.get(await link.getAttribute('href'))).ok()).toBe(true);
 await page.locator('.player-header').getByRole('link',{name:'Gallery',exact:true}).click();await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
});
