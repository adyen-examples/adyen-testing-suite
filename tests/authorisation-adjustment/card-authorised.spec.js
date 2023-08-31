// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Card Authorised', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Booking View/);

    // Select "Click here to start a hotel booking"
    await page.getByRole('link', { name: 'Click here to start a hotel booking', exact: true }).click();

    // Click "Continue to confirm booking"
    await page.getByRole('link', { name: 'Continue to confirm booking' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
    
    // Assert that "Card number" is visible within iframe
    await expect(page.locator('text="Card number"')).toBeVisible();

    // Fill card details
    await utilities.fillComponentCardDetails(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    // Verify "authorised" text to be visible
    await expect(page.locator('text=/authorised/')).toBeVisible();
    await expect(page.locator('text="Return to Booking View"')).toBeVisible();
});
