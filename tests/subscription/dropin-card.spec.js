// @ts-check
const { test, expect } = require('@playwright/test');

// SEPA payment
test('Dropin Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("Adyen Subscription Shopper View");
    await expect(page.locator('text="SHOPPER VIEW"')).toBeVisible();

    // Select "Drop-in"
    await page.locator('text="Drop-in"').click();
    await expect(page.locator('text="SUBSCRIPTION DETAILS"')).toBeVisible();

    // Click "Continue to confirm subscription"
    await page.click('text="Continue to confirm subscription"');
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();

    // Locate iframe
    const frame = page.frameLocator('iframe');
    
    // Select "Credit or debit card"
    await page.click('[aria-label="Credit or debit card"]');
    await expect(page.locator('[aria-label="Credit or debit card"]')).toHaveAttribute('aria-expanded', 'true');

    // Find and fill "Card number" field
    const cardNumberField = frame.nth(0).getByPlaceholder('1234 5678 9012 3456');
    await cardNumberField.fill('4166 6766 6766 6746');
    
    // Find and fill "Expiry date" field
    const expiryDateField = frame.nth(1).getByPlaceholder("MM/YY");
    await expiryDateField.fill('03/30');
    
    // Find and fill "CVC / CVV" field
    const cvcField = frame.nth(2).getByPlaceholder('3 digits');
    await cvcField.fill('737');
    
    // Find and fill "Name on card" field - Note: this field is not contained within an iframe
    const nameOnCardField = page.getByPlaceholder('J. Smith');
    await nameOnCardField.fill('J. Smith');

    // Click "Confirm preauthorization"
    const confirmButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    await expect(page.locator('text="Return to Shopper View"')).toBeVisible();
});