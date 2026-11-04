import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
for(const id of ['skinner','german','magazine','teachvi','life'])test(`${id}: frozen v1 opens directly and retains downloadable originals`,async({page})=>{
 await page.goto(`/${id}/v1/?test`);await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('#status')).toContainText(id==='life'?'Running original Z80':'Running original BASIC');expect(new URL(page.url()).hash).toBe('');await expect(page.locator('.version-picker,.web-version-nav')).toHaveCount(0);const link=page.getByRole('link',{name:'Download original payload',exact:true});expect((await page.request.get(await link.getAttribute('href'))).ok()).toBe(true);await page.locator('.player-header').getByRole('link',{name:id==='life'?'Collection':'Gallery',exact:true}).click();await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
});
