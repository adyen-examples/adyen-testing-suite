// @ts-check
const { test, expect } = require('@playwright/test');

test('GooglePay', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Google Pay"
    await page.getByRole('link', { name: 'Google Pay' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Check Google Pay button is visible
    const googlePayButton = await page.locator('button[aria-label="Buy with GPay"]');
    await expect(googlePayButton).toBeVisible();

});