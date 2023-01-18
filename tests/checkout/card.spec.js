// @ts-check
const { test, expect } = require('@playwright/test');


test('Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select Card
    await page.locator('text="Card"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="Card number"')).toBeVisible();
});
