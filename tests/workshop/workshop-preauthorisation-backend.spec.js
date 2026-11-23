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

// Pre-authorisation, backend only (no browser)
const endpoints = ['preauthorisation', 'modify-amount', 'capture', 'cancel', 'refund'];

for (const endpoint of endpoints) {
    test(`POST /api/${endpoint} exists`, async ({ request }) => {
        const response = await request.post(`/api/${endpoint}`, { data: {} });
        expect(response.status()).not.toEqual(404);
    });
}

const events = ['AUTHORISATION', 'AUTHORISATION_ADJUSTMENT', 'CAPTURE', 'CANCELLATION', 'REFUND'];

for (const eventCode of events) {
    test(`POST /webhooks accepts a signed ${eventCode}`, async ({ request }) => {
        const item = buildItem(eventCode, { originalReference: '7914073381342284' });
        const response = await sendWebhook(request, item);
        expect([200, 202]).toContain(response.status());
    });
}
