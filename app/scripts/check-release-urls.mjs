import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const base=new URL(process.argv[2]??'https://carlkcarlk.github.io/code-circa-1980/');
const ids=['castles','bal','alien','plot3d','chess','bomb'];
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
try{
 for(const id of ids){
  const {versions}=JSON.parse(await fs.readFile(new URL(`../../programs/${id}/web-versions.json`,import.meta.url),'utf8'));
  const release=versions.at(-1),url=new URL(release.path,base).href;
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto(url);
  assert.equal(response.status(),200,url);
  assert.equal(createHash('sha256').update(await response.body()).digest('hex'),release.files.find(file=>file.path==='index.html').sha256,`${id}: deployed entry point matches the frozen release`);
  await page.locator('#display').waitFor();
  await page.waitForFunction(()=>{
   const text=document.querySelector('#status')?.textContent;
   return text&&!text.includes('Loading')&&!text.includes('Unable to start');
  });
  assert.equal(page.url(),url,'Default play must retain the clean URL');
  assert.deepEqual(errors,[]);
  console.log(`Verified ${url}`);
  await page.close();
 }
 const page=await browser.newPage();await page.goto(base.href);
 for(const [index,id] of ids.entries()){
  const href=await page.locator('.program-card').nth(index).locator('.card-link').getAttribute('href');
  assert.match(href,new RegExp(`/${id}/v\\d+/$`));
 }
 console.log('Verified all collection play links.');
}finally{await browser.close();}
