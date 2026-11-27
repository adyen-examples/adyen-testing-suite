// @ts-check
const { test, expect } = require('@playwright/test');
const utilities = require('../utilities');

// Workshop - Tokenization > Token Create:
// zero-auth card payment in Drop-in, the token it creates, the RECURRING_CONTRACT webhook, a payment with that token and its AUTHORISATION webhook
test('Workshop - Tokenization - Token Create (zero-auth payment, token, webhooks and payment with the token)', async ({ page, request }) => {
    // Keep the body of the zero-auth response (it is no longer readable after the redirect)
    /** @type {any} */
    let subscriptionBody = null;
    await page.route('**/api/subscription-create', async route => {
        const response = await route.fetch();
        try {
            subscriptionBody = await response.json();
        } catch (e) {
            subscriptionBody = null;
        }
        await route.fulfill({ response });
    });

    await page.goto('/preview?type=subscription');

    // Cart -> checkout
    await page.getByRole('link', { name: 'Continue to checkout' }).click();
    await page.waitForLoadState('load');

    // 1. Select "Credit or debit card" and fill in the details
    await expect(page.locator('text="Credit or debit card"')).toBeVisible();
    await page.getByRole('radio', { name: 'Credit or debit card' }).click();
    await page.waitForLoadState('load');
    await utilities.fillDropinCardDetailsV6(page);

    // 2. Click "Pay" and wait for the zero-auth call
    const payButton = page.locator('.adyen-checkout__button__text >> visible=true');
    await expect(payButton).toBeVisible();

    const [response] = await Promise.all([
        page.waitForResponse(
            response => response.url().includes('/api/subscription-create') && response.request().method() === 'POST'
        ),
        payButton.click(),
    ]);
    expect(response.status()).toEqual(200);

    // 3. The zero-auth payment is authorised ("Return Home" is shown for every result, so check the success page)
    await expect(page).toHaveURL(/\/result\/success/);
    await expect(page.getByText('Your order has been successfully placed.')).toBeVisible();
    expect(subscriptionBody && subscriptionBody.resultCode).toEqual('Authorised');

    // 4. The token (recurringDetailReference) created by the zero-auth payment
    const token = subscriptionBody.additionalData && subscriptionBody.additionalData['recurring.recurringDetailReference'];
    expect(token, 'The zero-auth response must contain recurring.recurringDetailReference').toBeTruthy();

    // 5. RECURRING_CONTRACT webhook for that payment and token: the app must accept it
    const notificationRequestItem = {
        "eventCode": "RECURRING_CONTRACT",
        "success": "true",
        "eventDate": new Date().toISOString(),
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": subscriptionBody.pspReference,
        "merchantReference": subscriptionBody.merchantReference,
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
            "recurring.recurringDetailReference": token,
            "recurring.shopperReference": subscriptionBody.additionalData['recurring.shopperReference']
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

    // 6. The token works: pay with it through /makepaymentwithtoken/{token}
    const tokenPayment = await request.post(`/makepaymentwithtoken/${token}`);
    expect(tokenPayment.status(), '/makepaymentwithtoken answered ' + tokenPayment.status()).toEqual(200);
    const tokenPaymentBody = await tokenPayment.json();
    expect(tokenPaymentBody.resultCode).toEqual('Authorised');

    // 7. AUTHORISATION webhook for the payment made with the token: the app must accept it
    const authorisationItem = {
        "eventCode": "AUTHORISATION",
        "success": "true",
        "eventDate": new Date().toISOString(),
        "merchantAccountCode": "YOUR_MERCHANT_ACCOUNT",
        "pspReference": tokenPaymentBody.pspReference,
        "merchantReference": tokenPaymentBody.merchantReference,
        "amount": {
            "value": 500,
            "currency": "EUR"
        }
    };
    const authorisationSignature = await utilities.calculateHmacSignature(authorisationItem);
    const authorisation = await request.post(`/webhooks`, {
        data: {
            "live": "false",
            "notificationItems": [
                {
                    "NotificationRequestItem": {
                        ...authorisationItem,
                        "additionalData": {
                            "hmacSignature": "" + authorisationSignature + "",
                            "tokenization.storedPaymentMethodId": token
                        }
                    }
                }
            ]
        }
    });
    expect([200, 202]).toContain(authorisation.status());

    // Only when recording a video: keep the success page on screen for a few seconds
    if (process.env.RECORD) {
        await page.waitForTimeout(4000);
    }
});
