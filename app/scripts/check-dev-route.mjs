import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
const server=await createServer({configFile:new URL('../../config/vite.config.js',import.meta.url).pathname,server:{host:'127.0.0.1',port:0}});
let browser;
try{
 await server.listen();
 browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(`${server.resolvedUrls.local[0]}#/program/castles`);
 await page.getByRole('link',{name:'Play Castles'}).waitFor();
 assert(!page.url().includes('experiences/'),'Normal dev navigation should use editable source.');
 await page.getByRole('link',{name:'Build from scratch',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent.includes('TypeScript · Building'));
 assert.deepEqual(errors,[]);
 console.log('Normal Vite dev route reaches the editable Castles start page and running player.');
}finally{await browser?.close();await server.close();}
