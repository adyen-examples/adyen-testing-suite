// @ts-check
const { test, expect } = require('@playwright/test');

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
    
    // Find iframe and fill "Card number" field
    const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('4111 1111 1111 1111');

    // Find iframe and fill "Expiry date" field
    const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
    await expiryDateFrame.getByPlaceholder('MM/YY').fill('03/30');

    // Find iframe and fill "CVC / CVV" field
    const cvcFrame = await page.frameLocator('iframe[title*="security code"]');
    await cvcFrame.getByPlaceholder('3 digits').fill('737');
   
    // https://docs.adyen.com/development-resources/testing/result-code-testing/testing-with-card-holder-name/#payment-result
    // Find and fill "Name on card" field with "capture failed" to trigger fail scenario - Note: this field is not contained within an iframe
    await page.getByPlaceholder('J. Smith').fill('DECLINED');

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    // Verify "refused" text to be visible
    await expect(page.locator('text=/refused/')).toBeVisible();

    await expect(page.locator('text="Return to Booking View"')).toBeVisible();
});
