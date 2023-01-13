// @ts-check
const { test, expect } = require('@playwright/test');


test('Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("Adyen Subscription Shopper View");
    await expect(page.locator('text="SHOPPER VIEW"')).toBeVisible();

    // Select Card
    await page.locator('text="Card"').click();
    await expect(page.locator('text="SUBSCRIPTION DETAILS"')).toBeVisible();

    // Click "Continue to confirm subscription"
    await page.click('text="Continue to confirm subscription"');
    await expect(page.locator('text="Card number"')).toBeVisible();
});
