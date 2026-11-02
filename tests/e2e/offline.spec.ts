import { expect, test } from '@playwright/test';
import { chooseLanguage, onPass, playUntil, resultCount } from './helpers';

test('after one online load, the app starts and completes a round with the network off', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await context.setOffline(true);
  await page.reload();
  await chooseLanguage(page);
  await page.waitForSelector('.pass');
  await page.locator('.btn-go').click();
  await playUntil(page, onPass(page));
  expect(await resultCount(page)).toBe(1);
  await expect(page.locator('.leg').first()).toContainText('done');
});
