// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');
const { v4: uuidv4 } = require('uuid');

/**
 * Workshop - Tokenization Flows (README_TOKENIZATION.md)
 *
 * Tests all tokenization flows:
 * Flow 1: /api/subscription-create -> /api/subscription-payment
 * Flow 2: /api/subscription-create -> /api/subscription-cancel
 * Flow 3: /api/subscription-create -> /api/subscription-payment -> /api/subscription-cancel
 * Flow 4: /api/subscription-create -> /api/subscription-payment -> /api/subscription-cancel -> /api/subscription-payment (should fail)
 *
 * Webhooks handled: AUTHORISATION, RECURRING_CONTRACT
 */

// Helper: perform zero-auth via Drop-in UI and return token info
async function createToken(page) {
    await page.goto('/checkout?type=tokenization');
    await page.waitForLoadState('load');
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();

    const radioButton = await page.getByRole('radio', { name: 'Credit or debit card' });
    await radioButton.click();
    await page.waitForLoadState('load');

    await utilities.fillDropinCardDetailsV6(page);

    let pspReference;
    let recurringDetailRef;
    await page.route('**/api/subscription-create', async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        pspReference = body.pspReference;
        recurringDetailRef = body.additionalData
            ? body.additionalData['recurring.recurringDetailReference']
            : null;
        console.log("Zero-auth pspReference:", pspReference);
        console.log("recurringDetailReference:", recurringDetailRef);
        await route.fulfill({ response, json: body });
    });

    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page.locator('text="Return Home"')).toBeVisible();

    return { pspReference, recurringDetailRef };
}

// Helper: simulate RECURRING_CONTRACT webhook to store the token on the server
async function simulateRecurringWebhook(request, pspReference, token) {
    var notificationRequestItem = {
        "eventCode": "RECURRING_CONTRACT",
        "success": "true",
        "eventDate": "2026-06-12T12:00:00+01:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": pspReference,
        "merchantReference": "zero-auth-test",
        "amount": { "value": 0, "currency": "EUR" },
        "additionalData": {
            "recurring.recurringDetailReference": token,
            "recurring.shopperReference": "test-shopper"
        }
    };
    const hmacSignature = await utilities.calculateHmacSignature(notificationRequestItem);
    notificationRequestItem["additionalData"]["hmacSignature"] = "" + hmacSignature + "";

    const resp = await request.post('/webhooks', {
        data: { "live": "false", "notificationItems": [{ "NotificationRequestItem": notificationRequestItem }] }
    });
    expect([200, 202]).toContain(resp.status());
}

// Flow 1: subscription-create -> subscription-payment
test('Tokenization Flow 1: Create Token → Make Payment', async ({ page, request }) => {
    const { pspReference, recurringDetailRef } = await createToken(page);
    const token = recurringDetailRef || ('TOKEN_' + uuidv4().substring(0, 8));

    await simulateRecurringWebhook(request, pspReference, token);

    const payment = await request.post('/api/subscription-payment');
    expect(payment.status()).toEqual(200);
    const result = await payment.json();
    console.log("Flow 1 - Payment result:", result.resultCode);
    expect(result.resultCode).toBeDefined();
});

// Flow 2: subscription-create -> subscription-cancel
test('Tokenization Flow 2: Create Token → Cancel Subscription', async ({ page, request }) => {
    const { pspReference, recurringDetailRef } = await createToken(page);
    const token = recurringDetailRef || ('TOKEN_' + uuidv4().substring(0, 8));

    await simulateRecurringWebhook(request, pspReference, token);

    const cancel = await request.post('/api/subscription-cancel');
    expect(cancel.status()).toEqual(200);
    const result = await cancel.text();
    console.log("Flow 2 - Cancel result:", result);
});

// Flow 3: subscription-create -> subscription-payment -> subscription-cancel
test('Tokenization Flow 3: Create Token → Payment → Cancel', async ({ page, request }) => {
    const { pspReference, recurringDetailRef } = await createToken(page);
    const token = recurringDetailRef || ('TOKEN_' + uuidv4().substring(0, 8));

    await simulateRecurringWebhook(request, pspReference, token);

    const payment = await request.post('/api/subscription-payment');
    expect(payment.status()).toEqual(200);
    const payResult = await payment.json();
    console.log("Flow 3 - Payment result:", payResult.resultCode);
    expect(payResult.resultCode).toBeDefined();

    const cancel = await request.post('/api/subscription-cancel');
    expect(cancel.status()).toEqual(200);
    console.log("Flow 3 - Cancel result:", await cancel.text());
});

// Flow 4: subscription-create -> subscription-payment -> subscription-cancel -> subscription-payment (should fail)
test('Tokenization Flow 4: Create Token → Payment → Cancel → Payment (should fail)', async ({ page, request }) => {
    const { pspReference, recurringDetailRef } = await createToken(page);
    const token = recurringDetailRef || ('TOKEN_' + uuidv4().substring(0, 8));

    await simulateRecurringWebhook(request, pspReference, token);

    const payment1 = await request.post('/api/subscription-payment');
    expect(payment1.status()).toEqual(200);
    console.log("Flow 4 - First payment:", (await payment1.json()).resultCode);

    const cancel = await request.post('/api/subscription-cancel');
    expect(cancel.status()).toEqual(200);
    console.log("Flow 4 - Cancel:", await cancel.text());

    // After cancel, subscription-payment should fail (400 = no token available)
    const payment2 = await request.post('/api/subscription-payment');
    expect(payment2.status()).toEqual(400);
    console.log("Flow 4 - Second payment after cancel returned 400 as expected");
});
