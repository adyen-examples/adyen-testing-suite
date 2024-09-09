// @ts-check
const { test, expect } = require('@playwright/test');

test('iDEAL', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Checkout Demo/);
    await expect(page.locator('text="Select a demo"')).toBeVisible();

    // Select "iDEAL"
    await page.getByRole('link', { name: 'iDEAL' }).click();
    await expect(page.locator('text="Cart"')).toBeVisible();
    
    // Click "Continue to checkout"
    await page.getByRole('link', { name: 'Continue to checkout' }).click();

    // Check if "Continue to iDEAL" button is found
    const ideal2Button = await page.locator('Continue to iDEAL').isVisible();

    if (ideal2Button) {
        // run iDEAL2 flow
        console.log("Running iDEAL 2.0 flow");
        await ideal2(page);
    } else {
        // run iDEAL 1 flow
        console.log("Running legacy iDEAL flow");
        await ideal1(page);
    }

});

// run through the legacy iDEAL flow (including bank selection)
async function ideal1(page) {

    // Click "Select your bank"
    await page.getByPlaceholder('Search...').click();

    // Choose "Test Issuer"
    await page.getByText('Test Issuer', { exact: true }).click();

    // Click "Continue to Test Issuer"
    await page.getByRole('button', { name: 'Continue to Test Issuer' }).click();
    await expect(page.locator('text="iDEAL Issuer Simulation"')).toBeVisible();

    // Click "Continue"  
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('link', { name: 'Return Home' }).click();
}

// run through the iDEAL 2.0 flow (redirect to iDEAL page)
async function ideal2(page) {

    // Click "Continue to iDEAL"
    await page.getByRole('button', { name: 'Continue to iDEAL' }).click();
    await expect(page.locator('text="Scan with your banking app to pay"')).toBeVisible();

    // Click "Select your bank"
    await page.getByRole('button', { name: 'Select your bank' }).click();

    // Click "TESTNL2A"
    await page.getByRole('button', { name: 'TESTNL2A' }).click();
    await expect(page.locator('text="Which test simulation to run?"')).toBeVisible();

    // Click "Success"
    await page.getByRole('button', { name: 'Success' }).click();

    // Click "Continue"  
    await page.getByRole('link', { name: 'Return Home' }).click();
}