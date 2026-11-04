import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {REMAINING_IDS,MORE_COUNT} from './helpers/catalog.js';
for(const id of REMAINING_IDS){
 const meta=JSON.parse(fs.readFileSync(new URL(`../../../programs/${id}/program.json`,import.meta.url)));
 test(`${id}: frozen archive opens with credit and downloadable originals`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`/${id}/v1/?test`);
  await expect(page.locator('h1')).toContainText(meta.title);await expect(page.locator('.program-attribution')).toContainText(meta.attribution.text);
  if(meta.model==='MODEL100'){
   await expect(page.locator('#display iframe')).toHaveCount(1);
   await page.locator('.source-details > summary').click();
  }
  else await expect(page.locator('#display canvas')).toHaveCount(meta.sourceOnly?0:1);
  const source=page.getByRole('link',{name:'Download recovered listing',exact:true});expect((await page.request.get(await source.getAttribute('href'))).ok()).toBe(true);
  const raw=page.getByRole('link',{name:'Download original payload',exact:true});expect((await page.request.get(await raw.getAttribute('href'))).ok()).toBe(true);
  expect(new URL(page.url()).hash).toBe('');expect(errors).toEqual([]);
 });
}
test('More preserves its existing order, appends restored/archive entries, and searches',async({page})=>{
 await page.goto('/#/more');await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
 const titles=await page.locator('.program-card h2').allTextContents();expect(titles.filter(title=>title!=='Sound & Tones').slice(29,36)).toEqual(['Who Donnt?','Dungeon Trainer','TUTAC Computer','Unfinished Tank Game','Lunar Lander','Poker','Space Colony']);
 await page.getByRole('searchbox',{name:'Find a program'}).fill('BOND');await expect(page.locator('.program-card:visible')).toHaveCount(1);await page.locator('.program-card:visible .card-link').click();await expect(page.locator('.source-only')).toContainText('BOND');
 await page.setViewportSize({width:390,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('New archive player controls and alternate source pages work in the editable site',async({page})=>{
 await page.goto('/?development=1&test#/program/bunny');await expect(page.locator('#display canvas')).toHaveCount(1);
 await page.getByRole('button',{name:'Help',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close help'}).click();
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.getByRole('button',{name:'Resume',exact:true})).toBeVisible();await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.getByRole('combobox',{name:'Emulator speed'}).selectOption('20');await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(page.locator('#display canvas')).toHaveCount(1);
 await page.locator('.versions summary').click();await page.locator('.versions a').first().click();await expect(page.locator('.source-only')).toBeVisible();await expect(page.locator('.program-attribution')).toBeVisible();
});
