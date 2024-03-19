// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require("../utilities");

test('Dropin Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("Adyen Subscription Shopper View");
    await expect(page.locator('text="SHOPPER VIEW"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="SUBSCRIPTION DETAILS"')).toBeVisible();

    // Click "Continue to confirm subscription"
    await page.getByRole('link', { name: 'Continue to confirm subscription' }).click();

    // Wait for load event
    await page.waitForLoadState('load');
    
    // Assert that "Credit or debit card" is visible within iframe
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();

    // Click "Credit or debit card"
    const radioButton = await page.getByRole('radio', { name: 'Credit or debit card' });
    await radioButton.click();

    // Wait for load event
    await page.waitForLoadState('load');
    
    // Fill card details
    await utilities.fillDropinCardDetails(page);

    // Click "Confirm"
    const confirmButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    await expect(page.locator('text="Return to Shopper View"')).toBeVisible();
});