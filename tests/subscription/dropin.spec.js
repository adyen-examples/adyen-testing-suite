// @ts-check
const { test, expect } = require('@playwright/test');

// SEPA payment
test('Dropin SEPA', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("Adyen Subscription Shopper View");
    await expect(page.locator('text="SHOPPER VIEW"')).toBeVisible();

    // Select "Drop-in"
    await page.locator('text="Drop-in"').click();
    await expect(page.locator('text="SUBSCRIPTION DETAILS"')).toBeVisible();

    // Click "Continue to confirm subscription"
    await page.click('text="Continue to confirm subscription"');
    await expect(page.locator('text="Card number"')).toBeVisible();

    // Select "Credit or debit card"
    const cardNumberField = await getByPlaceholderAsync(page, '1234 5678 9012 3456');
    cardNumberField.fill('4166 6766 6766 6746');
    
    const expiryDateField = await getByPlaceholderAsync(page, 'MM/YY');
    expiryDateField.fill('03/30');

    /*const expiryDateField = await contentFrame.getByPlaceholder('MM/YY')
    const cvcField = await contentFrame.getByPlaceholder('3 digits')
    const nameOnCardField = await contentFrame.getByPlaceholder('J. Smith')

    // Fill using a test card number
    //await cardNumberField.fill('4166 6766 6766 6746');
    await expiryDateField.fill('03/30');
    await cvcField.fill('737');
    await nameOnCardField.fill('J. Smith');*/

    // Click "Confirm preauthorization"
    const confirmElement = await page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(confirmElement).toBeVisible();
    await confirmElement.click();

    await expect(page.locator('text="Return to Shopper View"')).toBeVisible();
});

async function getByPlaceholderAsync(page, name)
{
    const iframeSelector = await page.waitForSelector("iframe");
    const contentFrame = await iframeSelector.contentFrame();
    return contentFrame.getByPlaceholder(name)
}
