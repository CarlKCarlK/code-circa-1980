// Armatron-80 is a More program: these checks cover our JavaScript only (card, player,
// speed control, held-key fast mode, Help, downloads), not the BASIC's behavior.
import {test, expect} from '@playwright/test';

test('Armatron-80 has a More card that opens its player directly', async ({page}) => {
  await page.goto('/#/more');
  await expect(page.getByRole('heading', {name: 'Armatron-80', exact: true})).toHaveCount(1);
  await page.getByRole('link', {name: 'Play Armatron-80 →'}).click();
  await expect(page.locator('#display canvas')).toHaveCount(1);
  await expect(page.locator('.player-help')).toBeHidden();
});

test('Armatron-80 v1 starts at Max speed and stays fast while a key is held', async ({page}) => {
  test.setTimeout(60000);
  await page.goto('/armatron/v1/?test');
  await expect(page.locator('#display canvas')).toHaveCount(1);
  await expect(page.locator('.program-attribution')).toContainText('Linkage Blaze');
  const speed = page.getByRole('combobox', {name: 'Emulator speed'});
  await expect(speed).toHaveValue('100');
  await page.locator('#display').click();
  await page.waitForTimeout(500);
  const tStates = () => page.evaluate(() => window.__circaPlayer.diagnostics().tStates);
  await page.keyboard.down('q');
  const start = await tStates(), began = Date.now();
  await page.waitForTimeout(1500);
  const rate = (await tStates() - start) / ((Date.now() - began) / 1000) / 2027520;
  expect((await page.evaluate(() => window.__circaPlayer.diagnostics().held))).toContain('q');
  await page.keyboard.up('q');
  expect(rate).toBeGreaterThan(3);
  await speed.selectOption('1');
  await expect(speed).toHaveValue('1');
  await page.getByRole('button', {name: 'Help'}).click();
  await expect(page.locator('.player-help')).toBeVisible();
  await expect(page.locator('.player-help')).toContainText('Swing the whole arm');
  const listing = page.getByRole('link', {name: 'Download BASIC listing', exact: true});
  expect((await page.request.get(await listing.getAttribute('href'))).ok()).toBe(true);
});
