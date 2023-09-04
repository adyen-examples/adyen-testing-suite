// @ts-check
const { test, expect } = require('@playwright/test');

test('Dropin Givex Gift Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Gift Card Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Enter giftcard
    await enterGiftcardDetails(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page.locator('text="Return Home"')).toBeVisible();
});

async function enterGiftcardDetails(page) {
    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Click "Givex"
    const radioButton = await page.getByRole('radio', { name: 'Givex' });
    await radioButton.click();
    
    // Find iframe and fill "Card number" field
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('6032610000000005');

    // Find iframe and fill "Pin" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card security code"i]');
    await expiryDateFrame.getByPlaceholder('123').fill('123');
    
    // Click "Redeem" button
    const redeemButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(redeemButton).toBeVisible();
    await redeemButton.click();
}