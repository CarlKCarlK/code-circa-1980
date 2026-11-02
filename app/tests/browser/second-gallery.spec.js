import {test,expect} from '@playwright/test';
const text=page=>page.evaluate(()=>window.__circaPlayer?String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c>=128?32:c)):'');
const tap=async(page,k)=>{await page.keyboard.down(k);await page.waitForTimeout(100);await page.keyboard.up(k);await page.waitForTimeout(100);};
const type=async(page,s)=>{for(const k of s)await tap(page,k);await tap(page,'Enter');};

test('second gallery is separate and unlinked; cards launch players directly',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.program-card')).toHaveCount(6);
 await expect(page.locator('a[href*="more"],a[href*="speech"],a[href*="olympics"],a[href*="xwing"]')).toHaveCount(0);
 await page.goto('/#/more');
 await expect(page.getByRole('heading',{level:1})).toContainText('the tapes.');
 await expect(page.locator('.program-card')).toHaveCount(3);
 await expect(page.locator('.program-card h2')).toHaveText(['Speech','Olympics','X-wing fighter']);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
 await page.getByRole('link',{name:'Play Speech →'}).click();
 await expect(page.locator('#display')).toBeVisible();
 await expect(page.locator('.player-header').getByRole('link',{name:'Collection',exact:true})).toHaveAttribute('href',/#\/more$/);
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();
 await expect(page.locator('.program-card')).toHaveCount(3);
});
for(const id of ['speech','olympics'])test(`${id}: original starts, accepts setup input, pauses and restarts`,async({page})=>{
 test.setTimeout(270000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/?development=1&test#/program/${id}`);
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 const prompt=id==='speech'?'HOW MANY COACHES':'HOW MANY NATIONS';
 await expect.poll(()=>text(page),{timeout:190000}).toContain(prompt);
 await page.locator('#display').focus();await type(page,'1');
 await expect.poll(()=>text(page),{timeout:15000}).toContain('WHAT IS YOUR NAME');
 await type(page,'CARL');
 await expect.poll(()=>text(page),{timeout:5000}).toContain(id==='speech'?'NAME OF YOUR SCHOOL':'NAME OF YOUR NATION');
 await type(page,id==='speech'?'CENTRAL':'USA');
 await expect.poll(()=>text(page),{timeout:15000}).toContain('THE EVENTS ARE');
 // Advance the three original event-requirement pages into team selection.
 for(let event=0;event<3;event++){
  await expect.poll(()=>text(page),{timeout:20000}).toContain(id==='speech'?'LUCK OF EVENT':'WHEN YOU HAVE THIS COPIED');
  await page.waitForTimeout(400);await tap(page,'Enter');await page.waitForTimeout(1500);
 }
 await expect.poll(()=>text(page),{timeout:20000}).toContain(id==='speech'?'WHO DO YOU WANT':'COACH');
 if(id==='speech')await expect(page.locator('.printer-output pre')).toContainText('COACH CARL OF CENTRAL');
 await page.getByRole('button',{name:'Help',exact:true}).click();
 await expect(page.locator('.player-help')).toBeVisible();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Close help'}).click();
 await expect(page.locator('#status')).toContainText('Running');
 await page.getByRole('button',{name:'Pause',exact:true}).click();
 const before=await text(page);await page.waitForTimeout(250);expect(await text(page)).toBe(before);
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Restart',exact:true}).click();
 await expect.poll(()=>text(page),{timeout:15000}).not.toContain('THE EVENTS ARE');
 expect(errors).toEqual([]);
});
test('X-wing candidate starts, digit controls move the cockpit, and restart returns to CODE',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/?development=1&test#/program/xwing');
 await expect.poll(()=>text(page),{timeout:15000}).toContain('CODE');
 await page.locator('#display').focus();await type(page,'1');
 await page.waitForTimeout(1000);await tap(page,' ');
 await expect.poll(()=>text(page),{timeout:30000}).toContain('* --- *');
 const radar=()=>page.evaluate(()=>window.__circaPlayer.snapshot().filter((_,i)=>i<192&&i%64>=54));
 const before=await radar();
 await page.keyboard.down('4');await page.waitForTimeout(3500);await page.keyboard.up('4');
 const after=await radar();expect(after).not.toEqual(before);
 expect(await text(page)).not.toMatch(/ERROR|SN IN|FC IN/);
 await page.getByRole('button',{name:'Pause',exact:true}).click();await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume',exact:true}).click();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Restart',exact:true}).click();
 await expect.poll(()=>text(page),{timeout:15000}).toContain('CODE');
 await expect(page.locator('.source-details')).toContainText('identification is tentative');
});
