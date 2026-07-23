// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

// The secured card fields iframe can take longer than the default action timeout
// to finish origin validation on a fresh client key configuration.
test.use({ actionTimeout: 45000 });

// Tokenization Module - Token Create flow.
// A shopper enters their card on a zero-auth (EUR 0) payment which tokenizes the card.
// The resulting `recurringDetailReference` (the token) is delivered asynchronously via the
// RECURRING_CONTRACT webhook - this test only covers the "create token" leg of the flow
// (the shopper-facing part), not the subsequent server-to-server token payment.
test('Workshop - Tokenization: Create Token', async ({ page }) => {
    await page.goto('/');

    // Select "Start subscription"
    await expect(page.locator('text="Start subscription"')).toBeVisible();
    await page.getByRole('link', { name: 'Start subscription' }).click();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Wait for load event
    await page.waitForLoadState('load');

    // Assert that "Credit or debit card" is visible
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();

    // Click "Credit or debit card"
    const radioButton = await page.getByRole('radio', { name: 'Credit or debit card' });
    await radioButton.click();

    // Wait for load event
    await page.waitForLoadState('load');

    // Fill card details. This Adyen Web SDK version renders each secure field inside two
    // `<iframe>`s (a hidden bot-decoy plus the real one) with exact titles "Card number",
    // "Expiry date" and "Security code" - filter to the visible frame.
    await page.frameLocator('iframe[title="Card number"] >> visible=true')
        .getByRole('textbox', { name: 'Card number' }).fill(utilities.CARD_NUMBER);
    await page.frameLocator('iframe[title="Expiry date"] >> visible=true')
        .getByRole('textbox', { name: 'Expiry date' }).fill(utilities.EXPIRY_DATE);
    await page.frameLocator('iframe[title="Security code"] >> visible=true')
        .getByRole('textbox').fill(utilities.CVC);
    await page.getByPlaceholder('J. Smith').fill(utilities.NAME_ON_CARD);

    // Click "Pay" button - this submits the zero-auth request to /api/subscription-create
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // A successful zero-auth authorisation redirects to the success result page.
    await expect(page.locator('text="Return Home"')).toBeVisible();
});
