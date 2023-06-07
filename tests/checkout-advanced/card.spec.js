// @ts-check
const { test, expect } = require('@playwright/test');

test('Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo Advanced/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Card"
    await page.getByRole('link', { name: 'Card', exact: true }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
    
    // Assert that "Card number" is visible within iframe
    await expect(page.locator('text="Card number"')).toBeVisible();
    
    // Find iframe and fill "Card number" field
    const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('4166 6766 6766 6746');

    // Find iframe and fill "Expiry date" field
    const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
    await expiryDateFrame.getByPlaceholder('MM/YY').fill('03/30');

    // Find iframe and fill "CVC / CVV" field
    const cvcFrame = await page.frameLocator('iframe[title*="security code"]');
    await cvcFrame.getByPlaceholder('3 digits').fill('737');
   
    // Find and fill "Name on card" field - Note: this field is not contained within an iframe
    await page.getByPlaceholder('J. Smith').fill('J. Smith');

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.locator('text="Return Home"')).toBeVisible();
});
