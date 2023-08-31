// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require("../utilities");

test('Card Refused', async ({ page }) => {
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

    // Fill card details and fill "Name on card" field with "DECLINED" to trigger 'capture failed' scenario
    // https://docs.adyen.com/development-resources/testing/result-code-testing/testing-with-card-holder-name/#payment-result
    await utilities.fillComponentCardDetails(page, { nameOnCard: 'DECLINED' });

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    // Verify "refused" text to be visible
    await expect(page.locator('text=/refused/')).toBeVisible();

    await expect(page.locator('text="Return to Booking View"')).toBeVisible();
});
