// @ts-check
const { test, expect } = require('@playwright/test');

// Enters three givex giftcards in a row and click pay
test('Gift Card Component with Givex Giftcard Invalid', async ({ page }) => {
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

    // Enter invalid giftcard 
    await enterInvalidGiftcardDetails(page);
    
    // Verify if the visual cue (error message) is appended on the frontend
    await expect(page.getByText(/Invalid gift card/)).toBeVisible();
});


async function enterInvalidGiftcardDetails(page) {
    // Click on "Add Giftcard"
    await page.getByRole('button', { name: 'Redeem Gift Card' }).click();

    // Find iframe and fill "Card number" field
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('6036281000000000000');

    // Find iframe and fill "Pin" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card security code"i]');
    await expiryDateFrame.getByPlaceholder('123').fill('123');
    
    // Click "Redeem" button
    await page.getByRole('button', { name: 'Redeem' }).click();
}