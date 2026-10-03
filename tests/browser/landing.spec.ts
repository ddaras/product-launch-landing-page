import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('has one above-the-fold primary CTA and working section navigation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /A first look\.\s*More to come\./,
  );
  const cta = page.getByRole('link', { name: 'Explore the launch' });
  await expect(cta).toHaveCount(1);
  const bounds = await cta.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThan(page.viewportSize()!.height);
  await cta.click();
  await expect(page).toHaveURL(/#overview$/);
  await expect(page.locator('#overview')).toBeInViewport();
  await expect(page.locator('.feature-card')).toHaveCount(3);
  await expect(page.locator('form, input, iframe')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('FAQ is keyboard accessible and opens the selected answer', async ({
  page,
}) => {
  await page.goto('/');
  const question = page
    .locator('summary')
    .filter({ hasText: 'Can I sign up or buy it now?' });
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByText('Not on this preview.', { exact: false }),
  ).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(
    page.getByText('Not on this preview.', { exact: false }),
  ).toBeHidden();
});

test('passes automated WCAG 2.2 AA checks', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('does not overflow at small mobile, tablet, or desktop widths', async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test('includes metadata and local social assets', async ({ page, request }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Product launch preview/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /early product launch preview/,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'website',
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    /og-image.png$/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
  expect(
    (await request.get('/og-image.png')).headers()['content-type'],
  ).toContain('image/png');
  expect((await request.get('/favicon.svg')).ok()).toBe(true);
});

test('analytics is opt-in, local-only, and does not store visitor data', async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4321'))
      externalRequests.push(request.url());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '0',
      configurable: true,
    });
    (window as any).__analytics = [];
    window.addEventListener('launch:analytics', (event) => {
      (window as any).__analytics.push((event as CustomEvent).detail);
    });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore the launch' }).click();
  const events = await page.evaluate(() => (window as any).__analytics);
  expect(events).toEqual(
    process.env.PUBLIC_ANALYTICS_ENABLED === 'true'
      ? [
          { event: 'page_view', path: '/' },
          { event: 'primary_cta_click', path: '/' },
        ]
      : [],
  );
  expect(externalRequests).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});

test('respects Do Not Track even when analytics is enabled', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'doNotTrack', {
      value: '1',
      configurable: true,
    });
    (window as any).__analytics = [];
    window.addEventListener('launch:analytics', (event) =>
      (window as any).__analytics.push(event),
    );
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore the launch' }).click();
  expect(await page.evaluate(() => (window as any).__analytics)).toEqual([]);
});

test('core content, CTA, and FAQ work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321');
  await page.getByRole('link', { name: 'Explore the launch' }).click();
  await expect(page).toHaveURL(/#overview$/);
  await page
    .locator('summary')
    .filter({ hasText: 'When will it be available?' })
    .click();
  await expect(
    page.getByText('A launch date has not been confirmed', { exact: false }),
  ).toBeVisible();
  await context.close();
});

test('skip link is the first keyboard stop and reduced motion is respected', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto');
});
