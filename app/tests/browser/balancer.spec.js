import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c))).join('\n');
});

test('collection and program links open the Rust player directly, with About open',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'Chemical Equation Balancer'});
 await expect(card).toContainText('02 / Science');
 await expect(card.getByRole('link',{name:'Run Chemical Equation Balancer →'})).toHaveAttribute('href',/#\/program\/bal\/rust\/play$/);
 for(const link of ['#/program/bal','#/program/bal/rust','#/program/bal/basic']){
  await page.goto(`/?development=1${link}`);
  await expect(page).toHaveURL(new RegExp(`${link.replace(/\//g,'\\/')}${link.endsWith('bal')?'\\/rust':''}\\/play$`));
  await expect(page.locator('#display')).toBeVisible();
 }
 await page.goto('/?development=1#/program/bal');
 await expect(page.locator('.source-details')).toHaveAttribute('open','');
 await expect(page.locator('.source-details')).toContainText('WITHOUT TRIAL & ERROR');
 for(const img of await page.locator('.source-details .program-history figure img').all()){
  const href=await img.locator('xpath=..').getAttribute('href');
  expect(href).toBe(await img.getAttribute('src'));
  expect((await page.request.get(href)).ok()).toBeTruthy();
 }
 expect(errors).toEqual([]);
});

test('Rust version balances problems from the side panel and typed equations',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/bal/rust/play');
 await expect(page.locator('#status')).toContainText('Rust engine ready');
 await expect(page.locator('#pause')).toBeHidden();
 await expect(page.locator('#equation')).toHaveValue('C3.H8 + O2 = C.O2 + H2.O');
 await expect(page.locator('.balancer-result')).toBeEmpty();
 await page.getByRole('button',{name:'Balance',exact:true}).click();
 await expect(page.locator('.balanced')).toHaveText('C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O');
 await page.getByRole('button',{name:'Permanganate',exact:true}).click();
 await expect(page.locator('.balancer-result')).toBeEmpty();
 await page.getByRole('button',{name:'Balance',exact:true}).click();
 await expect(page.locator('.balancer-result > p').first()).toHaveClass('trs80');
 await expect(page.locator('.balanced')).toHaveText('2 KMnO₄ + 16 HCl → 2 KCl + 2 MnCl₂ + 8 H₂O + 5 Cl₂');
 await expect(page.locator('#equation')).toHaveValue('K.MN.O4 + H.CL = K.CL + MN.CL2 + H2.O + CL2');
 await page.locator('.balancer-math summary').click();
 await expect(page.locator('.balancer-math')).toContainText('(a, b, c, d, e, f) = (2, 16, 2, 2, 8, 5)');
 await page.locator('#equation').fill('c3.h8 + o2 = c.o2 + h2.o');await page.keyboard.press('Enter');
 await expect(page.locator('.trs80')).toHaveText('( C3.H8 )+ 5( O2 )-^ 3( C.O2 )+ 4( H2.O )');
 await page.getByRole('button',{name:'Ambiguous'}).click();
 await page.getByRole('button',{name:'Balance',exact:true}).click();
 await expect(page.locator('.balancer-error')).toContainText('FATAL ERROR: AMBIGUOUS EQUATION');
 await page.getByRole('button',{name:'Clear'}).click();
 await expect(page.locator('#equation')).toHaveValue('');
 await expect(page.locator('.balancer-result')).toBeEmpty();
 await expect(page.getByRole('link',{name:'Rust/JS version',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Level II BASIC version',exact:true}).click();
 await expect(page).toHaveURL(/#\/program\/bal\/basic\/play$/);
 expect(errors).toEqual([]);
});

test('older BASIC versions are source only, linking to the playable v20',async({page})=>{
 await page.goto('/?development=1#/program/bal/v06');
 await expect(page).toHaveURL(/#\/program\/bal\/v06$/);
 await expect(page.locator('.source-only')).toContainText('Source only');
 await expect(page.getByRole('link',{name:'Download BASIC listing'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Run the playable version →'})).toHaveAttribute('href','#/program/bal/basic/play');
 await expect(page.locator('#display')).toHaveCount(0);
});

test('Level II BASIC player takes side-panel problems and pasted text',async({page})=>{
 test.setTimeout(150000); // v20 takes 23+ s of emulated time to balance water.
 await page.goto('/?development=1&test#/program/bal/basic/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('RAW EQUATION?');
 await page.locator('#display').click();
 await page.evaluate(()=>{const data=new DataTransfer();data.setData('text/plain','H2 + O2 = H2.O');document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true}));});
 await expect.poll(()=>screenText(page),{timeout:10000}).toContain('? H2 + O2 = H2.O');
 await page.keyboard.press('Enter');
 // v20 keeps the typed spacing, so compare without spaces.
 await expect.poll(async()=>(await screenText(page)).replace(/ /g,''),{timeout:70000}).toContain('2(H2)+(O2)-^2(H2.O)');
 await page.reload();
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('RAW EQUATION?');
 await page.getByRole('button',{name:'Rust',exact:true}).click();
 await expect.poll(()=>screenText(page),{timeout:10000}).toContain('? FE + O2 = FE2.O3');
 await expect(page.locator('#display')).toBeFocused();
});
