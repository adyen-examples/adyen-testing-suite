// @ts-check
const { test, expect } = require('@playwright/test');

test('iDEAL', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // select iDEAL
    await page.locator('text="iDEAL"').click();
    await expect(page.locator('text="Cart"')).toBeVisible();

    // click "Continue to checkout"
    await page.click('text="Continue to checkout"');
    await expect(page.locator('text="Select your bank"')).toBeVisible();

//  await page.locator("input[data-fieldtype='encryptedCardNumber']").type("1234");
//  await page.locator('input[data-fieldtype="encryptedCardNumber"]').type('1234');

//  await page.locator('button:has-text("Pay €10.00")').click();

//  let listItems = page.locator('li[class="adyen-checkout__dropdown__element"]');
//  console.log(listItems.nth(1).click());


});
