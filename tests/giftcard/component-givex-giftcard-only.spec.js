// @ts-check
const { test, expect } = require('@playwright/test');

// Enters three givex giftcards in a row and click pay
test('Dropin Giftcard Component with Givex Giftcard Only', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Giftcard Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Giftcard"
    await page.getByRole('link', { name: 'Giftcard Component' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Enter giftcard #1 // 110 EUR
    await enterGiftcardDetails(page);
    
    // Verify if the visual cue is appended on the frontend
    await expect(page.getByText('Giftcard applied -50.00')).toBeVisible();

    // Enter giftcard #2 // 60 EUR
    await enterGiftcardDetails(page);

    // Enter giftcard details #3 // 10 EUR (final payment)
    await enterGiftcardDetails(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.getByText('Return Home')).toBeVisible();
});

async function enterGiftcardDetails(page) {
    // Click on "Add Giftcard"
    await page.getByRole('button', { name: 'Add Giftcard' }).click();

    // Find iframe and fill "Card number" field
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('6036280000000000000');

    // Find iframe and fill "Pin" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card security code"i]');
    await expiryDateFrame.getByPlaceholder('123').fill('123');
    
    // Click "Redeem" button
    await page.getByRole('button', { name: 'Redeem' }).click();
}