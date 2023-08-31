// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Card and donate', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Adyen Giving Demo - Select type/);

    // Select "Card"
    await page.getByRole('link', { name: 'Card', exact: true }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');
    
    // Assert that "Card number" is visible within iframe
    await expect(page.locator('text="Card number"')).toBeVisible();
    
    // Fill card details
    await utilities.fillCardDetails(page);

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // Click Amount button
    await page.getByText('3.00').click();
    await page.getByText('Donate').click();

    await expect(page.locator('text="Thank you for your donation!"')).toBeVisible();
});
