import {test,expect} from '@playwright/test';
test.beforeEach(({page})=>{page.on('dialog',dialog=>dialog.accept());});
const screen=page=>page.evaluate(()=>window.__circaPlayer?String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c>=128?32:c)):'');
const boot=async(page,id)=>{await page.goto(`/?development=1&test#/program/${id}`);await expect(page.locator('#status')).toContainText('Running original BASIC');};
const answer=async(page,value)=>{await expect(page.getByRole('textbox',{name:'Answer for the original program'})).toBeEnabled();await page.getByRole('textbox',{name:'Answer for the original program'}).fill(value);await page.getByRole('button',{name:'Send + Enter'}).click();await expect(page.getByRole('textbox',{name:'Answer for the original program'})).toBeEnabled();};
const tap=async(page,key)=>{await page.locator('#display').focus();await page.keyboard.down(key);await page.waitForTimeout(120);await page.keyboard.up(key);};
const capture=async(page,id)=>{if(process.env.CAPTURE_GALLERY_ART)await page.locator('#display canvas').screenshot({path:`../app/assets/${id}-screen.png`});};
const noBasicError=async page=>expect(await screen(page)).not.toMatch(/\?(?:SN|FC|OM|UL|DD|BS|OV|TM|NF|RG) ERROR/i);
async function pauseRestart(page,prompt){
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const state=await page.evaluate(()=>window.__circaPlayer.diagnostics());await page.waitForTimeout(200);
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(state.tStates);
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 await page.getByRole('button',{name:'Restart',exact:true}).click();
 if(prompt)await expect.poll(()=>screen(page),{timeout:30000}).toContain(prompt);
}

test('Ricky Rat draws a maze and runs its rats without manual steering',async({page})=>{
 test.setTimeout(90000);await boot(page,'rickyrat');
 await expect.poll(()=>screen(page),{timeout:40000}).toContain('RICKY RAT');
 const image=await page.evaluate(()=>window.__circaPlayer.snapshot());expect(image.filter(c=>c>=128&&c<192).length).toBeGreaterThan(10);
 await noBasicError(page);
 await capture(page,'rickyrat');
 await page.keyboard.down('1');await page.getByRole('button',{name:'Pause',exact:true}).focus();
 expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().held)).toEqual([]);await page.keyboard.up('1');
 await page.getByRole('button',{name:'Help',exact:true}).click();await expect(page.locator('.player-help')).toContainText('automatically');
 await page.getByRole('button',{name:'Close help'}).click();
 await pauseRestart(page);
 await expect.poll(()=>screen(page),{timeout:40000}).toContain('RICKY RAT');
});

test('Pinball launches, responds to Space, pauses and restarts',async({page})=>{
 test.setTimeout(90000);await boot(page,'pinball');
 await expect.poll(()=>screen(page),{timeout:30000}).toContain('PINBALL');
 await expect.poll(()=>screen(page),{timeout:30000}).toContain('hhhhhhh');
 await page.waitForTimeout(250);
 await tap(page,'Enter');
 await page.keyboard.down(' ');
 await expect.poll(()=>screen(page),{timeout:10000}).toContain('==========');
 await capture(page,'pinball');
 await page.keyboard.up(' ');await noBasicError(page);
 await pauseRestart(page,'PINBALL');
});

