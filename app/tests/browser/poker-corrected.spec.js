import {test,expect} from '@playwright/test';
const screen=page=>page.evaluate(()=>window.__circaPlayer?String.fromCharCode(...window.__circaPlayer.snapshot().map(c=>c<32?c+64:c>=128?32:c)):'');
const answer=async(page,value)=>{const field=page.getByRole('textbox',{name:'Answer for the original program'});await expect(field).toBeEnabled();await field.fill(value);await page.getByRole('button',{name:'Send + Enter'}).click();await expect(field).toBeEnabled();};
for(const [edition,url] of [['development','/?development=1&test#/program/poker'],['frozen v1','/poker/v1/?test']])test(`Poker ${edition}: play through the draw and compare five distinct computer cards`,async({page})=>{
 test.setTimeout(150000);page.on('dialog',d=>d.accept());await page.goto(url);await expect(page.locator('#status')).toContainText('Running corrected BASIC');
 await expect.poll(()=>screen(page),{timeout:45000}).toContain('WHAT IS YOUR BET');
 let text=await screen(page);expect(text).not.toMatch(/YOOU|WWELCOME|DRAWW|CHREATIVE|MORRISTIWN/);
 const opening=[...text.matchAll(/I'LL OPEN WITH\s+(\d+)/g)].at(-1);await answer(page,opening?opening[1]:'.5');
 await expect.poll(()=>screen(page),{timeout:30000}).toContain('HOW MANY CARDS DO YOU WANT');await answer(page,'0');
 await expect.poll(()=>screen(page),{timeout:50000}).toContain('I AM TAKING');
 await expect.poll(()=>screen(page),{timeout:15000}).toMatch(/I AM TAKING[\s\S]*WHAT IS YOUR BET/);await answer(page,'.5');
 await expect.poll(()=>screen(page),{timeout:15000}).toMatch(/NOW WE COMPARE HANDS|I'LL BET/);
 text=await screen(page);if(!text.includes('NOW WE COMPARE HANDS')){const bet=[...text.matchAll(/I'LL BET\s+(\d+)/g)].at(-1);expect(bet).toBeTruthy();await answer(page,bet[1]);}
 await expect.poll(()=>screen(page),{timeout:30000}).toContain('DO YOU WISH TO CONTINUE');text=await screen(page);
 expect(text).toContain('NOW WE COMPARE HANDS');expect(text).not.toMatch(/\?(?:SN|FC|BS|OV|TM|UL) ERROR|BREAK IN 1005/i);
 const hand=text.split('MY HAND:').at(-1).split('YOU HAVE')[0];const cards=[...hand.matchAll(/(?:6|7|8|9|10)\s*--\s*((?:\d+|JACK|QUEEN|KING|ACE)\s+OF\s+(?:CLUBS|DIAMONDS|HEARTS|SPADES))/g)].map(m=>m[1].replace(/\s+/g,' '));expect(cards).toHaveLength(5);expect(new Set(cards).size).toBe(5);
 await page.getByRole('button',{name:'Pause',exact:true}).click();const states=await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates);await page.waitForTimeout(150);expect(await page.evaluate(()=>window.__circaPlayer.diagnostics().tStates)).toBe(states);await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'Restart',exact:true}).click();await expect.poll(()=>screen(page),{timeout:40000}).toContain('YOUR HAND');
});
