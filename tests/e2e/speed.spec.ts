import { expect, test } from '@playwright/test';
import { chooseLanguage, onPass, playUntil, resultCount, skipInstallHelp } from './helpers';

test('choosing a language and finishing a speed round saves a result that survives a reload', async ({ page }) => {
  await page.goto('/');
  await chooseLanguage(page);
  await skipInstallHelp(page);
  await page.waitForSelector('.pass');

  await page.locator('.btn-go').click();
  await playUntil(page, onPass(page));

  expect(await resultCount(page)).toBe(1);
  await page.reload();
  await expect(page.locator('.pass')).toBeVisible();
  expect(await resultCount(page)).toBe(1);
  await expect(page.locator('.leg').first()).toContainText('done');
});

test('leaving a round explains the consequences and saves nothing', async ({ page }) => {
  await page.goto('/');
  await chooseLanguage(page);
  await skipInstallHelp(page);
  await page.waitForSelector('.pass');

  await page.locator('.btn-go').click();
  const leave = page.getByRole('button', { name: 'Leave this game' });
  await playUntil(page, () => leave.isVisible());
  await leave.click();
  await expect(page.getByRole('alertdialog')).toContainText("won't be saved");
  await expect(page.getByRole('alertdialog')).toContainText('finished are safe');
  await page.getByRole('button', { name: "Leave and go back to today's set" }).click();
  await expect(page.locator('.pass')).toBeVisible();
  expect(await resultCount(page)).toBe(0);
});

test('a full set runs across 3 games, the week count goes up, and reopening mid-set resumes at the next game', async ({ page }) => {
  await page.goto('/');
  await chooseLanguage(page);
  await skipInstallHelp(page);
  await page.waitForSelector('.pass');
  await expect(page.getByTestId('week')).toContainText('New week');
  await expect(page.locator('.leg')).toHaveCount(3);

  await page.locator('.btn-go').click();
  await playUntil(page, onPass(page));
  await expect(page.getByTestId('week')).toContainText('1 of 5 days');

  // Reopen mid-set: the first row stays done and the second is lit.
  await page.reload();
  await page.waitForSelector('.pass');
  await expect(page.locator('.leg').first()).toContainText('done');
  await expect(page.locator('.leg').nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('.btn-go')).toContainText('Continue');

  await page.locator('.btn-go').click();
  await playUntil(page, onPass(page));
  await expect(page.locator('.leg').nth(2)).toHaveAttribute('aria-current', 'step');

  await page.locator('.btn-go').click();
  await playUntil(page, onPass(page));
  await expect(page.locator('.stub')).toContainText('Done for today');
  expect(await resultCount(page)).toBe(3);
  await expect(page.getByTestId('week')).toContainText('1 of 5 days');

  // Another set adds minutes, not another day.
  await page.getByRole('button', { name: 'Play another set' }).click();
  await expect(page.locator('.btn-go')).toContainText('Start');
  await expect(page.getByTestId('week')).toContainText('1 of 5 days');
});
