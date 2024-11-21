// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../../utilities');

test('Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

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
    await utilities.fillComponentCardDetailsV6(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.locator('text="Return Home"')).toBeVisible();
});
