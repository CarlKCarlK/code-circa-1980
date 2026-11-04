import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c))).join('\n');
});
// Watches the wire box (screen row 9) in the page until the first prompt; returns each color shown.
const watchWires=page=>page.evaluate(()=>new Promise((resolve,reject)=>{
 const row=r=>String.fromCharCode(...window.__circaPlayer.snapshot().slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c));
 const words=[];let last='',since=performance.now();const start=since;
 const timer=setInterval(()=>{
  const now=performance.now(),word=row(9).trim();
  if(word!==last){last=word;since=now;}else if(word&&now-since>200&&words.at(-1)!==word)words.push(word);
  if(/FIRST WIRE\?/.test(row(0))){clearInterval(timer);resolve(words);}
  if(now-start>40000){clearInterval(timer);reject(new Error(`Saw ${words}`));}
 },20);
}));
// Bomb reads answers with INKEY$, so keys are held as a typist would.
const tap=async(page,key)=>{await page.keyboard.down(key);await page.waitForTimeout(120);await page.keyboard.up(key);await page.waitForTimeout(100);};
const type=async(page,text)=>{for(const k of text)await tap(page,k);await tap(page,'Enter');};
const prompts=[/FIRST WIRE\? *_? *$/m,/SECOND WIRE\? *_? *$/m,/THIRD WIRE\? *_? *$/m,/FOURTH WIRE\? *_? *$/m,/CUT NOW\? *_? *$/m];

test('collection and program links open the Bomb player directly; v01 is source only',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'Bomb'});
 await expect(card).toContainText('06 / Game');
 await expect(card.getByRole('link',{name:'Play Bomb →'})).toHaveAttribute('href',/#\/program\/bomb\/basic\/play$/);
 await page.goto('/?development=1#/program/bomb');
 await expect(page).toHaveURL(/#\/program\/bomb\/basic\/play$/);
 await expect(page.locator('.implementations')).toHaveCount(0);
 await expect(page.locator('#display')).toBeVisible();
 await expect(page.getByRole('link',{name:'Download original payload'})).toHaveAttribute('href',/BOMB.*\.BAS$/);
 await expect(page.locator('.source-details .program-history')).toContainText('learned to spell AZURE');
 await expect(page.locator('.source-details .program-history')).toContainText('Rich and I thought that was very funny');
 await expect(page.locator('.source-details .program-history')).toContainText('Rich Losey');
 await page.getByRole('button',{name:'Help'}).click();
 await expect(page.locator('.player-help')).toContainText('There is no fixing a typo');
 await expect(page.locator('.player-help')).toContainText('TURQUOISE');
 await page.getByRole('button',{name:'Close help'}).click();
 await page.goto('/?development=1#/program/bomb/v01');
 await expect(page.locator('.source-only')).toContainText('Source only');
 await expect(page.getByRole('link',{name:'Play the playable version →'})).toHaveAttribute('href','#/program/bomb/basic/play');
 await expect(page.locator('#display')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('Bomb runs: start from the title, defuse a bomb by typing its wires, retire, pause and restart',async({page})=>{
 test.setTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // The shared list is faked here; tests/bomb-scores.test.mjs covers the Worker itself.
 const posted=[];let world=[{initials:'RL',score:99,posthumous:false,date:'2026-11-01'}];
 await page.route('**/scores',route=>{
  const request=route.request(),headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};
  if(request.method()==='OPTIONS')return route.fulfill({status:204,headers});
  if(request.method()==='POST'){const entry=request.postDataJSON();posted.push(entry);world=[...world,{...entry,date:'2026-11-04'}];}
  return route.fulfill({status:request.method()==='POST'?201:200,headers,contentType:'application/json',body:JSON.stringify({scores:world})});
 });
 await page.goto('/?development=1&test#/program/bomb/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect(page.locator('.world-scores')).toContainText('RL');
 await expect(page.locator('.local-scores')).toContainText('None yet.');
 await page.locator('#display').click();
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('TO PLAY DEPOSIT $.25 IN BOX');
 await tap(page,' ');
 await expect.poll(()=>screenText(page),{timeout:5000}).toContain('NEFARIOUS NICK');
 await page.getByRole('button',{name:'Game key Enter'}).click();
 await expect.poll(()=>screenText(page),{timeout:5000}).toContain('THE BOMB IS TICKING');
 await page.locator('#display').focus();
 await tap(page,'Enter');
 const words=await watchWires(page);
 expect(words.length).toBeGreaterThanOrEqual(3);
 expect(words.length).toBeLessThanOrEqual(5);
 for(let i=0;i<words.length;i++){
  await expect.poll(()=>screenText(page),{timeout:20000}).toMatch(prompts[i]);
  await page.waitForTimeout(300);
  await type(page,words[i]);
 }
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('DO YOU WANT TO RETIRE?');
 expect(await screenText(page)).toMatch(new RegExp(`SO FAR YOU HAVE CUT ${words.length} +WIRES`));
 await page.getByRole('button',{name:'Type YES and Enter'}).click();
 await expect(page.locator('#display')).toBeFocused();
 await expect.poll(()=>screenText(page),{timeout:5000}).toContain('WHAT ARE YOUR INITIALS?');
 await type(page,'CMK');
 await expect.poll(()=>screenText(page),{timeout:5000}).toContain('C M K');
 await expect(page.locator('.local-scores li')).toHaveText(new RegExp(`CMK\\s*${words.length}`));
 await expect(page.locator('.world-scores')).toContainText('CMK');
 await page.waitForTimeout(2500); // The rankings stay up; the score must post only once.
 expect(posted).toEqual([{initials:'CMK',score:words.length,posthumous:false}]);
 await page.getByRole('button',{name:'Pause'}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume'}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Restart'}).click();
 await expect.poll(()=>screenText(page),{timeout:10000}).not.toContain('C M K');
 await expect(page.locator('.local-scores li')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('.local-scores li')).toHaveText(new RegExp(`CMK\\s*${words.length}`));
 expect(posted).toHaveLength(1);
 expect(errors).toEqual([]);
});

test('Bomb still plays when the shared scores are unavailable',async({page})=>{
 await page.route('**/scores',route=>route.abort());
 await page.goto('/?development=1&test#/program/bomb/basic/play');
 await expect(page.locator('.world-scores')).toContainText('unavailable');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
});
