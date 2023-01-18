// @ts-check
const { test, expect } = require('@playwright/test');

// SEPA payment
test('Dropin SEPA', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.locator('text="Drop-in"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="SEPA Direct Debit"')).toBeVisible();

    // Select "SEPA"
    await page.locator('button[id^="button-sepadirectdebit"]').click();
    await page.fill('input[name="ownerName"]', "A. Klaassen");
    await page.fill('input[name="ibanNumber"]', "NL13TEST0123456789");

    // Click "Pay"
    const payButton = page.locator('.adyen-checkout__button.adyen-checkout__button--pay >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page.locator('text="Return Home"')).toBeVisible();
});
