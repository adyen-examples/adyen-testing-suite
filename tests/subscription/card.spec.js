// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("Adyen Subscription Shopper View");
    await expect(page.locator('text="SHOPPER VIEW"')).toBeVisible();

    // Select "Card"
    await page.getByRole('link', { name: 'Card' }).click();
    await expect(page.locator('text="SUBSCRIPTION DETAILS"')).toBeVisible();

    // Click "Continue to confirm subscription"
    await page.getByRole('link', { name: 'Continue to confirm subscription' }).click();
    
    // Wait for load event
    await page.waitForLoadState('load');

    // Assert that "Card number" is visible within iframe
    await expect(page.locator('text="Card number"')).toBeVisible();
    
    // Fill card details
    await utilities.fillComponentCardDetails(page);
    
    // Click "Confirm pre-authorisation"
    const confirmButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    
    await expect(page.locator('text="Return to Shopper View"')).toBeVisible();
});
