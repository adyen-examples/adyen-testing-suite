// @ts-check
const { test, expect } = require('@playwright/test');

// SEPA payment
test('Dropin SEPA', async ({ page }) => {

    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // select Drop-in
    await page.locator('text="Drop-in"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="SEPA Direct Debit"')).toBeVisible();

    // select SEPA
    await page.locator('button[aria-label="SEPA Direct Debit"]').click();
    await page.fill('input[name="ownerName"]', "A. Klaassen");
    await page.fill('input[name="ibanNumber"]', "NL13TEST0123456789");

    // click "Pay"
    elem = page.locator('button:has-text("Pay €10.00") >> visible=true');
    await expect(elem).toBeVisible();
    await elem.click();

    await expect(page.locator('text="Return Home"')).toBeVisible();

});
