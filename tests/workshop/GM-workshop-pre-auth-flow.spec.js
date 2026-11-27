// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

/** @typedef {import('@playwright/test').Page} Page */
/** @typedef {import('@playwright/test').Response} Response */

test.describe('Workshop - Preauthorisation Flow', () => {
    test.setTimeout(300000);

    // The application stores one preauthorisation in shared server memory.
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await resetPreauthorisation(page);
    });

    test('creates and captures a preauthorisation', async ({ page }) => {
        await createPreauthorisation(page);
        await capturePreauthorisation(page);
    });

    test('creates, adjusts, and captures a preauthorisation', async ({ page }) => {
        await createPreauthorisation(page);
        await adjustPreauthorisation(page);
        await capturePreauthorisation(page);
    });

    test('cannot cancel a preauthorisation after capture', async ({ page }) => {
        await createPreauthorisation(page);
        await adjustPreauthorisation(page);
        await capturePreauthorisation(page);

        await expectConflict(page, '/api/cancel');
    });

    test('creates, adjusts, captures, and refunds a preauthorisation', async ({ page }) => {
        await createPreauthorisation(page);
        await adjustPreauthorisation(page);
        await capturePreauthorisation(page);
        await refundPreauthorisation(page);

        await expect(page.getByRole('button', { name: 'Create Preauthorisation' })).toBeEnabled();
    });

    test('cannot cancel a preauthorisation after refund', async ({ page }) => {
        await createPreauthorisation(page);
        await adjustPreauthorisation(page);
        await capturePreauthorisation(page);
        await refundPreauthorisation(page);

        await expectConflict(page, '/api/cancel');
    });

    test('creates and cancels a preauthorisation', async ({ page }) => {
        await createPreauthorisation(page);
        await cancelPreauthorisation(page);

        await expect(page.getByRole('button', { name: 'Create Preauthorisation' })).toBeEnabled();
    });

    test('cannot capture a preauthorisation after cancellation', async ({ page }) => {
        await createPreauthorisation(page);
        await cancelPreauthorisation(page);

        await expectConflict(page, '/api/capture');
    });

    test('cannot refund a preauthorisation before capture', async ({ page }) => {
        await createPreauthorisation(page);

        await expectConflict(page, '/api/refund');
    });

    test('can capture a preauthorisation after a refund is rejected before capture', async ({ page }) => {
        await createPreauthorisation(page);
        await expectConflict(page, '/api/refund');
        await capturePreauthorisation(page);
    });
});

/**
 * @param {Page} page
 */
async function resetPreauthorisation(page) {
    const response = await page.request.post('/api/preauthorisation/reset');
    expect(response.ok()).toBeTruthy();

    await goToPreauthorisation(page);
    await expect(
        page.getByRole('button', { name: 'Create Preauthorisation' })
    ).toBeEnabled();
}

/**
 * @param {Page} page
 */
async function createPreauthorisation(page) {
    await goToPreauthorisation(page);
    await page.getByRole('button', { name: 'Create Preauthorisation' }).click();
    await expect(page).toHaveURL(/\/checkout\?flow=preauthorisation(?:&|$)/);

    await page.getByRole('radio', { name: 'Credit or debit card' }).click();
    await utilities.fillWorkshopCardDetailsV641(page);

    const createResponsePromise = page.waitForResponse(response =>
        isPostTo(response, '/api/preauthorisation')
    );
    await page.getByRole('button', { name: /Pay/i }).click();
    const createResponse = await createResponsePromise;
    expect(createResponse.ok()).toBeTruthy();

    await expect(page).toHaveURL(/\/preauthorisation(?:[?#]|$)/);
    await expect(page.locator('#last-webhook-event')).toHaveText('AUTHORISATION');
    await expect(page.locator('#last-operation-result')).toHaveText('Preauthorised: $250');
    await expect(page.locator('#preauthorisation-psp-reference')).not.toHaveText('Not available yet');
}

/**
 * @param {Page} page
 */
async function goToPreauthorisation(page) {
    await page.goto('/');
    await page.getByRole('link', { name: /Go to Preauthorisation/i }).click();
    await expect(page).toHaveURL(/\/preauthorisation(?:[?#]|$)/);
}

/**
 * @param {Page} page
 */
async function adjustPreauthorisation(page) {
    await submitOperation(
        page,
        page.getByRole('button', { name: 'Adjust To Full Amount ($500)' }),
        '/api/modify-amount',
        /^AUTHORISATION_ADJUSTMENT$/
    );
    await expect(page.locator('#last-operation-result')).toHaveText('Authorization adjusted to $500');
}

/**
 * @param {Page} page
 */
async function capturePreauthorisation(page) {
    await submitOperation(
        page,
        page.getByRole('button', { name: 'Capture', exact: true }),
        '/api/capture',
        /^CAPTURE$/
    );
    await expect(page.locator('#last-operation-result')).toHaveText('Payment captured');
}

/**
 * @param {Page} page
 */
async function cancelPreauthorisation(page) {
    await submitOperation(
        page,
        page.getByRole('button', { name: 'Cancel', exact: true }),
        '/api/cancel',
        /^(CANCELLATION|TECHNICAL_CANCEL)$/
    );
    await expect(page.locator('#last-operation-result')).toHaveText('Authorization cancelled');
}

/**
 * @param {Page} page
 */
async function refundPreauthorisation(page) {
    await submitOperation(
        page,
        page.getByRole('button', { name: 'Refund', exact: true }),
        '/api/refund',
        /^REFUND$/
    );
    await expect(page.locator('#last-operation-result')).toHaveText('Refund submitted');
}

/**
 * @param {Page} page
 * @param {import('@playwright/test').Locator} button
 * @param {string} pathname
 * @param {RegExp} webhookEvent
 */
async function submitOperation(page, button, pathname, webhookEvent) {
    const responsePromise = page.waitForResponse(response => isPostTo(response, pathname));
    await button.click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    // Adyen webhooks can arrive several seconds after the operation is accepted.
    await expect
        .poll(
            async () => await page.locator('#last-webhook-event').textContent(),
            {
                timeout: 90000,
                intervals: [1000, 2000, 5000]
            }
        )
        .toMatch(webhookEvent);
}

/**
 * @param {Page} page
 * @param {string} pathname
 */
async function expectConflict(page, pathname) {
    const response = await page.request.post(pathname);
    expect(response.status()).toBe(409);
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