import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?(c===128?32:42):c))).join('\n');
});
// The piece on a square as printed: a letter, then a block (shown as *) for White.
const square=async(page,row,column)=>(await screenText(page)).split('\n')[row-1].slice(column*6,column*6+3).trim();
const tap=async(page,key)=>{await page.keyboard.down(key);await page.waitForTimeout(120);await page.keyboard.up(key);await page.waitForTimeout(80);};
const type=async(page,text)=>{for(const k of text)await tap(page,k);await tap(page,'Enter');};
const movePrompt=/COULMB\)\? *.?\s*$/;

test('collection and program links open the Rust board directly; BASIC v14 and source-only versions remain',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'CISAB Chess'});
 await expect(card).toContainText('05 / Game');
 await expect(card.getByRole('link',{name:'Play CISAB Chess →'})).toHaveAttribute('href',/#\/program\/chess\/rust\/play$/);
 await page.goto('/?development=1#/program/chess');
 await expect(page).toHaveURL(/#\/program\/chess\/rust\/play$/);
 await expect(page.locator('.chess-board .sq')).toHaveCount(64);
 await expect(page.locator('.implementations a')).toHaveText(['Rust/JS version','Level II BASIC version']);
 await expect(page.locator('.source-details')).toHaveAttribute('open','');
 await expect(page.locator('.source-details .program-history')).toContainText('tournament in Peoria');
 await expect(page.locator('.source-section')).toContainText('14 recovered versions');
 await page.getByRole('button',{name:'Help'}).click();
 await expect(page.locator('.player-help')).toContainText('Play against the 1979 program on a modern board');
 await expect(page.locator('.player-help')).toContainText('?BS Error in 3015');
 await page.getByRole('button',{name:'Close help'}).click();
 await page.getByRole('link',{name:'Level II BASIC version'}).click();
 await expect(page).toHaveURL(/#\/program\/chess\/basic\/play$/);
 await expect(page.getByRole('link',{name:'Download original payload'})).toHaveAttribute('href',/CHESS.*\.BAS$/); // v14 is bundled once with the identical original/CHESS.BAS.
 await expect(page.getByRole('button',{name:'Fast (×20)'})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Help'}).click();
 await expect(page.locator('.player-help')).toContainText('Answers at OK?');
 await expect(page.locator('.player-help')).toContainText('Rows are numbered 1–8 from the top');
 await page.getByRole('button',{name:'Close help'}).click();
 await page.goto('/?development=1#/program/chess/v01');
 await expect(page.locator('.source-only')).toContainText('Source only');
 await expect(page.locator('#display')).toHaveCount(0);
 expect(errors).toEqual([]);
});

const sq=(page,r,c)=>page.locator(`.chess-board .sq[data-r="${r}"][data-c="${c}"]`);
test('Rust board: click and drag moves, CISAB answers from the original algorithm, Play Black and New game',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/chess/rust/play');
 await expect(page.locator('.chess-prompt')).toHaveText(/^WHAT WAS THEIR [A-Z]+ MOVE\?$/);
 // You are White, at the bottom: e2 is CISAB's row 2, column 4.
 await sq(page,2,4).click();
 await expect(page.locator('.chess-board .target')).toHaveCount(2);
 await sq(page,4,4).click();
 await expect(page.locator('.chess-moves')).toContainText('e4');
 await expect(page.locator('.chess-moves')).toContainText('Nf6',{timeout:5000}); // Its opening: the knight from row 8, column 2.
 // Drag the knight from g1 to f3.
 const from=await sq(page,1,2).boundingBox(),to=await sq(page,3,3).boundingBox();
 await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();
 await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:6});await page.mouse.up();
 await expect(page.locator('.chess-moves')).toContainText('Nf3');
 await expect(page.locator('.chess-moves')).toContainText('Nc6',{timeout:5000});
 // Turning off the opening answers IQ; CISAB then searches.
 await page.getByLabel(/CISAB’s opening/).uncheck();
 await sq(page,1,3).click();await sq(page,4,6).click(); // Bc4
 await expect.poll(async()=>(await page.evaluate(()=>window.__circaPlayer.snapshot())).typed.at(-1)).toBe('IQ');
 await expect.poll(async()=>(await page.evaluate(()=>window.__circaPlayer.snapshot())).history.length,{timeout:5000}).toBe(6);
 await page.locator('.chess-transcript summary').click();
 await expect(page.locator('.chess-transcript pre')).toContainText('OK?? IQ');
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Play Black'}).click();
 await expect(page.locator('.chess-moves')).toContainText('Nc3'); // As White, CISAB opens with its queen's knight.
 await expect(page.locator('.chess-files span').first()).toHaveText('h');
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'New game',exact:true}).first().click();
 expect(errors).toEqual([]);
});

test('CISAB v14 plays: WHITE, its opening, a typed move confirmed with OK, pause and restart',async({page})=>{
 test.setTimeout(90000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/chess/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('WHAT COLOR ARE WE?');
 await page.getByRole('button',{name:'Type WHITE and Enter'}).click();
 await expect(page.locator('#display')).toBeFocused();
 await expect.poll(()=>screenText(page),{timeout:20000}).toMatch(movePrompt);
 expect(await square(page,6,3)).toBe('N *'); // Its first book move: the knight from row 8, column 2.
 await type(page,'2,5,4,5');
 await expect.poll(()=>screenText(page),{timeout:10000}).toMatch(/OK\?\? *.?\s*$/);
 await page.getByRole('button',{name:'Type OK and Enter'}).click();
 await expect.poll(()=>square(page,6,6),{timeout:20000}).toBe('N *'); // Its second book move.
 expect(await square(page,4,5)).toBe('P');
 await page.getByRole('button',{name:'Pause'}).click();
 await expect(page.locator('#status')).toHaveText('Paused');
 await page.getByRole('button',{name:'Resume'}).click();
 page.once('dialog',dialog=>dialog.accept());
 await page.getByRole('button',{name:'Restart'}).click();
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('WHAT COLOR ARE WE?');
 expect(errors).toEqual([]);
});

test('CISAB v14 thinks of its own move at Fast (×20) after IQ turns off its opening',async({page})=>{
 test.setTimeout(120000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/chess/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('WHAT COLOR ARE WE?');
 await page.getByRole('button',{name:'Type BLACK and Enter'}).click();
 await expect.poll(()=>screenText(page),{timeout:20000}).toMatch(movePrompt);
 await type(page,'2,5,4,5');
 await expect.poll(()=>screenText(page),{timeout:10000}).toMatch(/OK\?\? *.?\s*$/);
 const before=(await screenText(page)).split('\n').slice(4,8).join('\n');
 const start=Date.now();
 await page.getByRole('button',{name:'Type IQ and Enter'}).click();
 // About 65 emulated seconds of search in the headless check (VERIFICATION.md).
 await expect.poll(()=>screenText(page),{timeout:90000}).toMatch(movePrompt);
 test.info().annotations.push({type:'search seconds',description:String((Date.now()-start)/1000)});
 expect((await screenText(page)).split('\n').slice(4,8).join('\n')).not.toBe(before); // It moved one of its pieces.
 expect(errors).toEqual([]);
});
