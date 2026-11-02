import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const ids=['castles','bal','alien','plot3d','chess','bomb'];
const releases=id=>JSON.parse(fs.readFileSync(new URL(`../../../programs/${id}/web-versions.json`,import.meta.url),'utf8')).versions;
const latest=releases('castles').at(-1).id;

test('collection links point directly to clean, versioned releases',async({page})=>{
 await page.goto('/');
 for(const id of ids){
  const path=`/${id}/${releases(id).at(-1).id}/`;
  const card=page.locator('.program-card').nth(ids.indexOf(id));
  for(const link of await card.locator('a').all())await expect(link).toHaveAttribute('href',new RegExp(`${path}$`));
 }
 await page.getByRole('link',{name:'Play Castles →'}).click();
 await expect(page).toHaveURL(new RegExp(`/castles/${latest}/$`));
 await expect(page.locator('#status')).toContainText('Building');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
});

for(const id of ids)test(`${id}: immutable release opens its default player without changing the URL`,async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const path=`/${id}/${releases(id).at(-1).id}/`;
 await page.goto(path);
 await expect(page.locator('#display')).toBeVisible();
 await expect(page.locator('#status')).not.toContainText('Loading');
 await expect(page.locator('#status')).not.toContainText('Unable to start');
 await expect(page).toHaveURL(new RegExp(`${path}$`));
 if(id==='chess'){
  await expect(page.locator('.chess-board .sq')).toHaveCount(64);
  await page.locator('.sq[data-r="2"][data-c="4"]').click();
  await page.locator('.sq[data-r="4"][data-c="4"]').click();
  await expect(page.locator('.chess-moves')).toContainText('Nf6');
 }else if(id==='bal'){
  await page.getByRole('button',{name:'Balance',exact:true}).click();
  await expect(page.locator('.balanced')).toHaveText('C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O');
 }else if(id==='plot3d'){
  await page.getByRole('button',{name:'Instant',exact:true}).click();
  await page.getByRole('button',{name:'Draw',exact:true}).click();
  await expect(page.locator('#status')).toContainText('Done. The original takes about 84 s');
 }else if(id==='castles'){
  await page.getByRole('button',{name:'Fire cannons',exact:true}).click();
  await expect(page.getByRole('button',{name:'Return to building',exact:true})).toBeVisible();
 }else{
  await expect(page.locator('#status')).toContainText('Running');
  await page.goto(`${path}?test`);
  await expect(page.locator('#status')).toContainText('Running');
  if(id==='alien'){
   // Allow ROM startup and RUN's queued Enter to clear before sending a key.
   await page.locator('#display').click();
   await page.waitForTimeout(1500);
   await page.keyboard.down(' ');await page.waitForTimeout(120);await page.keyboard.up(' ');
  }
  await expect.poll(()=>page.evaluate(()=>window.__circaPlayer?String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c)):''),{timeout:15000}).toContain(id==='bomb'?'DEPOSIT':'DO YOU NEED BACKGROUND INFORMATION?');
 }
 await page.reload();
 await expect(page.locator('#display')).toBeVisible();
 expect(new URL(page.url()).hash).toBe('');
 expect(errors).toEqual([]);
});

test('existing BASIC and source tabs use query links, with history and separate sessions',async({page})=>{
 await page.goto(`/castles/${latest}/?test`);
 await expect(page.locator('#status')).toContainText('Building');
 const initial=await page.evaluate(()=>window.__circaPlayer.snapshot());
 await page.getByRole('link',{name:'Level II BASIC version'}).click();
 await expect(page).toHaveURL(/\?test=&lang=basic$/);
 await expect(page.locator('#status')).toContainText('Running');
 await page.goBack();
 await expect(page.locator('#status')).toContainText('Building');
 expect(await page.evaluate(()=>window.__circaPlayer.snapshot())).toEqual(initial);
 if(!await page.locator('.source-details').evaluate(el=>el.open))await page.locator('.source-details > summary').click();
 await page.locator('.versions > summary').click();
 await page.locator('.versions a').first().click();
 await expect(page).toHaveURL(/\?test=&source=v01$/);
 await expect(page.locator('.source-only')).toBeVisible();
 await page.getByRole('link',{name:'Play the playable version →'}).click();
 await expect(page).toHaveURL(/\?test=&lang=basic$/);
 await expect(page.locator('#status')).toContainText('Running');
});

test('previously shared collection links resolve to the clean latest release',async({page})=>{
 await page.goto('/#/program/castles/typescript/play/castle');
 await expect(page).toHaveURL(new RegExp(`/castles/${latest}/$`));
 await expect(page.locator('#status')).toContainText('Building');
 await page.goto('/?program=bomb');
 await expect(page).toHaveURL(new RegExp(`/bomb/${releases('bomb').at(-1).id}/$`));
 await expect(page.locator('#status')).toContainText('Running');
});

test('home page version dropdown opens the chosen frozen release',async({page})=>{
 test.skip(releases('castles').length<2,'The dropdown appears only when there is more than one release.');
 await page.goto('/');
 const picker=page.getByLabel('Versions').first();
 await expect(picker).toHaveValue(new RegExp(`/castles/${latest}/$`));
 await picker.selectOption({label:'v1'});
 await expect(page).toHaveURL(/\/castles\/v1\/$/);
 await expect(page.locator('canvas')).toHaveCount(1);
});

// GitHub Pages 301s /castles to /castles/ itself; the preview server does not, so check that form live with curl.
test('unversioned program URLs open the latest release',async({page})=>{
 for(const id of ids){
  await page.goto(`/${id}/`);
  await expect(page).toHaveURL(new RegExp(`/${id}/${releases(id).at(-1).id}/$`));
 }
 // The query carries over (BASIC is not Castles' default, so the release keeps it).
 await page.goto('/castles/?lang=basic');
 await expect(page).toHaveURL(new RegExp(`/castles/${latest}/\\?lang=basic$`));
});
