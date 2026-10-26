const { test, expect } = require('@playwright/test');

const passengers = ['Signaler', 'Wiper', 'Busker', 'Burnt-out Nurse', 'Grieving Dad', 'Lonely Teen'];
const paths = [
  { name: 'supportive', choice: 'first' },
  { name: 'neutral', choice: 'middle' },
  { name: 'challenging', choice: 'last' }
];

async function leaveHub(page) {
  await expect(page.getByRole('heading', { name: 'The Midnight Train' })).toBeVisible();
  for (let i = 0; i < 15; i++) {
    const depart = page.getByRole('button', { name: /Depart for/i });
    if (await depart.isVisible()) {
      await depart.click();
      return;
    }
    const continueDialogue = page.getByRole('button', { name: 'Continue dialogue' });
    await expect(continueDialogue).toBeVisible();
    await continueDialogue.click();
  }
  throw new Error('Train-hub dialogue never offered departure');
}

for (const passengerName of passengers) {
  for (const route of paths) {
    test(`${passengerName}: complete all six stations (${route.name}) and restart`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'The Midnight Suburban Line' })).toBeVisible();
      await page.getByRole('button', { name: 'Begin Night Run' }).click();
      await expect(page.getByRole('region', { name: 'Passenger selection' })).toBeVisible();
      const passenger = page.getByRole('option', { name: new RegExp('^' + passengerName + ':') });
      await passenger.click();
      await page.getByRole('button', { name: /Start night run for/i }).click();

      for (let station = 0; station < 6; station++) {
        await leaveHub(page);
        await expect(page.getByRole('region', { name: /scene$/i })).toBeVisible();
        const choices = page.locator('fieldset button');
        await expect(choices.first()).toBeVisible();
        const count = await choices.count();
        expect(count).toBeGreaterThan(0);
        const selected = route.choice === 'first' ? 0 : route.choice === 'last' ? count - 1 : Math.floor(count / 2);
        await choices.nth(selected).click();
        await page.getByRole('button', { name: 'Continue to next station' }).click();
      }

      await expect(page.getByRole('button', { name: 'Return to the Depot' })).toBeVisible();
      await page.getByRole('button', { name: 'Return to the Depot' }).click();
      await expect(page.getByRole('heading', { name: 'The Midnight Suburban Line' })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}
