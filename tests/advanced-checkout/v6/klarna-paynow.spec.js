// @ts-check
const { test, expect } = require('@playwright/test');

test('Klarna Pay Now', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo Advanced/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Klarna Pay Now"
    await page.getByRole('link', { name: 'Klarna - Pay now' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    await expect(page.locator('text="Continue to Pay now with Klarna."')).toBeVisible();

    // Click "Continue to Klarna"    
    await page.locator('text="Continue to Pay now with Klarna."').click();
});