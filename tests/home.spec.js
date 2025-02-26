const { test, expect } = require('@playwright/test');

const pageUrl = process.env.ENVIRONMENT_URL || 'https://www.smart-village.dev';

test('Home has the correct title', async ({ page }) => {
  console.log(`Using pageUrl: ${pageUrl}`);
  const response = await page.goto(pageUrl);
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle(/SmartVillage.dev/);
  await page.screenshot({ path: 'home.jpg' });
});
