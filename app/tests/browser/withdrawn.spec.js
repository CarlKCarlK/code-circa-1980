import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('Poker is withdrawn from both galleries, routes, and built pages',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/#/more');await expect(page.locator('.program-card')).toHaveCount(27);await expect(page.getByRole('heading',{name:'Poker',exact:true})).toHaveCount(0);await expect(page.locator('a[href*="poker"]')).toHaveCount(0);
 await page.goto('/');await expect(page.locator('.program-card')).toHaveCount(6);await expect(page.locator('a[href*="poker"]')).toHaveCount(0);
 await page.goto('/?development=1#/program/poker');await expect(page.getByRole('heading',{name:'Program not found'})).toBeVisible();await expect(page.locator('#display')).toHaveCount(0);
 expect(errors).toEqual([]);expect(fs.existsSync(new URL('../../../dist/poker/',import.meta.url))).toBe(false);expect(fs.existsSync(new URL('../../../public/poker/',import.meta.url))).toBe(false);
});
