import {test,expect} from '@playwright/test';

const screenText=async page=>page.evaluate(()=>{
 const s=window.__circaPlayer.snapshot();
 return Array.from({length:16},(_,r)=>String.fromCharCode(...s.slice(r*64,r*64+64).map(c=>c<32?c+64:c>=128?32:c))).join('\n');
});

test('collection opens the Rust version; About is open on the start page',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1');
 const card=page.locator('.program-card',{hasText:'Chemical Equation Balancer'});
 await expect(card).toContainText('02 / Science');
 await expect(card.getByRole('link',{name:'Run Chemical Equation Balancer →'})).toHaveAttribute('href',/chemical-equation-balancer\/rust\/play$/);
 await page.goto('/?development=1#/program/chemical-equation-balancer');
 await expect(page.locator('.source-details')).toHaveAttribute('open','');
 await expect(page.locator('.source-details')).toContainText('Radio Shack sold Chemistry Balancer II');
 await expect(page.getByRole('link',{name:/Run Chemical Equation Balancer/})).toBeVisible();
 expect(errors).toEqual([]);
});

test('Rust version balances problems from the side panel and typed equations',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?development=1&test#/program/chemical-equation-balancer/rust/play');
 await expect(page.locator('#status')).toContainText('Rust engine ready');
 await expect(page.locator('#pause')).toBeHidden();
 await expect(page.locator('#equation')).toHaveValue('C3.H8 + O2 = C.O2 + H2.O');
 await expect(page.locator('.balancer-result')).toBeEmpty();
 await page.getByRole('button',{name:'Balance',exact:true}).click();
 await expect(page.locator('.balanced')).toHaveText('C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O');
 await page.getByRole('button',{name:'Permanganate'}).click();
 await expect(page.locator('.balancer-result')).toBeEmpty();
 await page.getByRole('button',{name:'Balance',exact:true}).click();
 await expect(page.locator('.balancer-result > p').first()).toHaveClass('trs80');
 await expect(page.locator('.balanced')).toHaveText('2 KMnO₄ + 16 HCl → 2 KCl + 2 MnCl₂ + 8 H₂O + 5 Cl₂');
 await expect(page.locator('#equation')).toHaveValue('K.MN.O4 + H.CL = K.CL + MN.CL2 + H2.O + CL2');
 await page.locator('.balancer-math summary').click();
 await expect(page.locator('.balancer-math')).toContainText('(a, b, c, d, e, f) = (2, 16, 2, 2, 8, 5)');
 await page.locator('#equation').fill('c3.h8 + o2 = c.o2 + h2.o');await page.keyboard.press('Enter');
 await expect(page.locator('.trs80')).toHaveText('( C3.H8 )+ 5( O2 )-^ 3( C.O2 )+ 4( H2.O )');
 await page.locator('.balancer-problems summary',{hasText:'Cannot be balanced'}).click();
 await page.getByRole('button',{name:'Ambiguous'}).click();
 await page.getByRole('button',{name:'Balance',exact:true}).click();
 await expect(page.locator('.balancer-error')).toContainText('FATAL ERROR: AMBIGUOUS EQUATION');
 await page.getByRole('button',{name:'Clear'}).click();
 await expect(page.locator('#equation')).toHaveValue('');
 await expect(page.locator('.balancer-result')).toBeEmpty();
 await expect(page.getByRole('link',{name:'Rust/JS version',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Level II BASIC version',exact:true}).click();
 await expect(page).toHaveURL(/chemical-equation-balancer\/v20\/play$/);
 expect(errors).toEqual([]);
});

test('original 1979 v06 balances a typed equation in the emulator',async({page})=>{
 await page.goto('/?development=1&test#/program/chemical-equation-balancer/v06/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('WHAT IS THE EQUATION');
 await page.locator('#display').click();
 await page.keyboard.type('FE+O2=FE2.O3');await page.keyboard.press('Enter');
 await expect.poll(()=>screenText(page),{timeout:30000}).toContain('4 (FE)+ 3 (O2) -^ 2 (FE2.O3)');
});

test('Level II BASIC player takes side-panel problems and pasted text',async({page})=>{
 await page.goto('/?development=1&test#/program/chemical-equation-balancer/v06/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('WHAT IS THE EQUATION');
 await expect(page.locator('.balancer-problems summary',{hasText:'Ions'})).toHaveCount(0);
 await page.getByRole('button',{name:'Rust'}).click();
 await expect.poll(()=>screenText(page),{timeout:10000}).toContain('? FE+O2=FE2.O3');
 await expect(page.locator('#display')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect.poll(()=>screenText(page),{timeout:30000}).toContain('4 (FE)+ 3 (O2) -^ 2 (FE2.O3)');
 await page.goto('/?development=1&test#/program/chemical-equation-balancer/v20/play');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect.poll(()=>screenText(page),{timeout:15000}).toContain('RAW EQUATION?');
 await page.locator('#display').click();
 await page.evaluate(()=>{const data=new DataTransfer();data.setData('text/plain','H2 + O2 = H2.O');document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:data,bubbles:true}));});
 await expect.poll(()=>screenText(page),{timeout:10000}).toContain('? H2 + O2 = H2.O');
});
