import {test,expect} from '@playwright/test';
const ids=['trigectior','relativity','reflex','nuclear','johnscircle'];
const screen=page=>page.evaluate(()=>String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c>=128?32:c)));
const compact=async page=>(await screen(page)).replace(/\s/g,'');
const snapshot=page=>page.evaluate(()=>window.__circaPlayer.snapshot());
const graphics=async page=>(await snapshot(page)).filter(c=>c>128&&c<192).length;
const boot=async(page,id)=>{page.on('dialog',d=>d.accept());await page.goto(`/?development=1&test#/program/${id}`);await expect(page.locator('#status')).toContainText('Running original BASIC');};
const answer=async(page,prompt,value)=>{await expect.poll(()=>compact(page),{timeout:20000}).toContain(prompt.replace(/\s/g,''));const field=page.getByRole('textbox',{name:'Answer for the original program'});await expect(field).toBeEnabled();await field.fill(value);await page.getByRole('button',{name:'Send + Enter'}).click();await expect(field).toBeEnabled();};
const tap=async(page,key)=>{await page.locator('#display').focus();await page.keyboard.down(key);await page.waitForTimeout(100);await page.keyboard.up(key);};
const noError=async page=>expect(await screen(page)).not.toMatch(/\?(?:SN|FC|OM|UL|DD|BS|OV|TM|NF|RG|OD|L3) ERROR/i);
const restart=async(page,prompt)=>{await page.getByRole('button',{name:'Pause',exact:true}).click();const t=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(150);expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(t);await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Restart',exact:true}).click();await expect.poll(()=>screen(page),{timeout:15000}).toContain(prompt);};
const capture=async(page,id)=>page.locator('#display canvas').screenshot({path:`test-results/science-five-${id}.png`});
test('Trajectory plots a trajectory and prints its flight summary',async({page})=>{
 test.setTimeout(70000);await boot(page,'trigectior');await answer(page,'SPEED','20');await answer(page,'ANGLE','45');await answer(page,'METERS HIGH','40');await expect.poll(()=>screen(page),{timeout:25000}).toContain('<DONE>');expect(await graphics(page)).toBeGreaterThan(12);await tap(page,'Enter');await expect.poll(()=>screen(page)).toContain('CONTACT WITH GROUND');await expect.poll(()=>screen(page)).toContain('THE RANGE WAS');await capture(page,'trigectior');await noError(page);await restart(page,'SPEED');
});
test('Relativity runs its rod, graph, and clock options',async({page})=>{
 test.setTimeout(90000);await boot(page,'relativity');await expect(page.getByRole('combobox',{name:'Relativity speed'})).toHaveValue('1');await expect.poll(()=>screen(page)).toContain('PRESS ENTER');await tap(page,'Enter');await answer(page,'WHAT OPTION','1');await answer(page,'HOW LONG','40');await answer(page,'PER CENT','80');await expect.poll(()=>screen(page)).toContain('MOVING ROD');expect(await graphics(page)).toBeGreaterThan(3);await tap(page,'Enter');await page.getByRole('combobox',{name:'Relativity speed'}).selectOption('20');await answer(page,'WHAT OPTION','2');await expect.poll(()=>screen(page),{timeout:30000}).toMatch(/100\s*%/);await tap(page,'Enter');await page.getByRole('combobox',{name:'Relativity speed'}).selectOption('1');await answer(page,'WHAT OPTION','3');await answer(page,'PERCENTAGE','80');await expect.poll(()=>screen(page)).toContain("SHIP'S TIME");const before=await snapshot(page);await page.waitForTimeout(600);expect(await snapshot(page)).not.toEqual(before);await capture(page,'relativity');await noError(page);await page.getByRole('combobox',{name:'Relativity speed'}).selectOption('20');await restart(page,'PRESS ENTER');await expect(page.getByRole('combobox',{name:'Relativity speed'})).toHaveValue('20');
});
test('Reflex Tests accepts a Space reaction and returns to its menu',async({page})=>{
 test.setTimeout(100000);await boot(page,'reflex');await answer(page,'WHAT IS YOUR PLEASURE','1');
 const reaction=page.waitForFunction(()=>String.fromCharCode(...window.__circaPlayer.snapshot()).replace(/\s/g,'').includes('GO!'),null,{polling:10,timeout:70000}).then(()=>tap(page,' '));
 await answer(page,'PRESS ENTER WHEN READY','');await reaction;await expect.poll(()=>compact(page)).toContain('YOURTIMEWAS');await capture(page,'reflex');await noError(page);await answer(page,'GET CATALOGUE','');await expect.poll(()=>compact(page)).toContain('WHATISYOURPLEASURE');await restart(page,'WHAT IS YOUR PLEASURE');
});
test('Reflex Tests timer and gunfight accept their original inputs',async({page})=>{
 test.setTimeout(70000);await boot(page,'reflex');await answer(page,'WHAT IS YOUR PLEASURE','2');await answer(page,'GET THE TIME','');await expect.poll(()=>screen(page),{timeout:20000}).toContain('DONE, NOW');await answer(page,'TO START','');await tap(page,' ');await expect.poll(()=>screen(page)).toContain('YOUR TIME WAS');await noError(page);await restart(page,'WHAT IS YOUR PLEASURE');await answer(page,'WHAT IS YOUR PLEASURE','3');await answer(page,'TO FIGHT','');await tap(page,'d');await expect.poll(()=>screen(page),{timeout:20000}).toContain('TRY AGAIN COWBOY');await noError(page);
});
test('Nuclear Equation Completer handles syntax help and missing helium',async({page})=>{
 test.setTimeout(70000);await boot(page,'nuclear');await answer(page,'TYPE PROBLEM','H!');await expect.poll(()=>screen(page)).toContain('SPECIAL SYSMBLES');await answer(page,'TYPE PROBLEM','U238=TH234+');await expect.poll(()=>screen(page)).toMatch(/2\s*:\s*HE\s*:\s*4/);await capture(page,'nuclear');await noError(page);await expect(page.getByRole('link',{name:'Damaged save: verified prefix listing',exact:true})).toBeVisible();await restart(page,'TYPE PROBLEM');
});
test('John’s Circle draws a circle and a second ellipse',async({page})=>{
 test.setTimeout(70000);await boot(page,'johnscircle');await answer(page,'?','40,20');await expect.poll(()=>graphics(page),{timeout:15000}).toBeGreaterThan(20);await page.waitForTimeout(2500);const before=await snapshot(page);await tap(page,'Enter');await answer(page,'?','50,10');await page.waitForTimeout(2500);expect(await snapshot(page)).not.toEqual(before);await capture(page,'johnscircle');await noError(page);await restart(page,'?');
});

test('More has twenty-three cards with readable artwork and direct new player links',async({page})=>{
 await page.goto('/#/more');await expect(page.locator('.program-card')).toHaveCount(23);
 for(const title of ['Trajectory','Relativity','Reflex Tests','Nuclear Equation Completer','John’s Circle'])await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(1);
 expect(await page.locator('.program-card img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 for(const width of [1280,390]){await page.setViewportSize({width,height:960});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByRole('link',{name:'Play John’s Circle →'}).click();await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('.player-help')).toBeHidden();await expect(page.locator('.instructions-start')).toHaveCount(0);
});
for(const id of ids)test(`${id}: frozen v1 starts directly, downloads its payload, and returns to More`,async({page})=>{
 test.setTimeout(60000);await page.goto(`/${id}/v1/?test`);await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('#status')).toContainText('Running original BASIC');expect(new URL(page.url()).hash).toBe('');if(id==='trigectior')await expect(page.locator('.player-header h1')).toHaveText('Trajectory');
 const prompt={trigectior:'SPEED',relativity:'PRESS ENTER',reflex:'WHAT IS YOUR PLEASURE',nuclear:'TYPE PROBLEM',johnscircle:'?'}[id];await expect.poll(()=>screen(page),{timeout:20000}).toContain(prompt);await noError(page);
 const link=page.getByRole('link',{name:'Download original payload',exact:true});expect((await page.request.get(await link.getAttribute('href'))).ok()).toBe(true);
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();await expect(page.locator('.program-card')).toHaveCount(23);
});
