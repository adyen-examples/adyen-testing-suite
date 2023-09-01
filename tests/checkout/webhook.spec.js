// @ts-check
const { test, expect } = require('@playwright/test');
const dotenv = require('dotenv');
const { default: HmacValidator } = require('@adyen/api-library/lib/src/utils/hmacValidator');

dotenv.config();

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
    const hmacSignature = await calculateHmacSignature(notificationRequestItem);
    // add hmacSignature to 'additionalData'
    notificationRequestItem["additionalData"] = {"hmacSignature" : ""+hmacSignature+""}

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

// calculate HMAC signature using Adyen NodeJS library
async function calculateHmacSignature(notificationRequestItem) {

    const hmacKey = process.env.ADYEN_HMAC_KEY;

    if(hmacKey === undefined) {
        throw Error("HMAC_KEY is undefined")
    }

    const expectedSign = new HmacValidator().calculateHmac(notificationRequestItem, hmacKey);
    
    return expectedSign;
}