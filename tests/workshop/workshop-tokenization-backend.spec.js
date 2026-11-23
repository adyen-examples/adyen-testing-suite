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

// Tokenization, backend only (no browser)
test('POST /webhooks accepts a RECURRING_CONTRACT with a recurringDetailReference', async ({ request }) => {
    const item = buildItem('RECURRING_CONTRACT', { amount: { value: 0, currency: 'EUR' } });
    const response = await sendWebhook(request, item, {
        'recurring.recurringDetailReference': 'TEST_TOKEN',
        'recurring.shopperReference': 'workshop-shopper',
    });
    expect([200, 202]).toContain(response.status());
});

test('POST /webhooks accepts an AUTHORISATION with a stored payment method id', async ({ request }) => {
    const item = buildItem('AUTHORISATION', { amount: { value: 0, currency: 'EUR' } });
    const response = await sendWebhook(request, item, { 'tokenization.storedPaymentMethodId': 'TEST_TOKEN' });
    expect([200, 202]).toContain(response.status());
});

test('POST /webhooks rejects a RECURRING_CONTRACT with an invalid HMAC signature', async ({ request }) => {
    const item = buildItem('RECURRING_CONTRACT', { amount: { value: 0, currency: 'EUR' } });
    const response = await sendWebhook(request, item, { 'recurring.recurringDetailReference': 'TEST_TOKEN' }, false);
    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
});

test('/makepaymentwithtoken/{token} exists and does not accept an invalid token', async ({ request }) => {
    const response = await request.get('/makepaymentwithtoken/not-a-real-token');
    expect(response.status()).not.toEqual(404);
    expect(response.status()).not.toEqual(200);
});
