import {MORE_COUNT} from './helpers/catalog.js';
import {test,expect} from '@playwright/test';
test('second gallery is separate, reached by one small link; cards launch players directly',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.program-card')).toHaveCount(6);
 await expect(page.locator('a[href*="speech"],a[href*="olympics"],a[href*="starwars81"]')).toHaveCount(0);
 await expect(page.locator('a[href*="more"]')).toHaveCount(1);
 await page.getByRole('link',{name:'More uncurated programs →'}).click();
 await expect(page).toHaveURL(/#\/more$/);
 await expect(page.getByRole('heading',{level:1})).toContainText('the tapes.');
 await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
 expect((await page.locator('.program-card h2').allTextContents()).filter(title=>title!=='Sound & Tones').slice(0,34)).toEqual(['Speech','Olympics','Star Wars cockpit','Ricky Rat','Pinball','Logic circuit simulator','Orbit simulator','Skinner Box','German tutor','Magazine Index','TEACH VI','LIFE','Worm One','Peoria Grand Prix','Pendulum','Sentence Generator','Learning Tic-Tac-Toe','Superpower Investing','Trajectory','Relativity','Reflex Tests','Nuclear Equation Completer','John’s Circle','Keyword Cipher','Word Search','Computa-Match','Jaberwocky','Cave Game','JAB — The Best of the Monster Games','Who Donnt?','Dungeon Trainer','TUTAC Computer','Unfinished Tank Game','Lunar Lander']);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, nofollow');
 await page.getByRole('link',{name:'Play Speech →'}).click();
 await expect(page.locator('#display')).toBeVisible();
 await expect(page.locator('.player-header').getByRole('link',{name:'Collection',exact:true})).toHaveAttribute('href',/#\/more$/);
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();
 await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
});
for(const id of ['speech','olympics','starwars81'])test(`${id}: frozen v1 opens its original player directly`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`/${id}/v1/?test`);
 await expect(page.locator('#display canvas')).toHaveCount(1);
 await expect(page.locator('#status')).toContainText(id==='speech'?'Running corrected BASIC':'Running original BASIC');
 expect(new URL(page.url()).pathname).toBe(`/${id}/v1/`);
 expect(new URL(page.url()).hash).toBe('');
 await expect(page.locator('.player-header').getByRole('link',{name:'Collection',exact:true})).toHaveAttribute('href',/#\/more$/);
 await expect(page.getByRole('link',{name:id==='speech'?'Download BASIC payload':'Download original payload'})).toBeVisible();
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();
 await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
 expect(errors).toEqual([]);
});

test('More gallery links back to the main gallery near the top',async({page})=>{
 await page.goto('/#/more');
 await page.locator('.intro').getByRole('link',{name:'← Main gallery'}).click();
 await expect(page).toHaveURL(/#\/$/);
 await expect(page.locator('h1')).toContainText('Code, circa 1980.');
});

test('starwars81 is the URL name while the cockpit has a descriptive display title',async({page})=>{
 await page.goto('/#/more');
 await page.getByRole('link',{name:'Play Star Wars cockpit →'}).click();
 await expect(page).toHaveURL(/\/starwars81\/v1\/$/);
 await expect(page.locator('.player-header h1')).toHaveText('Star Wars cockpit');
 await expect(page.locator('#status')).toContainText('Running original BASIC');
 await expect(page.locator('.source-details')).toContainText('identification is tentative');
 await page.locator('.player-header').getByRole('link',{name:'Collection',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
 await expect(page.locator('.program-card')).toHaveCount(MORE_COUNT);
});

test('extra programs offer one best player without web-version choices',async({page})=>{
 await page.goto('/#/more');
 await expect(page.locator('.version-picker')).toHaveCount(0);
 await page.getByRole('link',{name:'Play Star Wars cockpit →'}).click();
 await expect(page).toHaveURL(/\/starwars81\/v1\/$/);
 await expect(page.locator('.version-picker,.web-version-nav')).toHaveCount(0);
 await page.locator('.versions > summary').click();
 await expect(page.locator('.versions li')).toHaveCount(2);
 await page.getByRole('link',{name:/V01/}).click();
 await expect(page.locator('.source-only')).toContainText('Source only');
 await expect(page.locator('#display')).toHaveCount(0);
 await page.getByRole('link',{name:'Play the playable version →'}).click();
 await expect(page.locator('#display')).toBeVisible();
});
