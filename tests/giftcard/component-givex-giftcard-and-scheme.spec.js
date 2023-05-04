// @ts-check
const { test, expect } = require('@playwright/test');

// Enter two giftcards and use a card to finalize the payment
test('Gift Card Component with Givex and Scheme', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Gift Card Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Giftcard"
    await page.getByRole('link', { name: 'Gift Card Component' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Enter giftcard #1 // 110 EUR
    await enterGiftcardDetails(page);
    
    // Verify if the visual cue is appended on the frontend
    await expect(page.getByText(/Gift card applied/)).toBeVisible();

    // Enter giftcard #2 // 60 EUR
    await enterGiftcardDetails(page);

    // Enter card scheme details #3 // 10 EUR (final payment)
    await enterSchemeDetails(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.getByText('Return Home')).toBeVisible();
});

async function enterGiftcardDetails(page) {
    // Click on "Add Giftcard"
    await page.getByRole('button', { name: 'Redeem Gift Card' }).click();

    // Find iframe and fill "Card number" field
    const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('6036280000000000000');

    // Find iframe and fill "Pin" field
    const pinFrame = await page.frameLocator('iframe[title*="pin"]');
    await pinFrame.getByPlaceholder('123').fill('123');
    
    // Click "Redeem" button
    await page.getByRole('button', { name: 'Redeem' }).click();
}

async function enterSchemeDetails(page) {
    // Click on "Scheme" button
    await page.getByRole('button', { name: 'Credit or debit card' }).click();
    
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle')
    
    // Find iframe and fill "Card number" field
    const cardNumberFrame = await page.getByRole('region[name="giftcard-container"i]').frameLocator('iframe[title*="card number"]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('4166 6766 6766 6746');

    // Find iframe and fill "Expiry date" field
    const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
    await expiryDateFrame.getByPlaceholder('MM/YY').fill('03/30');

    // Find iframe for CVC
    const cvcFrame = await page.getByRole('region[name="Credit or debit card"i]').frameLocator('iframe[title*="security code"]');

    // Fill "CVC / CVV" field
    await cvcFrame.getByPlaceholder('3 digits').fill('737');
   
    // Find and fill "Name on card" field - Note: this field is not contained within an iframe
    await page.getByPlaceholder('J. Smith').fill('J. Smith');
}