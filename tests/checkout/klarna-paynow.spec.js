// @ts-check
const { test, expect } = require('@playwright/test');

test('Klarna Pay Now', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Klarna Pay Now"
    await page.locator('text="Klarna - Pay now"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="Continue to Pay now with Klarna."')).toBeVisible();

    // Click "Continue to Klarna"
    await page.locator('text="Continue to Pay now with Klarna."').click();
    await expect(page).toHaveTitle("Je bestelling afronden");
});