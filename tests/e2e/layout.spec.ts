import { expect, test } from '@playwright/test';
import { chooseLanguage, expectLargeTargets, expectNoOverflow, forceSet, onPass, playUntil, skipInstallHelp } from './helpers';

const GAMES = ['speed', 'memoryGrid', 'arrows', 'tapOrWait', 'switchRule'];

for (const language of ['English', 'Deutsch', 'Tiếng Việt']) {
  test(`in ${language}, every control is at least 60x60 and no screen overflows`, async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto('/');
    await chooseLanguage(page, language);
    await skipInstallHelp(page);
    await page.waitForSelector('.pass');
    await forceSet(page, GAMES);
    await page.reload();
    await page.waitForSelector('.pass');
    await expectLargeTargets(page);
    await expectNoOverflow(page);

    await page.locator('.home-bar .btn-small').click();
    await page.waitForSelector('.settings');
    await expectLargeTargets(page);
    await expectNoOverflow(page);
    await page.locator('.settings-back').click();

    for (const _ of GAMES) {
      await page.waitForSelector('.pass');
      await page.locator('.btn-go').click();
      await playUntil(page, onPass(page), async () => {
        await expectLargeTargets(page);
        await expectNoOverflow(page);
      });
      await expectNoOverflow(page);
    }
    await expect(page.locator('.stub .btn-secondary')).toBeVisible();
    await expectLargeTargets(page);
  });
}
