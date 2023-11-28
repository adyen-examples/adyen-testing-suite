// @ts-check
const { test, expect } = require('@playwright/test');

test('Homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);
});

test('Goto Signup', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/signup');
  await expect(page.locator('text="Create an account"')).toBeVisible();
});

test('Goto Login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();
});

test('Invalid Login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();

  await page.fill('input[name="username"]', "Unknown");
  await page.fill('input[name="password"]', "123");
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('text="Invalid credentials"')).toBeVisible();

});

