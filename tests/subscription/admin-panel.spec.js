// @ts-check
const { test, expect } = require('@playwright/test');

test('Admin Panel', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveTitle("Adyen Subscription Admin View");
    await expect(page.locator('text="ADMIN PANEL"')).toBeVisible();

});
