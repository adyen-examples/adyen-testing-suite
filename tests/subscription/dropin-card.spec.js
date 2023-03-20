// @ts-check
const { test, expect } = require('@playwright/test');

test('Dropin Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("Adyen Subscription Shopper View");
    await expect(page.locator('text="SHOPPER VIEW"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="SUBSCRIPTION DETAILS"')).toBeVisible();

    // Click "Continue to confirm subscription"
    await page.getByRole('link', { name: 'Continue to confirm subscription' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
    
    // Assert that "Credit or debit card" is visible within iframe
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();

    // Click "Credit or debit card"
    const radioButton = await page.getByRole('radio', { name: 'Credit or debit card' });
    if (await radioButton.count() === 0) {
        // Click normal button for < Adyen-Web 5.32.x or lower
        await page.getByRole('button', { name: 'Credit or debit card' }).click();
    }
    else {
        // Click radio button for > Adyen-Web 5.33.x or higher
        await radioButton.click();
    }

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle')
    
    // Find iframe and fill "Card number" field
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('4166 6766 6766 6746');

    // Find iframe and fill "Expiry date" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured card expiry date"i]');
    await expiryDateFrame.getByPlaceholder('MM/YY').fill('03/30');

    // Find iframe and fill "CVC / CVV" field
    const cvcFrame = page.frameLocator('internal:role=region[name="Credit or debit card"i] >> internal:attr=[title="Iframe for secured card security code"i]');
    await cvcFrame.getByPlaceholder('3 digits').fill('737');
   
    // Find and fill "Name on card" field - Note: this field is not contained within an iframe
    await page.getByPlaceholder('J. Smith').fill('J. Smith');

    // Click "Confirm preauthorization"
    const confirmButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text="Return to Shopper View"')).toBeVisible();
});