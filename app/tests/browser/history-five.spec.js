import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
test('Tank is honestly source only, with downloads and no playable-version loop',async({page:p})=>{
 await p.goto('/?development=1#/program/tank');await expect(p.locator('.source-only')).toContainText('No runnable recovered version');await expect(p.locator('#display')).toHaveCount(0);await expect(p.locator('.source-only a[href*="tank"]')).toHaveCount(0);await expect(p.getByRole('link',{name:'Earlier Tank: validated prefix',exact:true})).toBeVisible();const link=p.getByRole('link',{name:'Download original payload',exact:true});expect((await p.request.get(await link.getAttribute('href'))).ok()).toBe(true);
});
for(const id of ['whodonnt','dungeon','tutac','ll'])test(`${id}: frozen v1 opens its selected player, Help, and original downloads`,async({page:p})=>{
 test.setTimeout(60000);await p.goto(`/${id}/v1/?test`);await expect(p.locator('#display canvas')).toHaveCount(1);await expect(p.locator('#status')).toContainText('Running original BASIC');expect(new URL(p.url()).hash).toBe('');await p.getByRole('button',{name:'Help',exact:true}).click();await expect(p.locator('.player-help')).toBeVisible();await p.getByRole('button',{name:'Close help',exact:true}).click();const link=p.getByRole('link',{name:'Download original payload',exact:true});expect((await p.request.get(await link.getAttribute('href'))).ok()).toBe(true);await p.locator('.player-header').getByRole('link',{name:'Gallery',exact:true}).click();await expect(p.locator('.program-card')).toHaveCount(MORE_COUNT);
});
test('Tank frozen v1 stays source only with working source downloads',async({page:p})=>{
 await p.goto('/tank/v1/?test');await expect(p.locator('.source-only')).toContainText('No runnable recovered version');await expect(p.locator('#display')).toHaveCount(0);const link=p.getByRole('link',{name:'Download BASIC listing',exact:true});expect((await p.request.get(await link.getAttribute('href'))).ok()).toBe(true);
});
test('Five new entries are appended after the existing monster games',async({page:p})=>{
 await p.goto('/#/more');await expect(p.locator('.program-card')).toHaveCount(MORE_COUNT);expect((await p.locator('.program-card h2').allTextContents()).filter(title=>!['Sound & Tones','Liar’s Poker','Illiad'].includes(title)).slice(29,34)).toEqual(['Who Donnt?','Dungeon Trainer','TUTAC Computer','Unfinished Tank Game','Lunar Lander']);await p.getByRole('link',{name:'View source Unfinished Tank Game →',exact:true}).click();await expect(p.locator('.source-only')).toBeVisible();
});
