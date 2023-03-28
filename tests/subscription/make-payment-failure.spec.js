// @ts-check
const { test, expect } = require('@playwright/test');

test('Make Payment (failure)', async ({ page }) => {
    // call to invalid token
    await page.goto('/admin/makepayment/12345');

    // check error message
    await expect(page.locator('text=Payment failed for RecurringDetailReference')).toBeVisible();
    // check error icon
    await expect(page.locator('.status-image >> visible=true')).toBeVisible();

    await expect(page.locator('text="Return"')).toBeVisible();
});
