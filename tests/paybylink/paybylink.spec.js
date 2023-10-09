const { test, expect } = require('@playwright/test');

// Create Pay By Link and perform payment
test('Pay By Link', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Pay By Link Demo/);

    // Select 'Amount' and fill field
    const amountField = page.locator('#amount');
    await amountField.fill('4200');

    // Select 'Reference' and fill field with a `uniqueReference`
    const uniqueReference = 'your-unique-guid-reference';
    const referenceField = page.locator('#reference');
    await referenceField.fill(uniqueReference);

    // Create payment link
    await page.getByRole('button', { name: 'Create!' }).click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Ensure the link with `uniqueReference` is created
    await expect(page.getByText(uniqueReference).first()).toBeVisible();

    const link = await page.locator('text=/PL/').first();
    await link.click();

    // Wait for network state to be idle
    await page.waitForLoadState('networkidle');

    // Check Pay by link text
    await page.getByText(/Pay by link/);
});