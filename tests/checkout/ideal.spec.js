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

    // Click "Select your bank"
    await page.getByPlaceholder('Search...').click();

    // Choose "Test Issuer"
    await page.getByText('Test Issuer', { exact: true }).click();

    // Click "Continue to Test Issuer"
    await page.getByRole('button', { name: 'Continue to Test Issuer' }).click();
    await expect(page.locator('text="iDEAL Issuer Simulation"')).toBeVisible();

    // Click "Continue"  
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('link', { name: 'Return Home' }).click();
});
