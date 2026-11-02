import { expect, test, type Page } from '@playwright/test';
import { chooseLanguage, onPass, playUntil, resultCount, skipInstallHelp } from './helpers';

async function start(page: Page) {
  await page.goto('/');
  await chooseLanguage(page);
  await skipInstallHelp(page);
  await page.waitForSelector('.pass');
}

async function playAndOpenSettings(page: Page) {
  await page.locator('.btn-go').click();
  await playUntil(page, onPass(page));
  await page.waitForTimeout(800);
  await page.locator('.home-bar .btn-small').click();
  await expect(page.getByTestId('last-backup')).toContainText('Last backup', { timeout: 15_000 });
}

async function viewToken(page: Page): Promise<string> {
  return page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const open = indexedDB.open('pcogni');
        open.onsuccess = () => {
          const get = open.result.transaction('identity').objectStore('identity').get('me');
          get.onsuccess = () => {
            open.result.close();
            resolve(get.result.viewToken);
          };
        };
      }),
  );
}

test('play a round, confirm its backup, clear browser storage, restore with the code and confirm history returns', async ({ page }) => {
  await start(page);
  await playAndOpenSettings(page);
  expect(await resultCount(page)).toBe(1);

  await page.getByRole('button', { name: 'Show recovery code' }).click();
  const code = (await page.getByTestId('recovery-code').textContent())!;
  expect(code).toMatch(/^([A-Z2-7]{1,4} ?)+$/);

  await page.evaluate(() => new Promise<void>((resolve) => {
    const del = indexedDB.deleteDatabase('pcogni');
    del.onsuccess = del.onerror = del.onblocked = () => resolve();
  }));
  await page.reload();
  await chooseLanguage(page);
  await skipInstallHelp(page);
  await page.waitForSelector('.pass');
  expect(await resultCount(page)).toBe(0);

  await page.locator('.home-bar .btn-small').click();
  await page.getByRole('button', { name: 'Restore from code' }).click();
  await page.getByLabel('Recovery code').fill(code.toLowerCase());
  await page.locator('.plain-panel .btn-primary').click();
  await expect(page.getByRole('status')).toContainText('restored');
  expect(await resultCount(page)).toBe(1);
});

test('/view#<token> shows trends and the notice, contains no control that changes data, and a replaced link stops working', async ({ page, context }) => {
  await start(page);
  await playAndOpenSettings(page);
  const token = await viewToken(page);

  const viewer = await context.newPage();
  await viewer.goto(`/view#${token}`);
  await expect(viewer.locator('.view-notice')).toContainText('not a health check');
  await expect(viewer.locator('.view-chart h2').first()).toContainText('Speed game');
  await expect(viewer.locator('.view-week')).toContainText('of 10 hours');
  await expect(viewer.locator('.view-panel button, .view-panel input, .view-panel form')).toHaveCount(0);
  await expect(viewer.getByText('Add this app')).toHaveCount(0);

  await page.getByRole('button', { name: 'Replace private link' }).click();
  await expect(page.getByRole('alertdialog')).toContainText('stops working');
  await page.getByRole('button', { name: 'Replace the link' }).click();
  await expect(page.getByRole('status')).toContainText('replaced');

  await viewer.reload();
  await expect(viewer.getByRole('alert')).toContainText("doesn't work");
});
