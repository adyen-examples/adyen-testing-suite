// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

const buildItem = (eventCode, extra = {}) => ({
    eventCode,
    success: 'true',
    eventDate: '2024-01-01T12:00:00+01:00',
    merchantAccountCode: 'YOUR_MERCHANT_ACCOUNT',
    pspReference: '7914073381342284',
    merchantReference: 'YOUR_REFERENCE',
    amount: { value: 1000, currency: 'EUR' },
    ...extra,
});

const sendWebhook = async (request, item, additionalData = {}, signed = true) => {
    const hmacSignature = signed ? await utilities.calculateHmacSignature(item) : 'invalid-signature';
    return request.post('/webhooks', {
        data: {
            live: 'false',
            notificationItems: [{ NotificationRequestItem: { ...item, additionalData: { ...additionalData, hmacSignature } } }],
        },
    });
};

// Advanced flow, backend only (no browser)
test('POST /api/paymentMethods returns the card payment method', async ({ request }) => {
    const response = await request.post('/api/paymentMethods');
    expect(response.status()).toEqual(200);

    const body = await response.json();
    const types = body.paymentMethods.map(method => method.type);
    expect(types).toContain('scheme');
});

test('POST /webhooks accepts an AUTHORISATION with a valid HMAC signature', async ({ request }) => {
    const response = await sendWebhook(request, buildItem('AUTHORISATION'));
    expect([200, 202]).toContain(response.status());
});

test('POST /webhooks rejects an AUTHORISATION with an invalid HMAC signature', async ({ request }) => {
    const response = await sendWebhook(request, buildItem('AUTHORISATION'), {}, false);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
});
