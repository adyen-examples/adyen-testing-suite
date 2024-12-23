// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../../utilities');

test('Dropin Card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "Drop-in"
    await page.getByRole('link', { name: 'Drop-in' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Wait for load event
    await page.waitForLoadState('load');
    
    // Assert that "Cards" is visible
    await expect(page.locator('text="Cards"')).toBeVisible();

    // Click "Cards"
    const radioButton = await page.getByRole('radio', { name: 'Cards' });
    await radioButton.click();

    // Wait for load event
    await page.waitForLoadState('load');

    // Fill card details
    await utilities.fillDropinCardDetailsV6(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();
    
    await expect(page.locator('text="Return Home"')).toBeVisible();
});