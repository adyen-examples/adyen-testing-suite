// @ts-check
const { test, expect } = require('@playwright/test');


test('Card', async ({ page, baseURL }) => {

    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // select Drop-in
    await page.locator('text="Card"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="Card number"')).toBeVisible();

});
