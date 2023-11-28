// @ts-check
const { test, expect } = require('@playwright/test');
const utils = require('./utils');

test('Dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();
  // perform login
  await page.fill('input[name="username"]', utils.USERNAME);
  await page.fill('input[name="password"]', "123");
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('text="Dashboard"')).toBeVisible();
  await expect(page.locator('text="Status"')).toBeVisible();

  await page.goto('/products');
  await expect(page.locator('text="My Products"')).toBeVisible();
});

