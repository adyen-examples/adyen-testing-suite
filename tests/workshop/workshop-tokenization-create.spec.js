// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

// Workshop - Tokenization > Token Create: zero-auth card payment, then the RECURRING_CONTRACT webhook
test('Workshop - Tokenization - Token Create (zero-auth card payment)', async ({ page }) => {
    await page.goto('/preview?type=subscription');

    // Cart -> checkout
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    await page.waitForLoadState('load');

    // Select "Credit or debit card" and fill in the details
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();
    await page.getByRole('radio', { name: 'Credit or debit card' }).click();
    await page.waitForLoadState('load');
    await utilities.fillDropinCardDetailsV6(page, { nameOnCard: 'Andrés Gustavo Muñoz Dávila' });

    // Click "Pay"
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();

    // Wait for the zero-auth call while clicking Pay
    const [response] = await Promise.all([
        page.waitForResponse(
            response => response.url().includes('/api/subscription-create') && response.request().method() === 'POST'
        ),
        payButton.click(),
    ]);

    expect(response.status()).toEqual(200);

    // "Return Home" is shown for every result, so check that the payment really succeeded
    await expect(page).toHaveURL(/\/result\/success/);
    await expect(page.getByText('Your order has been successfully placed.')).toBeVisible();

    // Only when recording a video: keep the success page on screen for a few seconds
    if (process.env.RECORD) {
        await page.waitForTimeout(4000);
    }
});

test('Workshop - Tokenization - RECURRING_CONTRACT webhook is accepted', async ({ request }) => {
    const notificationRequestItem = {
        "eventCode": "RECURRING_CONTRACT",
        "success": "true",
        "eventDate": "2019-06-28T18:03:50+01:00",
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": "7914073381342284",
        "merchantReference": "YOUR_REFERENCE",
        "amount": {
            "value": 0,
            "currency": "EUR"
        }
    };

    // Sign the payload, then add the token and the signature
    const hmacSignature = await utilities.calculateHmacSignature(notificationRequestItem);
    const signedItem = {
        ...notificationRequestItem,
        "additionalData": {
            "hmacSignature": "" + hmacSignature + "",
            "recurring.recurringDetailReference": "XXXXXXXXX",
            "recurring.shopperReference": "workshop-shopper"
        }
    };

    const notifications = await request.post(`/webhooks`, {
        data: {
            "live": "false",
            "notificationItems": [
                { "NotificationRequestItem": signedItem }
            ]
        }
    });

    // 202, or the legacy 200 with "[accepted]"
    if (notifications.status() === 202) {
        expect(await notifications.text()).toEqual('');
    } else {
        expect(notifications.status()).toEqual(200);
        expect(await notifications.text()).toEqual('[accepted]');
    }
});
