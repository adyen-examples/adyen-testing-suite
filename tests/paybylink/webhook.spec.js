// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

// test webhook is successfully delivered
test('Webhook Notification', async ({ request }) => {

    var notificationRequestItem = {
        "eventCode":"AUTHORISATION",
        "success":"true",
        "eventDate":"2019-06-28T18:03:50+01:00",
        "merchantAccountCode":"YOUR_MERCHANT_ACCOUNT",
        "pspReference": "7914073381342284",
        "merchantReference": "YOUR_REFERENCE",
        "amount": {
            "value":1130,
            "currency":"EUR"
        }
    };

    // calculate signature from payload
    const hmacSignature = await utilities.calculateHmacSignature(notificationRequestItem);
    // add hmacSignature to 'additionalData'
    // note: add paymentLinkId for Pay by Link
    notificationRequestItem["additionalData"] = 
    {"hmacSignature" : ""+hmacSignature+"", paymentLinkId : "PL1234567890"}

    // POST webhook
    const notifications = await request.post(`/api/webhooks/notifications`, {
        data: {
            "live": "false",
            "notificationItems":[
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

