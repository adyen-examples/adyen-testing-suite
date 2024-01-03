const { test, expect } = require('@playwright/test');

// In Person Payments
test('In-person Payments', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    /* 1. Payment Request */
    await page.goto('/');
    
    await expect(page).toHaveTitle(/In-person Payments Demo/);

    await page.getByRole('heading', { name: /Adyen In-person Payment Demo/ })
    await page.getByRole('link', { name: 'Click here to settle the bill for a restaurant' }).click();

    await page.getByText(/Table 1/).click();
    await page.getByRole('button', { name: 'Pay' }).click();
    
    // Mock terminal
    await handleMockTerminalPage(context);

    // Return to cash register page
    await page.getByRole('link', { name: 'Return' }).click(); // Return to cash register page
    
    /* 2. TransactionStatus Request */
    await page.getByText('Table 1').click();
    await page.getByRole('button', { name: 'Transaction Status' }).click();
    await page.getByRole('link', { name: 'Return' }).click(); // Return to cash register page


    /* 3. Reversal Request */
    await page.getByText('Table 1').click();
    await page.getByRole('button', { name: 'Reversal' }).click();
    await page.getByRole('link', { name: 'Return' }).click(); // Return to cash register page
});

async function handleMockTerminalPage(context) {
    const mockTerminalPage = await context.newPage();

    // Visit mock terminal page on localhost:3000
    await mockTerminalPage.goto('http://localhost:3000/');
    await expect(mockTerminalPage).toHaveTitle(/Adyen Mock Terminal-API Application/);

    // Expect `Enter your pin ...` to be visible
    await expect(mockTerminalPage.locator('text=/Enter your pin/')).toBeVisible();

    // Enter pin on mock terminal
    await enterPin(mockTerminalPage);
    
    // Expect `Enter your pin ...` to be hidden
    await expect(mockTerminalPage.locator('text=/Enter your pin/')).toBeHidden();

    // Close page
    await mockTerminalPage.close();
}

// Enter pin on mock terminal page
async function enterPin(mockTerminalPage) {
    await mockTerminalPage.getByRole('button', { name: '1' }).click();
    await mockTerminalPage.getByRole('button', { name: '2' }).click();
    await mockTerminalPage.getByRole('button', { name: '3' }).click();
    await mockTerminalPage.getByRole('button', { name: '4' }).click();
    await mockTerminalPage.getByRole('button', { name: '✓' }).click();
}