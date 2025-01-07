// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../../utilities');

test('Dropin Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo Advanced/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

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

    // Fill card details
    await utilities.fillDropinCardDetails(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.locator('text="Return Home"')).toBeVisible();
});