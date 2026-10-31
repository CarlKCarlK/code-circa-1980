import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c))).join('\n');
});
const tap=async(page,key)=>{await page.keyboard.down(key);await page.waitForTimeout(150);await page.keyboard.up(key);await page.waitForTimeout(100);};
const type=async(page,text)=>{for(const k of text)await tap(page,k);await tap(page,'Enter');};

test('collection and program links open the one BASIC player directly, with the Wumpus credit',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'Alien'});
 await expect(card).toContainText('03 / Game');
 await expect(card.getByRole('link',{name:'Play Alien →'})).toHaveAttribute('href',/#\/program\/alien\/basic\/play$/);
 await page.goto('/?development=1#/program/alien');
 await expect(page).toHaveURL(/#\/program\/alien\/basic\/play$/);
 await expect(page.locator('.implementations')).toHaveCount(0); // One BASIC version: no edition tabs.
 await expect(page.locator('.keyboard-help')).toHaveAttribute('open','');
 await expect(page.locator('#display')).toBeVisible();
 await expect(page.locator('.source-section')).not.toContainText('Original bytes');
 await expect(page.getByRole('link',{name:'Download BASIC payload'})).toHaveAttribute('href',/ALIEN.*\.BAS$/);
 await expect(page.locator('.source-details')).toHaveAttribute('open','');
 await expect(page.locator('.source-details .program-history')).toContainText('Gregory Yob');
 await expect(page.locator('.source-details .program-history')).toContainText('More BASIC Computer Games');
 await expect(page.locator('.source-details .program-history')).toContainText('reskinning and remixing');
 await expect(page.locator('.source-details .program-history')).toContainText('Typing a listing in was a pain');
 for (const img of await page.locator('.source-details .program-history figure img').all()) {
  await img.scrollIntoViewIfNeeded();
  await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth)).toBeGreaterThan(0);
 }
 await expect(page.locator('.source-details .program-history figure img')).toHaveCount(2);
 await expect(page.locator('.source-details .program-differences')).toContainText('ARROWS AREN’T THAT CROOKED');
 await page.getByRole('button',{name:'Help'}).click();
 await expect(page.locator('.player-help')).toContainText('Close the junction you are in');
 await expect(page.locator('.player-help')).toContainText('The gas starts in your junction');
 await expect(page.locator('.player-help .program-differences')).toBeHidden();
 await page.getByRole('button',{name:'Close help'}).click();
 await page.goto('/?development=1#/program/alien/v01');
 await expect(page.locator('.source-only')).toContainText('Source only');
 await expect(page.getByRole('link',{name:'Play the playable version →'})).toHaveAttribute('href','#/program/alien/basic/play');
 await expect(page.locator('#display')).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('Alien runs with corrected spelling: skip the title, answer NO, spray prompt, move, pause and restart',async({page})=>{
 test.setTimeout(120000); // The program shuffles junction numbers for about 20 emulated seconds.
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/alien/basic/play');
 await expect(page.locator('#status')).toContainText('Running BASIC');
 await page.locator('#display').click();
 await page.waitForTimeout(1500);
 await tap(page,' '); // Any key skips the title animation.
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('DO YOU NEED BACKGROUND INFORMATION?');
 await page.getByRole('button',{name:'Type NO and Enter'}).click();
 await expect(page.locator('#display')).toBeFocused();
 await expect.poll(()=>screenText(page),{timeout:60000}).toMatch(/SPRAY,CLOSE, OR MOVE\? *$/m);
 expect(await screenText(page)).toContain('YOU ARE IN JUNCTION');
 const vents=(await screenText(page)).match(/VENTS LEAD TO ([\d ]+)/)[1].trim().split(/ +/);
 expect(vents).toHaveLength(3);
 await type(page,'M');
 await expect.poll(()=>screenText(page),{timeout:5000}).toContain('WHERE TO?');
 await type(page,vents[0]);
 // Any outcome of the move is the program answering: a new junction or a hazard.
 await expect.poll(()=>screenText(page),{timeout:10000}).toMatch(new RegExp(`JUNCTION ${vents[0]}\\b|SUCKED INTO SPACE|TENTACLES|SWITCH JUNCTIONS`));
 await page.getByRole('button',{name:'Pause'}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume'}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Restart'}).click();
 await expect.poll(()=>screenText(page),{timeout:10000}).not.toContain('VENTS LEAD TO');
 expect(errors).toEqual([]);
});
