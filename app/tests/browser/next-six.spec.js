import {test,expect} from '@playwright/test';
const screen=page=>page.evaluate(()=>String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c>=128?32:c)));
const snapshot=page=>page.evaluate(()=>window.__circaPlayer.snapshot());
const graphics=async page=>(await snapshot(page)).filter(c=>c>128&&c<192).length;
const boot=async(page,id)=>{page.on('dialog',d=>d.accept());await page.goto(`/?development=1&test#/program/${id}`);await expect(page.locator('#status')).toContainText(id==='learningttt'?'Running adapted BASIC':'Running original BASIC');};
const answer=async(page,prompt,value)=>{await expect.poll(()=>screen(page),{timeout:20000}).toContain(prompt);const field=page.getByRole('textbox',{name:'Answer for the original program'});await expect(field).toBeEnabled();await field.fill(value);await page.getByRole('button',{name:'Send + Enter'}).click();await expect(field).toBeEnabled();};
const noError=async page=>expect(await screen(page)).not.toMatch(/\?(?:SN|FC|OM|UL|DD|BS|OV|TM|NF|RG|OD|L3) ERROR|ERROR IN LINE/i);
const pauseRestart=async(page,prompt)=>{await page.getByRole('button',{name:'Pause',exact:true}).click();const t=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(200);expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(t);await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Restart',exact:true}).click();if(prompt)await expect.poll(()=>screen(page),{timeout:15000}).toContain(prompt);};
const capture=async(page,id)=>{await page.locator('#display canvas').screenshot({path:`test-results/next-six-${id}.png`});};
test('Worm One accepts its rule and starting coordinates and draws a path',async({page})=>{
 test.setTimeout(60000);await boot(page,'worm');await answer(page,'WHICH PATTERN','1B 2D 3CCCC 4B');await answer(page,'STARTING LOCATION','64,24');await expect.poll(()=>graphics(page),{timeout:20000}).toBeGreaterThan(2);await capture(page,'worm');await noError(page);await pauseRestart(page,'WHICH PATTERN');
});
test('Peoria Grand Prix starts a race, accepts steering, pauses and restarts',async({page})=>{
 test.setTimeout(70000);await boot(page,'peoria');await answer(page,'SKILL LEVEL','1');await answer(page,'DRIVERS','1');await expect.poll(()=>graphics(page),{timeout:25000}).toBeGreaterThan(50);const before=await snapshot(page);await page.locator('#display').focus();await page.keyboard.down('ArrowRight');await page.waitForTimeout(350);await page.keyboard.up('ArrowRight');await expect.poll(()=>snapshot(page)).not.toEqual(before);await capture(page,'peoria');await noError(page);await pauseRestart(page,'SKILL LEVEL');
});
test('Pendulum swings and reports its measured period and frequency',async({page})=>{
 test.setTimeout(80000);await boot(page,'pendulum');await answer(page,'HOW MANY TIMES','2');await answer(page,'WHERE IS','EARTH');await answer(page,'HOW LONG','1');await expect.poll(()=>graphics(page),{timeout:15000}).toBeGreaterThan(0);await expect.poll(()=>screen(page),{timeout:45000}).toContain('TIME/PERIOD');await expect.poll(()=>screen(page)).toContain('FREQUENCY');await capture(page,'pendulum');await noError(page);await pauseRestart(page,'HOW MANY TIMES');
});
test('Sentence Generator produces words automatically and restarts',async({page})=>{
 test.setTimeout(60000);await boot(page,'sentences');await expect.poll(()=>screen(page),{timeout:15000}).toMatch(/CARL|MARK|JIM|CATHY|LIZ|RICH|RACHEL|BILL|DOUG|DALE|SANDWICH|GRASS|QUAD/);await page.waitForTimeout(1600);await capture(page,'sentences');await noError(page);await pauseRestart(page);await expect.poll(()=>screen(page)).toMatch(/[A-Z]{3}/);
});
test('Learning Tic-Tac-Toe accepts a move, responds, and retains its experimental feedback flow',async({page})=>{
 test.setTimeout(70000);await boot(page,'learningttt');await answer(page,'DO YOU WISH','YES');await answer(page,'YOUR MOVE','1,1,');await expect.poll(()=>screen(page),{timeout:30000}).toContain('***');await noError(page);await capture(page,'learningttt');await answer(page,'YOUR MOVE','0,0,C');await expect.poll(()=>screen(page),{timeout:20000}).toContain('DO YOU WISH');await pauseRestart(page,'DO YOU WISH');
});
test('Superpower Investing calculates its historical sample and prints final profit',async({page})=>{
 test.setTimeout(70000);await boot(page,'spi');await expect.poll(()=>screen(page),{timeout:40000}).toContain('REAL PROFIT');await expect.poll(()=>screen(page)).toContain('READY');await capture(page,'spi');await noError(page);await expect(page.locator('.source-details')).toContainText('my first professional program');await expect(page.locator('.source-details')).toContainText('my dad');await pauseRestart(page);await expect.poll(()=>screen(page),{timeout:40000}).toContain('REAL PROFIT');
});

test('More contains twenty-seven readable cards and all six new direct player links',async({page})=>{
 await page.goto('/#/more');await expect(page.locator('.program-card')).toHaveCount(29);
 expect(await page.locator('.program-card img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0))).toBe(true);
 for(const title of ['Worm One','Peoria Grand Prix','Pendulum','Sentence Generator','Learning Tic-Tac-Toe','Superpower Investing'])await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(1);
 for(const width of [1280,390]){await page.setViewportSize({width,height:960});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByRole('link',{name:'Play Pendulum →'}).click();await expect(page.locator('#display canvas')).toHaveCount(1);await expect(page.locator('.instructions-start')).toHaveCount(0);await expect(page.locator('.player-help')).toBeHidden();
});
for(const id of ['worm','peoria','pendulum','sentences','learningttt','spi'])test(`${id}: frozen web v1 starts directly with source downloads and returns to More`,async({page})=>{
 test.setTimeout(60000);await page.goto(`/${id}/v1/?test`);await expect(page.locator('#display canvas')).toHaveCount(1);expect(new URL(page.url()).hash).toBe('');await expect(page.locator('#status')).toContainText(id==='learningttt'?'Running adapted BASIC':'Running original BASIC');
 const prompt={worm:'WHICH PATTERN',peoria:'SKILL LEVEL',pendulum:'HOW MANY TIMES',sentences:'',learningttt:'DO YOU WISH',spi:'REAL PROFIT'}[id];if(prompt)await expect.poll(()=>screen(page),{timeout:40000}).toContain(prompt);
 const link=page.getByRole('link',{name:id==='learningttt'?'Download BASIC payload':'Download original payload',exact:true});expect((await page.request.get(await link.getAttribute('href'))).ok()).toBe(true);await noError(page);
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();await expect(page.locator('.program-card')).toHaveCount(29);
});

for(const release of [false,true])test(`Worm One ${release?'web v1':'development'}: article links and optional 20× pacing preserve pause and restart`,async({page})=>{
 test.setTimeout(60000);page.on('dialog',d=>d.accept());await page.goto(release?'/worm/v1/?test':'/?development=1&test#/program/worm');await expect(page.locator('#status')).toContainText('Running original BASIC');
 const speed=page.getByRole('combobox',{name:'Worm One speed'});await expect(speed).toHaveValue('1');
 const source=page.locator('.source-details');await expect(source.getByRole('link',{name:/Fantastic patterns/})).toHaveAttribute('href','https://www.scientificamerican.com/article/mathematical-games-1973-11/');await expect(source.getByRole('link',{name:/Michael Beeler/})).toHaveAttribute('href','https://dspace.mit.edu/handle/1721.1/6210');
 await answer(page,'WHICH PATTERN','1A 2A 3AAAA 4A');await answer(page,'STARTING LOCATION','64,24');await expect.poll(()=>graphics(page),{timeout:20000}).toBeGreaterThan(0);
 const measure=async()=>{const start=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(600);return (await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates))-start;};
 const original=await measure();await speed.selectOption('20');await expect(speed).toHaveValue('20');const fast=await measure();expect(fast).toBeGreaterThan(original*3);expect(await screen(page)).toContain('2A 3AAAA 4A');
 await page.getByRole('button',{name:'Pause',exact:true}).click();const stopped=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(300);expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(stopped);await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.getByRole('button',{name:'Help',exact:true}).click();await expect(page.locator('#status')).toHaveText('Paused');await expect(page.locator('.player-help').getByRole('link',{name:/Fantastic patterns/})).toBeVisible();await page.getByRole('button',{name:'Close help'}).click();await expect(page.locator('#status')).toContainText('Running');
 await page.getByRole('button',{name:'Restart',exact:true}).click();await expect(speed).toHaveValue('20');await expect.poll(()=>screen(page),{timeout:15000}).toContain('WHICH PATTERN');await speed.selectOption('1');await expect(speed).toHaveValue('1');await noError(page);
});
