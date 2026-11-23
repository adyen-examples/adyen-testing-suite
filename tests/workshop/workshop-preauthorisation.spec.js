// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

// Workshop - Pre-Authorisation: pre-authorise, adjust the amount, capture
// Endpoints: /api/preauthorisation, /api/modify-amount, /api/capture
const PREVIEW_URL = '/preview?type=preauthorisation';
const CURRENCY = 'EUR';
const ADJUSTED_AMOUNT = 6600; // 66.00

test('Workshop - Pre-Authorisation - Pre-authorise, adjust the amount and capture', async ({ page, request }) => {
    test.setTimeout(2 * 60 * 1000);

    // Fail fast with a clear reason if the endpoints are not implemented yet
    for (const endpoint of ['preauthorisation', 'modify-amount', 'capture']) {
        const probe = await request.post(`/api/${endpoint}`, { data: {} });
        expect(probe.status(), `POST /api/${endpoint} is not implemented in the app (404)`).not.toEqual(404);
    }

    await page.goto(PREVIEW_URL);

    // Cart -> checkout
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    await page.waitForLoadState('load');

    // Read the pre-authorisation response before the app redirects to the result page
    // (the body is no longer readable after a navigation)
    /** @type {any} */
    let preAuthBody = null;
    await page.route('**/api/preauthorisation', async route => {
        const response = await route.fetch();
        try {
            preAuthBody = await response.json();
        } catch (e) {
            preAuthBody = null;
        }
        await route.fulfill({ response });
    });

    // Select "Credit or debit card" and fill in the details
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();
    await page.getByRole('radio', { name: 'Credit or debit card' }).click();
    await page.waitForLoadState('load');
    await utilities.fillDropinCardDetailsV6(page, { nameOnCard: 'Andrés Gustavo Muñoz Dávila' });

    // Click "Pay"
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    const [preAuthResponse] = await Promise.all([
        page.waitForResponse(
            response => response.url().includes('/api/preauthorisation') && response.request().method() === 'POST'
        ),
        payButton.click(),
    ]);

    // 1. Pre-authorisation is accepted
    expect(preAuthResponse.status()).toEqual(200);
    await expect(page.locator('text="Return Home"')).toBeVisible();

    const pspReference = preAuthBody && preAuthBody.pspReference;
    expect(pspReference, 'The /api/preauthorisation response must contain the pspReference').toBeTruthy();

    // 2. Adjust the authorised amount
    const modify = await request.post('/api/modify-amount', {
        data: { pspReference, amount: { currency: CURRENCY, value: ADJUSTED_AMOUNT } },
    });
    expect(modify.ok(), `/api/modify-amount answered ${modify.status()}`).toBeTruthy();

    // 3. Capture the adjusted amount
    const capture = await request.post('/api/capture', {
        data: { pspReference, amount: { currency: CURRENCY, value: ADJUSTED_AMOUNT } },
    });
    expect(capture.ok(), `/api/capture answered ${capture.status()}`).toBeTruthy();

    // Only when recording a video: keep the last page on screen for a few seconds
    if (process.env.RECORD) {
        await page.waitForTimeout(4000);
    }
});
