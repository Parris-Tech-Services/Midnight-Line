const { test, expect } = require('@playwright/test');

test('starts a run, selects a passenger, and reaches a station', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The Midnight Suburban Line' })).toBeVisible();
  await page.getByRole('button', { name: 'Begin Night Run' }).click();
  await expect(page.getByRole('region', { name: 'Passenger selection' })).toBeVisible();
  const passenger = page.getByRole('option').first();
  await passenger.click();
  await page.getByRole('button', { name: /Start night run for/i }).click();
  await expect(page.getByRole('heading', { name: 'The Midnight Train' })).toBeVisible();
  for (let i = 0; i < 12; i++) {
    const depart = page.getByRole('button', { name: /Depart for/i });
    if (await depart.isVisible().catch(() => false)) break;
    await page.getByRole('button', { name: 'Continue dialogue' }).click();
  }
  await page.getByRole('button', { name: /Depart for/i }).click();
  await expect(page.getByRole('region', { name: /scene$/i })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to next station' }).isVisible().then(visible => expect(visible).toBe(false));
  const choice = page.getByRole('button', { name: /./ }).filter({ hasNotText: 'Continue' });
  await page.locator('fieldset button').first().click();
  await expect(page.getByRole('button', { name: 'Continue to next station' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to next station' }).click();
  expect(errors).toEqual([]);
});