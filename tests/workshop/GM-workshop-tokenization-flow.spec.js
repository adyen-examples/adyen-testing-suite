// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

/** @typedef {import('@playwright/test').Page} Page */
/** @typedef {import('@playwright/test').Response} Response */

test.describe('Workshop - Subscription Tokenization Flow', () => {
    // The application stores one subscription token in shared server memory.
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await goToSubscriptions(page);
        const createSubscriptionButton = page.getByRole('button', { name: 'Create Subscription' });
        if (!(await createSubscriptionButton.isDisabled())) {
            return;
        }

        // Clear any token left by a previous test run.
        await expect(page.getByRole('button', { name: 'Charge Subscription' })).toBeEnabled();
        await cancelSubscription(page);
    });

    test('creates a subscription and charges it', async ({ page }) => {
        await createSubscription(page);
        await chargeSubscription(page);
    });

    test('creates and cancels a subscription', async ({ page }) => {
        await createSubscription(page);
        await cancelSubscription(page);
    });

    test('creates, charges, and cancels a subscription', async ({ page }) => {
        await createSubscription(page);
        await chargeSubscription(page);
        await cancelSubscription(page);
    });

    test('cannot charge a subscription after cancelling it', async ({ page }) => {
        await createSubscription(page);
        await chargeSubscription(page);
        await cancelSubscription(page);

        // The UI disables charging without a token, so verify the backend response directly.
        const response = await page.request.post('/api/subscription-payment');
        expect(response.status()).toBe(409);
    });
});

/**
 * @param {Page} page
 */
async function createSubscription(page) {
    // Open subscription checkout and select the card payment method.
    await goToSubscriptions(page);
    await page.getByRole('button', { name: 'Create Subscription' }).click();
    await expect(page).toHaveURL(/\/checkout\?flow=subscription(?:&|$)/);

    await page.getByRole('radio', { name: 'Credit or debit card' }).click();
    await utilities.fillWorkshopCardDetailsV641(page);

    // Wait for the zero-value tokenization request to complete.
    const createResponsePromise = page.waitForResponse(response =>
        isPostTo(response, '/api/subscription-create')
    );
    await page.getByRole('button', { name: /Save details/i }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/subscriptions\/result(?:[?#]|$)/);
    await expect(page.getByText('The subscription was created successfully.', { exact: true })).toBeVisible();

    // Give the authorization webhook time to store the subscription token.
    await page.waitForTimeout(500);
    // Return to the subscription controls after checkout.
    await goToSubscriptions(page);
}

/**
 * @param {Page} page
 */
async function goToSubscriptions(page) {
    await page.goto('/');
    // Use the workshop navigation link to reach subscriptions.
    await page.getByRole('link', { name: 'Go to subscriptions' }).click();
    await expect(page).toHaveURL(/\/subscriptions(?:[?#]|$)/);
}

/**
 * @param {Page} page
 */
async function returnHomeFromSubscriptionsResult(page) {
    // Return home before starting the next subscription operation.
    const returnHomeButton = page.getByRole('link', { name: 'Return Home' });
    await expect(returnHomeButton).toBeVisible();
    await returnHomeButton.click();
    await expect(page).toHaveURL(/\/$/);
}

/**
 * @param {Page} page
 */
async function chargeSubscription(page) {
    await goToSubscriptions(page);

    // Confirm the charge request succeeds before checking its result page.
    const paymentResponsePromise = page.waitForResponse(response =>
        isPostTo(response, '/api/subscription-payment')
    );
    await page.getByRole('button', { name: 'Charge Subscription' }).click();
    const paymentResponse = await paymentResponsePromise;
    expect(paymentResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/subscriptions\/result(?:[?#]|$)/);
    await returnHomeFromSubscriptionsResult(page);
}

/**
 * @param {Page} page
 */
async function cancelSubscription(page) {
    await goToSubscriptions(page);

    // Confirm the cancellation request succeeds before checking its result page.
    const cancelResponsePromise = page.waitForResponse(response =>
        isPostTo(response, '/api/subscription-cancel')
    );
    await page.getByRole('button', { name: 'Cancel Subscription' }).click();
    const cancelResponse = await cancelResponsePromise;
    expect(cancelResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/subscriptions\/result(?:[?#]|$)/);
    await expect(page.getByText('Your subscription has been cancelled.', { exact: true })).toBeVisible();
}

/**
 * @param {Response} response
 * @param {string} pathname
 * @returns {boolean}
 */
function isPostTo(response, pathname) {
    return response.request().method() === 'POST' &&
        new URL(response.url()).pathname === pathname;
}