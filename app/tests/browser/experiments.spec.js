import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
for(const [id,title] of [['rickyrat','Ricky Rat'],['pinball','Pinball'],['logic','Logic circuit simulator'],['orbit','Orbit simulator']])test(`${id}: one frozen v1 player opens directly and returns to the extra gallery`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/${id}/v1/?test`);
 await expect(page.locator('#display canvas')).toHaveCount(1);
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect(page.locator('.player-header h1')).toHaveText(title);
 expect(new URL(page.url()).pathname).toBe(`/${id}/v1/`);expect(new URL(page.url()).hash).toBe('');
 await expect(page.locator('.version-picker,.web-version-nav')).toHaveCount(0);
 const raw=await page.getByRole('link',{name:'Download original payload',exact:true}).getAttribute('href');
 const response=await page.request.get(raw);expect(response.ok()).toBe(true);
 await page.locator('.player-header').getByRole('link',{name:'Gallery',exact:true}).click();
 await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
 await expect(page.locator('.version-picker')).toHaveCount(0);
 expect(errors).toEqual([]);
});
