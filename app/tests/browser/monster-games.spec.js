import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
for(const id of ['jaberwocky','cave','jab'])test(`${id}: frozen v1 opens directly and returns to More`,async({page:p})=>{
 test.setTimeout(100000);await p.goto(`/${id}/v1/?test`);await expect(p.locator('#display canvas')).toHaveCount(1);await expect(p.locator('#status')).toContainText('Running original BASIC');expect(new URL(p.url()).hash).toBe('');await expect(p.getByRole('combobox',{name:'Emulator speed'})).toHaveValue('1');
 const download=p.getByRole('link',{name:'Download original payload',exact:true});expect((await p.request.get(await download.getAttribute('href'))).ok()).toBe(true);await p.getByRole('button',{name:'Help',exact:true}).click();await expect(p.locator('.player-help')).toBeVisible();await expect(p.locator('#status')).toContainText('Paused');await p.getByRole('button',{name:'Close help',exact:true}).click();await expect(p.locator('.player-help')).toBeHidden();
 await p.locator('.player-header').getByRole('link',{name:'Gallery',exact:true}).click();await expect(p.locator('.program-card')).toHaveCount(MORE_COUNT);
});
test('Monster cards have readable artwork, direct player links, and mobile layout',async({page:p})=>{
 await p.goto('/#/more');await expect(p.locator('.program-card')).toHaveCount(MORE_COUNT);for(const title of ['Jaberwocky','Cave Game','JAB — The Best of the Monster Games'])await expect(p.getByRole('heading',{name:title,exact:true})).toHaveCount(1);expect(await p.locator('.program-card img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);await p.setViewportSize({width:390,height:960});expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await p.getByRole('link',{name:'Play Jaberwocky →',exact:true}).click();await expect(p.locator('#display canvas')).toHaveCount(1);await expect(p.locator('.instructions-start')).toHaveCount(0);
});
