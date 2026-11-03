import {test,expect} from '@playwright/test';
import fs from 'node:fs';
for(const id of ['poker','spacecolony'])test(`${id}: restored with visible attribution and preserved withdrawn snapshot`,async({page})=>{
 await page.goto(`/${id}/v1/?test`);await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('.program-attribution')).toBeVisible();
 const meta=JSON.parse(fs.readFileSync(new URL(`../../../programs/${id}/program.json`,import.meta.url)));await expect(page.locator('.program-attribution')).toContainText(meta.attribution.text);
 expect(fs.existsSync(new URL(`../../../programs/${id}/website-archive/v1/index.html`,import.meta.url))).toBe(true);
});
