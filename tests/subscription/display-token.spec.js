// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

import { v4 as uuidv4 } from 'uuid';


// test RecurringDetailReference is displayed in the Admin panel
test('Display RecurringDetailReference', async ({ request, page }) => {

    var shopperReference = uuidv4();
    var token = uuidv4();

    // send webhook with RECURRING_CONTRACT event
    var notificationRequestItem = {
        "eventCode": "RECURRING_CONTRACT",
        "eventDate": "2023-06-20T16:09:48+02:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "merchantReference": "YOUR_PAYMENT_REFERENCE",
        "originalReference": "INITIAL_PAYMENT_PSP_REFERENCE",
        "originalPsp": "PSP_REFERENCE",
        "paymentMethod": "mc",
        "amount": {
            "value": 0,
            "currency": "EUR"
        },
        "success": "true",
    };

    // calculate signature from payload
    const hmacSignature = await utilities.calculateHmacSignature(notificationRequestItem);
    // add 'additionalData' with hmacSignature 
    notificationRequestItem["additionalData"] = {
        "hmacSignature": "" + hmacSignature + "",
        "recurring.recurringDetailReference": token,
        "recurring.shopperReference": shopperReference,
        "shopperReference": "YOUR_SHOPPER_REFERENCE"
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

    // Verify status code 
    expect(notifications.status()).toEqual(200);

    // Verify token is visible in the Admin panel
    await page.goto('/admin');

    await expect(page).toHaveTitle("Adyen Subscription Admin View2222");
    await expect(page.locator('text="ADMIN PANEL"')).toBeVisible();

    await expect(page.locator('text="ShopperReference: ' + shopperReference + '"')).toBeVisible();
    await expect(page.locator('text="RecurringDetailReference: ' + token + '"')).toBeVisible();

});

