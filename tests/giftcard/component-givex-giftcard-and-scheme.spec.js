// @ts-check
const { test, expect } = require('@playwright/test');

/** Card number. */
const CARD_NUMBER = '4111 1111 1111 1111';

/** Expiry Date. */
const EXPIRY_DATE = '03/30';

/** CVC number. */
const CVC = '737';

/** Cardholder name. */
const NAME_ON_CARD = 'J. Smith';

// Test a giftcard and use a card to finalize the payment
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

    // Enter giftcard  // outstanding 110 EUR
    await enterGiftcardDetails(page);
    
    // Verify if the visual cue is appended on the frontend
    await expect(page.getByText(/Gift card applied/)).toBeVisible();

    // Enter card scheme details // outstanding 60 EUR (final payment)
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
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill('6036280000000000000');

    // Find iframe and fill "Pin" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured gift card security code"i]');
    await expiryDateFrame.getByPlaceholder('123').fill('123');
    
    // Click "Redeem" button
    await page.getByRole('button', { name: 'Redeem' }).click();
}

async function enterSchemeDetails(page) {
    // Click on "Scheme" button
    await page.getByRole('button', { name: 'Credit or debit card' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle')

    // Find iframe and fill "Card number" field
    const cardNumberFrame = page.frameLocator('internal:attr=[title="Iframe for secured card number"i]');
    await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill(CARD_NUMBER);

    // Find iframe and fill "Expiry date" field
    const expiryDateFrame = page.frameLocator('internal:attr=[title="Iframe for secured card expiry date"i]');
    await expiryDateFrame.getByPlaceholder('MM/YY').fill(EXPIRY_DATE);

    // Find iframe and fill "CVC / CVV" field
    const cvcFrame = page.frameLocator('internal:attr=[title="Iframe for secured card security code"i]');
    await cvcFrame.getByPlaceholder('3 digits').fill(CVC);

    // Find and fill "Name on card" field - Note: this field is not contained within an iframe
    await page.getByPlaceholder('J. Smith').fill(NAME_ON_CARD);
}