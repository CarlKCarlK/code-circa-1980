import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const releases=JSON.parse(fs.readFileSync(new URL('../../../programs/castles/web-versions.json',import.meta.url),'utf8')).versions;
const latest=releases.at(-1).id;

test('the collection opens the newest frozen experience straight into play',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 await page.getByRole('link',{name:'Play Castles →'}).click();
 await expect(page).toHaveURL(new RegExp(`/experiences/castles/${latest}/#/program/castles/typescript/play/castle$`));
 await expect(page.locator('#status')).toContainText('Building');
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.locator('#status')).toHaveText('Paused');
 if(!await page.getByRole('navigation',{name:'Web experience'}).isVisible())await page.locator('.source-details > summary').click();
 await expect(page.getByRole('navigation',{name:'Web experience'})).toContainText(`Web experience ${latest}`);
 expect(errors).toEqual([]);
});

test('home page version dropdown opens the chosen frozen release',async({page})=>{
 test.skip(releases.length<2,'The dropdown appears only when there is more than one release.');
 await page.goto('/');
 const picker=page.getByLabel('Versions');
 await expect(picker).toHaveValue(new RegExp(`/experiences/castles/${latest}/#/program/castles/typescript/play/castle$`));
 await expect(picker.locator('option')).toHaveCount(releases.length);
 await picker.selectOption({label:'v1'});
 await expect(page).toHaveURL(/\/experiences\/castles\/v1\/#\/program\/castles\/typescript\/play\/castle$/);
 await expect(page.locator('canvas')).toHaveCount(1);
});

test('previously shared play links resolve to the latest frozen release',async({page})=>{
 await page.goto('/?test#/program/castles/typescript/play');
 await expect(page).toHaveURL(new RegExp(`/experiences/castles/${latest}/[?]test#/program/castles/typescript/play$`));
 await expect(page.locator('#status')).toContainText('Building');
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().phase)).toBe('building');
});
