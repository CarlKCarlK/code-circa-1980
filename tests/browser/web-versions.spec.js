import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const releases=JSON.parse(fs.readFileSync(new URL('../../programs/castles/web-versions.json',import.meta.url),'utf8')).versions;
const latest=releases.at(-1).id;

test('latest program links open the newest frozen experience and its version gallery',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 await page.getByRole('link',{name:/Instructions & play/}).click();
 await expect(page).toHaveURL(new RegExp(`/experiences/castles/${latest}/#/program/castles/typescript$`));
 if(!await page.getByRole('navigation',{name:'Web experience'}).isVisible())await page.locator('.source-details > summary').click();
 await expect(page.getByRole('navigation',{name:'Web experience'})).toContainText(`Web experience ${latest}`);
 await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('link',{name:'Play Castles'}).click();
 await expect(page.locator('#status')).toContainText('TypeScript · Building');
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.locator('#status')).toHaveText('Paused');
 if(!await page.getByRole('link',{name:'All web versions',exact:true}).isVisible())await page.locator('.source-details > summary').click();
 await page.getByRole('link',{name:'All web versions',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Castles versions',exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Web versions'})).toContainText(`${latest} · Latest`);
 await page.getByRole('link',{name:'Open v1',exact:true}).click();
 await expect(page).toHaveURL(/\/experiences\/castles\/v1\/$/);
 await expect(page.getByRole('navigation',{name:'Web experience'})).toContainText('Web experience v1');
 await expect(page.getByRole('link',{name:'Original · emulator',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Latest version',exact:true}).click();
 await expect(page).toHaveURL(new RegExp(`/experiences/castles/${latest}/#/program/castles$`));
 expect(errors).toEqual([]);
});

test('previously shared play links resolve to the latest frozen release',async({page})=>{
 await page.goto('/?test#/program/castles/typescript/play');
 await expect(page).toHaveURL(new RegExp(`/experiences/castles/${latest}/[?]test#/program/castles/typescript/play$`));
 await expect(page.locator('#status')).toContainText('TypeScript · Building');
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().phase)).toBe('building');
});
