// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');
const { v4: uuidv4 } = require('uuid');

/**
 * Workshop - Pre-Authorisation Flow
 *
 * Flow: /api/preauthorisation -> /api/modify-amount -> /api/capture -> /api/refund
 *
 * 1. Navigate to the preauthorisation checkout page
 * 2. Select "Credit or debit card" and fill card details
 * 3. Submit the pre-auth payment and capture the real pspReference
 * 4. Verify success result page
 * 5. Adjust the authorisation amount to 66 USD via /api/modify-amount
 * 6. Capture the payment via /api/capture
 * 7. Refund the payment via /api/refund
 * 8. Simulate webhooks (AUTHORISATION, CAPTURE, REFUND)
 */
test('Workshop - PreAuth: Authorise, Adjust, Capture, Refund', async ({ page, request }) => {
    // Step 1: Navigate to the preauthorisation checkout
    await page.goto('/checkout?type=preauthorisation');

    // Step 2: Wait for Drop-in to load and select "Credit or debit card"
    await page.waitForLoadState('load');
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();

    const radioButton = await page.getByRole('radio', { name: 'Credit or debit card' });
    await radioButton.click();
    await page.waitForLoadState('load');

    // Step 3: Fill card details and submit, capturing the real pspReference (Adyen.Web v6 Drop-in)
    await utilities.fillDropinCardDetailsV6(page);

    // Intercept the API response to capture pspReference before page navigates
    let pspReference;
    await page.route('**/api/preauthorisation', async (route) => {
        const response = await route.fetch();
        const body = await response.json();
        pspReference = body.pspReference;
        console.log("PreAuth pspReference:", pspReference);
        await route.fulfill({ response, json: body });
    });

    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();
    await payButton.click();

    // Step 4: Verify success - the pre-auth payment should be authorised
    await expect(page.locator('text="Return Home"')).toBeVisible();

    // Step 5: Adjust the authorisation amount to 66 USD using real pspReference
    const modifyResponse = await request.post('/api/modify-amount', {
        data: {
            "pspReference": pspReference,
            "amount": 6600
        }
    });
    expect(modifyResponse.status()).toEqual(200);
    console.log("Modify amount response:", JSON.stringify(await modifyResponse.json()));

    // Step 6: Capture the payment for 66 USD
    const captureResponse = await request.post('/api/capture', {
        data: {
            "pspReference": pspReference,
            "amount": 6600
        }
    });
    expect(captureResponse.status()).toEqual(200);
    console.log("Capture response:", JSON.stringify(await captureResponse.json()));

    // Step 7: Refund the captured payment
    const refundResponse = await request.post('/api/refund', {
        data: {
            "pspReference": pspReference,
            "amount": 6600
        }
    });
    expect(refundResponse.status()).toEqual(200);
    console.log("Refund response:", JSON.stringify(await refundResponse.json()));

    // Step 8: Simulate webhooks to verify webhook handling
    var authNotification = {
        "eventCode": "AUTHORISATION",
        "success": "true",
        "eventDate": "2026-06-12T12:00:00+01:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": pspReference,
        "merchantReference": "preauth-test",
        "amount": { "value": 1000, "currency": "USD" }
    };
    var hmacSignature = await utilities.calculateHmacSignature(authNotification);
    authNotification["additionalData"] = { "hmacSignature": "" + hmacSignature + "" };

    var webhookResponse = await request.post('/webhooks', {
        data: { "live": "false", "notificationItems": [{ "NotificationRequestItem": authNotification }] }
    });
    expect([200, 202]).toContain(webhookResponse.status());

    var captureNotification = {
        "eventCode": "CAPTURE",
        "success": "true",
        "eventDate": "2026-06-12T12:02:00+01:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase(),
        "originalReference": pspReference,
        "merchantReference": "capture-test",
        "amount": { "value": 6600, "currency": "USD" }
    };
    hmacSignature = await utilities.calculateHmacSignature(captureNotification);
    captureNotification["additionalData"] = { "hmacSignature": "" + hmacSignature + "" };

    webhookResponse = await request.post('/webhooks', {
        data: { "live": "false", "notificationItems": [{ "NotificationRequestItem": captureNotification }] }
    });
    expect([200, 202]).toContain(webhookResponse.status());

    var refundNotification = {
        "eventCode": "REFUND",
        "success": "true",
        "eventDate": "2026-06-12T12:03:00+01:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase(),
        "originalReference": pspReference,
        "merchantReference": "refund-test",
        "amount": { "value": 6600, "currency": "USD" }
    };
    hmacSignature = await utilities.calculateHmacSignature(refundNotification);
    refundNotification["additionalData"] = { "hmacSignature": "" + hmacSignature + "" };

    webhookResponse = await request.post('/webhooks', {
        data: { "live": "false", "notificationItems": [{ "NotificationRequestItem": refundNotification }] }
    });
    expect([200, 202]).toContain(webhookResponse.status());
});
