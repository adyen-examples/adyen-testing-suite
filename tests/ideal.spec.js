// @ts-check
const { test, expect } = require('@playwright/test');

test('iDEAL', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // select iDEAL
    await page.locator('text="iDEAL"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="Select your bank"')).toBeVisible();

    // Select bank
    await page.click('text="Select your bank"');
    // Choose Test Issuer
    const element = page.locator('input[aria-autocomplete="list"]');
    await element.type('Test Issuer');
    await element.press('Enter');

    // click "Continue"
    await page.click('text="Continue to Test Issuer"');
    await expect(page.locator('text="iDEAL Issuer Simulation"')).toBeVisible();

});