test('logic simulator creates a switch and light, wires them, and evaluates both states',async({page})=>{
 test.setTimeout(120000);await boot(page,'logic');
 await expect.poll(()=>screen(page),{timeout:15000}).toContain('WHAT IS YOUR WISH');
 await answer(page,'H');await expect.poll(()=>screen(page)).toContain('--HELP--');
 await answer(page,'C');await expect.poll(()=>screen(page)).toContain('WHAT DO YOU WISH TO CREATE');
 await answer(page,'SWITCH');await expect.poll(()=>screen(page)).toMatch(/THIS SWITCH IS DEVICE #\s*1/);
 await answer(page,'C');await page.waitForTimeout(300);await answer(page,'LIGHT');
 await expect.poll(()=>screen(page)).toMatch(/THIS LIGHT IS DEVICE #\s*2/);
 await answer(page,'W');await expect.poll(()=>screen(page)).toContain('#DEVICEA');
 await answer(page,'1,1,2,1');await page.waitForTimeout(300);
 await answer(page,'S');await expect.poll(()=>screen(page)).toContain('SETTING SWITCHS');
 await answer(page,'1,Y');await expect.poll(()=>screen(page)).toContain('THE SWITCH IS YES');
 await answer(page,'G');await expect.poll(()=>screen(page),{timeout:15000}).toContain('DONE');
 await expect.poll(()=>screen(page)).toMatch(/LIGHT\s+1\s+I\s+YES/);
 await capture(page,'logic');
 await answer(page,'S');await page.waitForTimeout(300);await answer(page,'1,N');await page.waitForTimeout(300);await answer(page,'G');
 await expect.poll(()=>screen(page)).toMatch(/LIGHT\s+1\s+I\s+NO/);
 await noBasicError(page);await pauseRestart(page,'WHAT IS YOUR WISH');
});

test('orbit simulator accepts the original custom example and draws an evolving trail',async({page})=>{
 test.setTimeout(90000);await boot(page,'orbit');
 await expect.poll(()=>screen(page),{timeout:15000}).toContain('EXPAND SCREEN OPTION');
 await page.getByRole('button',{name:'Run Sun/planet example',exact:true}).click();
 await expect.poll(()=>screen(page),{timeout:10000}).toContain('PUT IN YOU OWN SITUATION');
 await page.getByRole('button',{name:'Restart',exact:true}).click();
 await expect.poll(()=>screen(page)).not.toContain('PUT IN YOU OWN SITUATION');
 await expect.poll(()=>screen(page),{timeout:15000}).toContain('EXPAND SCREEN OPTION');
 await expect(page.getByRole('button',{name:'Run Sun/planet example',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Run Sun/planet example',exact:true}).click();
 await expect.poll(()=>screen(page),{timeout:30000}).toContain('VELOCITY=');
 await noBasicError(page);
 const before=await page.evaluate(()=>window.__circaPlayer.snapshot());await page.waitForTimeout(3000);
 const after=await page.evaluate(()=>window.__circaPlayer.snapshot());expect(after).not.toEqual(before);
 const pixels=bytes=>bytes.slice(0,960).reduce((sum,c)=>sum+(c>=128&&c<192?(c&63).toString(2).replaceAll('0','').length:0),0);
 await expect.poll(async()=>pixels(await page.evaluate(()=>window.__circaPlayer.snapshot())),{timeout:15000}).toBeGreaterThan(pixels(before));
 if(process.env.CAPTURE_GALLERY_ART)await page.waitForTimeout(15000);
 await capture(page,'orbit');
 await page.getByRole('button',{name:'Help',exact:true}).click();await expect(page.locator('.player-help')).toContainText('missing line 2500');
 await page.getByRole('button',{name:'Close help'}).click();
 await pauseRestart(page,'EXPAND SCREEN OPTION');
});

for(const [id,title] of [['rickyrat','Ricky Rat'],['pinball','Pinball'],['logic','Logic circuit simulator'],['orbit','Orbit simulator']])test(`${id}: one frozen v1 player opens directly and returns to the extra gallery`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/${id}/v1/?test`);
 await expect(page.locator('#display canvas')).toHaveCount(1);
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect(page.locator('.player-header h1')).toHaveText(title);
 expect(new URL(page.url()).pathname).toBe(`/${id}/v1/`);expect(new URL(page.url()).hash).toBe('');
 await expect(page.locator('.version-picker,.web-version-nav')).toHaveCount(0);
 const raw=await page.getByRole('link',{name:'Download original payload',exact:true}).getAttribute('href');
 const response=await page.request.get(raw);expect(response.ok()).toBe(true);
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();
 await expect(page.locator('.program-card')).toHaveCount(7);
 await expect(page.locator('.version-picker')).toHaveCount(0);
 expect(errors).toEqual([]);
});
