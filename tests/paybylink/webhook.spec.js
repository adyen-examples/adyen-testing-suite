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

    // Verify status code 
    expect(notifications.status()).toEqual(200);

    // Verify body response 
    notifications.text()
        .then(value => {expect(value).toEqual("[accepted]");} );
});

