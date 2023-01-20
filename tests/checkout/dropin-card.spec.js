// @ts-check
const { test, expect } = require('@playwright/test');

test('Dropin Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();
    
    // Select "Credit or debit card"
    await page.getByRole('button', { name: 'Credit or debit card' }).click();
    await expect(page.locator('[aria-label="Credit or debit card"]')).toHaveAttribute('aria-expanded', 'true');
    
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

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page.locator('text="Return Home"')).toBeVisible();
});