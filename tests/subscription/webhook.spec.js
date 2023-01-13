// @ts-check
const { test, expect } = require('@playwright/test');

test('Webhook Notification', async ({ request }) => {
    const notifications = await request.post(`/api/webhooks/notifications`, {
        data: {
            "live": "false",
            "notificationItems":[
                {
                    "NotificationRequestItem":{
                        "additionalData":{
                            "hmacSignature":"+JWKfq4ynALK+FFzGgHnp1jSMQJMBJeb87dlph24sXw=",
                            "recurring.recurringDetailReference":"XXXXXXXXX",
                            "recurring.shopperReference": "UniqueShopperReference"
                        },
                        "eventCode":"AUTHORISATION",
                        "success":"true",
                        "eventDate":"2019-06-28T18:03:50+01:00",
                        "merchantAccountCode":"YOUR_MERCHANT_ACCOUNT",
                        "pspReference": "7914073381342284",
                        "merchantReference": "YOUR_REFERENCE",
                        "amount": {
                            "value":0,
                            "currency":"EUR"
                        }
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
