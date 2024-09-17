// @ts-check
const { test, expect } = require('@playwright/test');

// test for iDEAL2
test('iDEAL', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo Advanced/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "iDEAL"
    await page.getByRole('link', { name: 'iDEAL' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();
    
    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Click "Continue to iDEAL"
    await page.getByRole('button', { name: 'Continue to iDEAL' }).click();
    await expect(page.locator('text="Scan with your banking app to pay"')).toBeVisible();

    // Click "Select your bank"
    await page.getByRole('button', { name: 'Select your bank' }).click();

    // Click "TESTNL2A"
    await page.getByRole('button', { name: 'TESTNL2A' }).click();
    await expect(page.locator('text="Which test simulation to run?"')).toBeVisible();

    // Click "Success"
    await page.getByRole('button', { name: 'Success' }).click();

    // Click "Continue"  
    await page.getByRole('link', { name: 'Return Home' }).click();

});

