// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

test('Workshop - Advanced Flow Payment', async ({ page }) => {
    await page.goto('/');

    // Select "Drop-in"
    await 
    expect(page.locator('text="Start shopping"')).toBeVisible();
    await page.getByRole('link', { name: 'Start shopping' }).click();

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
    await utilities.fillDropinCardDetailsV6(page, { nameOnCard: 'Andrés Gustavo Muñoz Dávila' });

    // Click "Pay" button
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // "Return Home" is shown for every result, so check that the payment really succeeded
    await expect(page).toHaveURL(/\/result\/success/);
    await expect(page.getByText('Your order has been successfully placed.')).toBeVisible();

    // Only when recording a video: keep the success page on screen for a few seconds
    if (process.env.RECORD) {
        await page.waitForTimeout(4000);
    }
});