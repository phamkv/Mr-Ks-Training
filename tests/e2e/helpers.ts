import { expect, type Page } from '@playwright/test';

export async function chooseLanguage(page: Page, name = 'English') {
  await page.getByRole('radio', { name }).click();
  await page.locator('.plain-action').click();
}

export async function skipInstallHelp(page: Page) {
  await page.waitForTimeout(300);
  const installed = page.locator('.install-steps');
  if (await installed.isVisible().catch(() => false)) await page.locator('.plain-action').click();
}

// Plays whatever is on screen by following the test-only answers, until a target appears.
export async function playUntil(page: Page, done: () => Promise<boolean>, onStep?: () => Promise<void>) {
  for (let i = 0; i < 400; i++) {
    if (await done()) return;
    await onStep?.();
    const next = page.locator('.demo-next');
    const practice = page.locator('.message-screen .btn-primary');
    const answer = page.locator('[data-correct="true"]:not([aria-pressed="true"])');
    const finished = page.locator('.btn-done:not([disabled])');
    if (await next.isVisible()) await next.click();
    else if (await practice.isVisible()) await practice.click();
    else if (await finished.isVisible()) await finished.click();
    else if (await answer.count()) await answer.first().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(280);
  }
  expect(await done(), 'played too long').toBe(true);
}

export const onPass = (page: Page) => () => page.locator('.pass').isVisible();

export async function resultCount(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const open = indexedDB.open('pcogni');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const count = open.result.transaction('results').objectStore('results').count();
          count.onsuccess = () => {
            open.result.close();
            resolve(count.result);
          };
        };
      }),
  );
}

// Replaces today's stored set so a test can reach any game directly.
export async function forceSet(page: Page, gameIds: string[]) {
  await page.evaluate(
    (ids) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('pcogni');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction('todaysSet', 'readwrite');
          const store = tx.objectStore('todaysSet');
          const all = store.getAll();
          all.onsuccess = () => {
            for (const row of all.result) store.put({ ...row, gameIds: ids, completedIds: [] });
          };
          tx.oncomplete = () => {
            open.result.close();
            resolve();
          };
        };
      }),
    gameIds,
  );
}

// Every interactive control must be at least 60x60 CSS px.
export async function expectLargeTargets(page: Page) {
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .map((button) => {
        const box = button.getBoundingClientRect();
        return { text: button.textContent || button.getAttribute('aria-label') || button.className, width: box.width, height: box.height };
      })
      .filter((box) => box.width > 0 && (box.width < 59.5 || box.height < 59.5)),
  );
  expect(small).toEqual([]);
}

export async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}
