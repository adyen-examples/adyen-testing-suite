const { test, expect } = require('@playwright/test');

// Create Pay By Link and perform payment
test('Pay By Link', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Pay By Link Demo/);

    // Select 'Amount' and fill field
    const amountField = page.locator('#amount');
    await amountField.fill('4200');

    // Select 'Reference' and fill field with a `uniqueReference`
    const uniqueReference = 'your-unique-guid-reference';
    const referenceField = page.locator('#reference');
    await referenceField.fill(uniqueReference);

    // Create payment link
    await page.getByRole('button', { name: 'Create!' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Ensure the link with `uniqueReference ` is created
    await expect(page.getByText(uniqueReference)).toBeVisible();

    const link = await page.locator('text=/PL/').first();
    await link.click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Click 'Accept' (terms and conditions) button
    await page.getByRole('button', { name: 'Accept' }).click();

    // Enter card scheme details
    await enterSchemeDetails(page);

    // Click 'Pay' button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Payment success
    await page.getByText('Payment successful!');
});

async function enterSchemeDetails(page) {
    // Click "Credit Card"
    await page.getByRole('radio', { name: 'Credit Card' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle')

    // Find iframe and fill "Card number" field
    const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('4166 6766 6766 6746');

    // Find iframe and fill "Expiry date" field
    const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
    await expiryDateFrame.getByPlaceholder('MM/YY').fill('03/30');

    // Find iframe for CVC
    const cvcFrame = await page.getByRole('region[name="Credit Card"i]').frameLocator('iframe[title*="security code"]');

    // Fill "CVC / CVV" field
    await cvcFrame.getByPlaceholder('3 digits').fill('737');
}