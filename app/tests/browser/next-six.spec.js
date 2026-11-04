import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
test('More contains twenty-seven readable cards and all six new direct player links',async({page})=>{
 await page.goto('/#/more');await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
 expect(await page.locator('.program-card img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 for(const title of ['Worm One','Peoria Grand Prix','Pendulum','Sentence Generator','Learning Tic-Tac-Toe','Superpower Investing'])await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(1);
 for(const width of [1280,390]){await page.setViewportSize({width,height:960});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByRole('link',{name:'Play Pendulum →'}).click();await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('.instructions-start')).toHaveCount(0);await expect(page.locator('.player-help')).toBeHidden();
});
for(const id of ['worm','peoria','pendulum','sentences','learningttt','spi'])test(`${id}: frozen web v1 starts directly with source downloads and returns to More`,async({page})=>{
 test.setTimeout(60000);await page.goto(`/${id}/v1/?test`);await expect(page.locator('#display canvas')).toHaveCount(1);expect(new URL(page.url()).hash).toBe('');await expect(page.locator('#status')).toContainText(id==='learningttt'?'Running adapted BASIC':'Running original BASIC');
 const link=page.getByRole('link',{name:id==='learningttt'?'Download BASIC payload':'Download original payload',exact:true});expect((await page.request.get(await link.getAttribute('href'))).ok()).toBe(true);
 await page.locator('.player-header').getByRole('link',{name:'Gallery',exact:true}).click();await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
});

for(const release of [false,true])test(`Worm One ${release?'web v1':'development'}: article links and optional 20× pacing preserve pause and restart`,async({page})=>{
 test.setTimeout(60000);page.on('dialog',d=>d.accept());await page.goto(release?'/worm/v1/?test':'/?development=1&test#/program/worm');await expect(page.locator('#status')).toContainText('Running original BASIC');
 const speed=page.getByRole('combobox',{name:'Worm One speed'});await expect(speed).toHaveValue('1');
 const source=page.locator('.source-details');await expect(source.getByRole('link',{name:/Fantastic patterns/})).toHaveAttribute('href','https://www.scientificamerican.com/article/mathematical-games-1973-11/');await expect(source.getByRole('link',{name:/Michael Beeler/})).toHaveAttribute('href','https://dspace.mit.edu/handle/1721.1/6210');
 const measure=async()=>{const start=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(600);return (await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates))-start;};
 const original=await measure();await speed.selectOption('20');await expect(speed).toHaveValue('20');const fast=await measure();expect(fast).toBeGreaterThan(original*3);
 await page.getByRole('button',{name:'Pause',exact:true}).click();const stopped=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(300);expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(stopped);await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.getByRole('button',{name:'Help',exact:true}).click();await expect(page.locator('#status')).toHaveText('Paused');await expect(page.locator('.player-help').getByRole('link',{name:/Fantastic patterns/})).toBeVisible();await page.getByRole('button',{name:'Close help'}).click();await expect(page.locator('#status')).toContainText('Running');
 await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(speed).toHaveValue('20');await speed.selectOption('1');await expect(speed).toHaveValue('1');
});
