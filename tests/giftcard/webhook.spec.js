// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

// test webhook is successfully delivered
test('Webhook Notification', async ({ request }) => {

    var notificationRequestItem = {
        "amount": {
            "currency": "EUR",
            "value": 11000
        },
        "eventCode": "ORDER_CLOSED",
        "eventDate": "2023-05-16T10:00:00+02:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "merchantReference": "YOUR_REFERENCE",
        "pspReference": "VXXXXX2XLBX8N82",
        "reason": "",
        "success": "true"
    };

    // calculate signature from payload
    const hmacSignature = await utilities.calculateHmacSignature(notificationRequestItem);
    // add 'additionalData' with hmacSignature 
    notificationRequestItem["additionalData"] = {
        "hmacSignature": "" + hmacSignature + "",
        "order-2-paymentMethod": "visa",
        "order-3-paymentMethod": "genericgiftcard",
        "order-2-pspReference": "X3XXXXPCN8NKGKXX",
        "order-2-paymentAmount": "EUR 50.00",
        "order-3-pspReference": "XXXXXX6VZ5PFWRXX",
        "order-3-paymentAmount": "EUR 10.00",
        "order-1-pspReference": "XXXXXXW96CLZNNXX",
        "order-1-paymentAmount": "EUR 50.00",
        "order-1-paymentMethod": "genericgiftcard"
    }

    // POST webhook
    const notifications = await request.post(`/api/webhooks/notifications`, {
        data: {
            "live": "false",
            "notificationItems": [
                {
                    "NotificationRequestItem": notificationRequestItem
                }
            ]
        }
    });

    var notifications_status = notifications.status();
    
    if (notifications_status === 202) {
        // Verify status code 202
        expect(notifications.status()).toEqual(202);

        // Verify empty response body
        notifications.text()
            .then(value => { expect(value).toEqual(""); });
    } else {
        // Verify legacy webhook acknowledgment (status code 200)
        expect(notifications.status()).toEqual(200);

        // Verify legacy webhook acknowledgment (response body `[accepted]`)
        notifications.text()
            .then(value => { expect(value).toEqual("[accepted]"); });
    }
});

