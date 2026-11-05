import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const ids=['rickyrat','jaberwocky','cipher','worm','spi','aim','life','johnscircle','tutac','ll'];
for(const id of ids)for(const mode of ['development','release'])test(`${id} ${mode}: documented attribution sits below title and above original screen`,async({page:p})=>{
 const versionsPath=new URL(`../../../programs/${id}/web-versions.json`,import.meta.url);const latest=mode==='release'?JSON.parse(fs.readFileSync(versionsPath)).versions.at(-1).path:null;await p.goto(mode==='release'?`/${latest}?test`:`/?development=1&test#/program/${id}${id==='life'?'/basic':''}`);await expect(p.locator('#display canvas')).toHaveCount(1);const credit=p.locator('.program-attribution');await expect(credit).toBeVisible();const metadata=JSON.parse(fs.readFileSync(new URL(`../../../programs/${id}/program.json`,import.meta.url)));await expect(credit).toContainText(metadata.attribution.text);expect(await credit.evaluate(el=>el.previousElementSibling?.classList.contains('player-header')&&el.nextElementSibling?.classList.contains('player-workspace'))).toBe(true);
 const box=await credit.boundingBox(),display=await p.locator('#display').boundingBox();expect(box.y+box.height).toBeLessThanOrEqual(display.y);await p.setViewportSize({width:390,height:960});expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('JAB credits nothing for the maze generator its played version replaced',async({page:p})=>{
 await p.goto('/?development=1&test#/program/jab');await expect(p.locator('#display canvas')).toHaveCount(1);await expect(p.locator('.program-attribution')).toHaveCount(0);await expect(p.locator('body')).not.toContainText('Hauber');
});
test('JAB is first in More, starts fast, and expands its instructions above the field',async({page:p})=>{
 await p.goto('/?development=1#/more');await expect(p.locator('.program-card h2').first()).toHaveText('JAB — The Best of the Monster Games');
 await p.goto('/?development=1&test#/program/jab');await expect(p.locator('#display canvas')).toHaveCount(1);await expect(p.getByRole('combobox',{name:'Emulator speed'})).toHaveValue('20');await expect(p.getByRole('combobox',{name:'Emulator speed'}).locator('option:checked')).toHaveText('Auto');
 const text=p.getByText('six moves into the dark');await expect(text).toHaveCount(1);await expect(text).toBeHidden();await expect(p.locator('.instructions-above summary')).toContainText('Instructions: Explore a scrolling maze');await p.locator('.instructions-above summary').click();await expect(text).toBeVisible();for(const t of ['69 squares wide by 39 tall','About a 40%','Chaining:','Timing:','19×19'])await expect(p.locator('.instructions-above')).toContainText(new RegExp(t,'i'));
 expect((await p.locator('.instructions-above').boundingBox()).y).toBeLessThan((await p.locator('#display').boundingBox()).y);
});
test('source-only historical editions retain the same attribution above their source details',async({page:p})=>{
 await p.goto('/?development=1#/program/rickyrat/v01');await expect(p.locator('.source-only .program-attribution')).toContainText('Jack Hauber');await expect(p.locator('#display')).toHaveCount(0);
});
