// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Card and Cancel', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Adyen Giving Demo/);

    // Select "Card"
    await page.getByRole('link', { name: 'Card', exact: true }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Wait for load event
    await page.waitForLoadState('load');

    // Assert that "Card number" is visible within iframe
    await expect(page.locator('text="Card number"')).toBeVisible();
    
    // Fill card details
    await utilities.fillComponentCardDetails(page, { cardNumber: '5555 3412 4444 1115'});

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // Click "Not now" button
    await page.getByText('Not now').click();

    await expect(page.locator('text="Donate"')).toBeHidden();
});
