// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Card and donate', async ({ page }) => {
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

    // Click "Pay" button and go to Giving component
    const payButton = page.locator('text="Pay €100.00"');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // Wait for load event
    await page.waitForLoadState('load');
    
    // Click "3.00" amount button
    await page.getByText('3.00').click();
    
    // Click "Donate" button
    await page.getByText('Donate').click();

    await expect(page.locator('text="Thank you for your donation!"')).toBeVisible();
});
