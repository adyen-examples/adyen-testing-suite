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

    // Wait for load event
    await page.waitForLoadState('load');
    
    // Assert that "Card number" is visible within iframe
    await expect(page.locator('text="Card number"')).toBeVisible();

    // Fill card details and fill "Name on card" field with "DECLINED" to trigger 'capture failed' scenario
    // https://docs.adyen.com/development-resources/testing/result-code-testing/testing-with-card-holder-name/#payment-result
    // check if Drop-in v6 is being used (wait for 4 seconds)
    if (await page.locator("#payment-component-v6").isVisible({ timeout: 4000 })) {
        // using Drop-in v6
        await utilities.fillComponentCardDetailsV6(page, { nameOnCard: 'DECLINED' });
    } else {
        // using Drop-in v5
        await utilities.fillComponentCardDetails(page, { nameOnCard: 'DECLINED' });
    }


    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    // Verify "refused" text to be visible
    await expect(page.locator('text=/refused/')).toBeVisible();

    await expect(page.locator('text="Return to Booking View"')).toBeVisible();
});
