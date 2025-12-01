// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../../../utilities');

test('components card success', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Components Individual payment' }).click();
    await page.getByRole('link', { name: 'card Card' }).click();

    // Wait for load event
    await page.waitForLoadState('load');
    
    // Fill card details
    await utilities.fillComponentCardDetailsV6(page);

    // Click "Pay" button
    await page.getByRole('button', { name: 'Pay €' }).click();
    
    await page.getByRole('link', { name: 'Return to demo types' }).click();
});
