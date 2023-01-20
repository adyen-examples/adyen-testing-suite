// @ts-check
const { test, expect } = require('@playwright/test');

test('iDEAL', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "iDEAL"
    await page.getByRole('link', { name: 'iDEAL' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    await expect(page.locator('text="Select your bank"')).toBeVisible();

    // Click "Select your bank"
    await page.click('text="Select your bank"');

    // Choose "Test Issuer"
    const element = page.locator('input[aria-autocomplete="list"]');
    await element.type('Test Issuer');
    await element.press('Enter');

    // Click "Continue to Test Issuer"
    await page.click('text="Continue to Test Issuer"');
    await expect(page.locator('text="iDEAL Issuer Simulation"')).toBeVisible();

    // Click "Continue"
    await page.click('text="Continue"');
    await expect(page.locator('text="Return Home"')).toBeVisible();
});
