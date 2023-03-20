// @ts-check
const { test, expect } = require('@playwright/test');

test('Dropin SEPA', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
    
    // Assert that "SEPA Direct Debit" is visible
    await expect(page.locator('text="SEPA Direct Debit"')).toBeVisible();

    // Select "SEPA"
    await page.locator('button[id^="button-sepadirectdebit"]').click();
    await page.fill('input[name="ownerName"]', "A. Klaassen");
    await page.fill('input[name="ibanNumber"]', "NL13TEST0123456789");

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button.adyen-checkout__button--pay >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.locator('text="Return Home"')).toBeVisible();
});
