// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();
  // perform login
  await page.fill('input[name="username"]', utilities.USERNAME);
  await page.fill('input[name="password"]', "123");
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('text="Dashboard"')).toBeVisible();
  await expect(page.locator('text="Status"')).toBeVisible();

  await page.goto('/products');
  await expect(page.locator('text="My Products"')).toBeVisible();
});

test('Transactions', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();
  // perform login
  await page.fill('input[name="username"]', utilities.USERNAME);
  await page.fill('input[name="password"]', "123");
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('text="Dashboard"')).toBeVisible();

  await page.goto('/transactions', { waitUntil: 'networkidle' });

  // page title
  await expect(page.locator('text="My Transactions"')).toBeVisible();
  // verify no error while loading 
  await expect(page.locator('text="Something went wrong."')).toBeHidden();

});

test('Payouts', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();
  // perform login
  await page.fill('input[name="username"]', utilities.USERNAME);
  await page.fill('input[name="password"]', "123");
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('text="Dashboard"')).toBeVisible();

  await page.goto('/payouts', { waitUntil: 'networkidle' });

  // page title
  await expect(page.locator('text="My Payouts"')).toBeVisible();
  // verify no error while loading 
  await expect(page.locator('text="Something went wrong."')).toBeHidden();

});

test('Reports', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/AfP MyPlatform/);

  await page.goto('/login');
  await expect(page.locator('text="Login"')).toBeVisible();
  // perform login
  await page.fill('input[name="username"]', utilities.USERNAME);
  await page.fill('input[name="password"]', "123");
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.locator('text="Dashboard"')).toBeVisible();

  await page.goto('/reports', { waitUntil: 'networkidle' });

  // page title
  await expect(page.locator('text="My Reports"')).toBeVisible();
  // verify no error while loading 
  await expect(page.locator('text="Something went wrong."')).toBeHidden();

});

