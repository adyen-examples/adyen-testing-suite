// @ts-check
const { test, expect } = require('@playwright/test');

test('Webhook failure', async ({ request }) => {
    const notifications = await request.post(`/api/webhooks/notifications`, {
        data: {
            "live" : "false",
            "notificationItems" : [
                {
                    "NotificationRequestItem" : {
                        "additionalData" : {
                            "order-2-paymentMethod" : "visa",
                            "order-3-paymentMethod" : "genericgiftcard",
                            "order-2-pspReference" : "X3XXXXPCN8NKGKXX",
                            "order-2-paymentAmount" : "EUR 50.00",
                            "order-3-pspReference" : "XXXXXX6VZ5PFWRXX",
                            "order-3-paymentAmount" : "EUR 10.00",
                            "order-1-pspReference" : "XXXXXXW96CLZNNXX",
                            "order-1-paymentAmount" : "EUR 50.00",
                            "hmacSignature" : "INVALID_HMAC_SIGNATURE",
                            "order-1-paymentMethod" : "genericgiftcard"
                        },
                        "amount" : {
                            "currency" : "EUR",
                            "value" : 11000
                        },
                        "eventCode" : "ORDER_CLOSED",
                        "eventDate" : "2023-05-16T10:00:00+02:00",
                        "merchantAccountCode" : "YOUR_MERCHANT_ACCOUNT",
                        "merchantReference" : "YOUR_REFERENCE",
                        "pspReference" : "VXXXXX2XLBX8N82",
                        "reason" : "",
                        "success" : "true"
                    }
                }
            ]
        }
    });

    /// Verify notification is not accepted (invalid HMAC)

    // Status code not 404 (verify webhook is found)
    expect(notifications.status()).not.toEqual(404);

    // Status code not 200 (verify webhook does not accept the notification ie HMAC invalid)
    expect(notifications.status()).not.toEqual(200);

    // Body response does not contain [accepted]
    notifications.text()
        .then(value => {expect(value).not.toEqual("[accepted]");} );
});
