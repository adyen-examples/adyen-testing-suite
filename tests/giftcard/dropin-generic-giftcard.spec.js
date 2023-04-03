// @ts-check
const { test, expect } = require('@playwright/test');

test('Dropin Generic Giftcard', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Giftcard Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Enter giftcard #1 // 110 EUR
    await enterGiftcardDetails(page);

    // Enter giftcard #2 // 60 EUR
    await enterGiftcardDetails(page);

    // Enter giftcard #3 // 10 EUR (final payment)
    await enterGiftcardDetails(page);
    
    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page.locator('text="Return Home"')).toBeVisible();
});

async function enterGiftcardDetails(page) {
    // Click "Credit or debit card"
    const radioButton = await page.getByRole('radio', { name: 'Generic GiftCard' });
    if (await radioButton.count() === 0) {
        // Click normal button for < Adyen-Web 5.32.x or lower
        await page.getByRole('button', { name: 'Generic GiftCard' }).click();
    }
    else {
        // Click radio button for > Adyen-Web 5.33.x or higher
        await radioButton.click();
    }
    
    // Find iframe and fill "Card number" field
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('6364530000000000');

    // Find iframe and fill "Pin" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card security code"i]');
    await expiryDateFrame.getByPlaceholder('123').fill('123');
    
    // Click "Redeem" button
    const redeemButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(redeemButton).toBeVisible();
    await redeemButton.click();
    
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
}