const dotenv = require('dotenv');
const { default: HmacValidator } = require('@adyen/api-library/lib/src/utils/hmacValidator');


dotenv.config();


module.exports = {
    /** Card number. */
    CARD_NUMBER: '4111 1111 1111 1111',


    /** Expiry Date. */
    EXPIRY_DATE: '03/30',


    /** CVC number. */
    CVC: '737',


    /** Cardholder name. */
    NAME_ON_CARD: 'J. Smith',


    /** valid AccountHolder id for AfP tests: use env variable to not expose valid Id */
    USERNAME: process.env.AFP_USERNAME || "na",

    /**
     * Fill the workshop's Adyen Web 6.4.1 card fields and any rendered billing-address fields.
     * This helper is independent of the other card-fill utilities in this module.
     * @param {import('@playwright/test').Page} page
     * @param {{
     *   cardNumber?: string,
     *   expiryDate?: string,
     *   cvc?: string,
     *   nameOnCard?: string,
     *   billingAddress?: {
     *     country?: string,
     *     postalCode?: string,
     *     city?: string,
     *     region?: string,
     *     street?: string,
     *     houseNumber?: string,
     *     firstName?: string,
     *     lastName?: string
     *   }
     * }} options
     */
    async fillWorkshopCardDetailsV641(page, options = {}) {
        const {
            cardNumber = '4111 1111 1111 1111',
            expiryDate = '03/30',
            cvc = '737',
            nameOnCard = 'J. Smith',
            billingAddress = {},
        } = options;
        const address = {
            country: billingAddress.country || 'NL',
            postalCode: billingAddress.postalCode || '1011AB',
            city: billingAddress.city || 'Amsterdam',
            region: billingAddress.region || 'North Holland',
            street: billingAddress.street || '123 Test Street',
            houseNumber: billingAddress.houseNumber || '123',
            firstName: billingAddress.firstName || 'Test',
            lastName: billingAddress.lastName || 'Cardholder',
        };

        await page.frameLocator('iframe[title="Card number"]')
            .getByRole('textbox', { name: 'Card number' })
            .fill(cardNumber);
        await page.frameLocator('iframe[title="Expiry date"]')
            .getByRole('textbox', { name: 'Expiry date' })
            .fill(expiryDate);
        await page.frameLocator('iframe[title="Security code"]')
            .getByRole('textbox', { name: 'CVV/CVC' })
            .fill(cvc);

        const controls = page.locator('#payment input, #payment select, #payment textarea');
        const discoveredFields = [];

        for (let index = 0; index < await controls.count(); index += 1) {
            const control = controls.nth(index);
            if (!(await control.isVisible())) {
                continue;
            }

            const metadata = await control.evaluate(element => ({
                tagName: element.tagName.toLowerCase(),
                description: [
                    element.getAttribute('aria-label'),
                    element.getAttribute('placeholder'),
                    element.getAttribute('name'),
                    element.getAttribute('autocomplete'),
                    element.getAttribute('title'),
                    element.labels ? Array.from(element.labels).map(label => label.innerText).join(' ') : '',
                ].filter(Boolean).join(' ').toLowerCase(),
            }));
            discoveredFields.push({ index, ...metadata });
        }

        const holderFields = discoveredFields.filter(field =>
            /card.?holder|holder.?name|name.?on.?card/i.test(field.description) ||
            field.description.includes(nameOnCard.toLowerCase())
        );
        if (holderFields.length !== 1) {
            throw new Error(`Expected one visible cardholder-name field, found ${holderFields.length}.`);
        }
        await controls.nth(holderFields[0].index).fill(nameOnCard);

        const billingFields = [
            { pattern: /country/, value: address.country, isCountry: true },
            { pattern: /postal|zip/, value: address.postalCode },
            { pattern: /city|locality|address.level2/, value: address.city },
            { pattern: /state|province|region|address.level1/, value: address.region },
            { pattern: /street|address/, value: address.street },
            { pattern: /house.?number/, value: address.houseNumber },
            { pattern: /first.?name|given.?name/, value: address.firstName },
            { pattern: /last.?name|family.?name/, value: address.lastName },
        ];
        let filledBillingFields = 0;

        for (const field of discoveredFields) {
            if (/card.?holder|holder.?name|name.?on.?card/i.test(field.description)) {
                continue;
            }

            const addressField = billingFields.find(candidate => candidate.pattern.test(field.description));
            if (!addressField) {
                continue;
            }

            const control = controls.nth(field.index);
            if (addressField.isCountry && field.tagName !== 'select') {
                await control.fill('Netherlands');
                await page.getByRole('listbox').waitFor({ state: 'visible' });

                const countryOption = page.getByRole('option', { name: 'Netherlands', exact: true });
                await countryOption.waitFor({ state: 'visible' });
                await countryOption.click();
            } else if (field.tagName === 'select') {
                const options = await control.locator('option').evaluateAll(elements => elements.map(option => ({
                    value: option.value,
                    label: option.label,
                })));
                const matchingOption = addressField.isCountry
                    ? options.find(option =>
                        option.value.toLowerCase() === address.country.toLowerCase() ||
                        /netherlands/i.test(option.label)
                    )
                    : options.find(option =>
                        option.value.toLowerCase() === addressField.value.toLowerCase() ||
                        option.label.toLowerCase().includes(addressField.value.toLowerCase())
                    );

                if (!matchingOption) {
                    throw new Error(`No matching option was rendered for billing field "${field.description}".`);
                }
                await control.selectOption(matchingOption.value);
            } else {
                await control.fill(addressField.value);
            }

            filledBillingFields += 1;
        }

        if (filledBillingFields === 0) {
            throw new Error('Billing address is required, but no recognizable visible billing fields were rendered.');
        }
    },

    /**
     * Adyen Drop-in v6
     * Utility function to fill card details on the Adyen.Web.Component v6 - Sets default values automatically if you do not overwrite it manually.
     * See: https://docs.adyen.com/online-payments/build-your-integration/?platform=Web&integration=Components.
     * Example usage:
     * ```
     * const utilities = '../utilities';
     * utilities.fillComponentCardDetailsV6(page); // Example #1: Call with default values
     * utilities.fillComponentCardDetailsV6(page, { nameOnCard = 'DECLINED' }); // Example #2: Replaces only 'J. Smith' with 'DECLINED'
     * ```
     */
    async fillComponentCardDetailsV6(page, { cardNumber = this.CARD_NUMBER, expiryDate = this.EXPIRY_DATE, cvc = this.CVC, nameOnCard = this.NAME_ON_CARD} = {}) {
        // Find iframe and fill "Card number" field
        await page.getByRole('form').locator('iframe[title="Iframe for card number"]').contentFrame().getByRole('textbox', { name: 'Card number' }).click();
        await page.getByRole('form').locator('iframe[title="Iframe for card number"]').contentFrame().getByRole('textbox', { name: 'Card number' }).fill(cardNumber);


        // Find iframe and fill "Expiry date" field
        await page.getByRole('form').locator('iframe[title="Iframe for expiry date"]').contentFrame().getByRole('textbox', { name: 'Expiry date' }).click();
        await page.getByRole('form').locator('iframe[title="Iframe for expiry date"]').contentFrame().getByRole('textbox', { name: 'Expiry date' }).fill(expiryDate);
   
        // Find iframe and fill "CVC" field
        await page.getByRole('form').locator('iframe[title="Iframe for security code"]').contentFrame().getByRole('textbox', { name: 'CVV/CVC' }).click();
        await page.getByRole('form').locator('iframe[title="Iframe for security code"]').contentFrame().getByRole('textbox', { name: 'CVV/CVC' }).fill(cvc);


        // Find and fill "Name on card" field - Note: this field is not contained within an iframe
        await page.getByPlaceholder('J. Smith').fill(nameOnCard);
    },


    /**
     * Adyen Drop-in v6
     * Utility function to fill card details on the Adyen.Web.Dropin v6 - Sets default values automatically if you do not overwrite it manually.
     * See: https://docs.adyen.com/online-payments/build-your-integration/?platform=Web&integration=Drop-in.
     * Example usage:
     * ```
     * const utilities = '../utilities';
     * utilities.fillDropinCardDetails(page); // Example #1: Call with default values
     * utilities.fillDropinCardDetails(page, { nameOnCard = 'DECLINED' }); // Example #2: Replaces only 'J. Smith' with 'DECLINED'
     * ```
     */
    async fillDropinCardDetailsV6(page, { cardNumber = this.CARD_NUMBER, expiryDate = this.EXPIRY_DATE, cvc = this.CVC, nameOnCard = this.NAME_ON_CARD} = {}) {
        // Find iframe and fill "Card number" field
        await page.getByRole('form').locator('iframe[title="Iframe for card number"]').contentFrame().getByRole('textbox', { name: 'Card number' }).click();
        await page.getByRole('form').locator('iframe[title="Iframe for card number"]').contentFrame().getByRole('textbox', { name: 'Card number' }).fill(cardNumber);


        // Find iframe and fill "Expiry date" field
        await page.getByRole('form').locator('iframe[title="Iframe for expiry date"]').contentFrame().getByRole('textbox', { name: 'Expiry date' }).click();
        await page.getByRole('form').locator('iframe[title="Iframe for expiry date"]').contentFrame().getByRole('textbox', { name: 'Expiry date' }).fill(expiryDate);


        // Find iframe and fill "CVC" field
        const cardRegion = await page.getByRole('region[name="Cards"i]');
        if (await cardRegion.count() === 0) {
            // Handle drop-in
            await page.getByRole('form').locator('iframe[title="Iframe for security code"]').contentFrame().getByRole('textbox', { name: 'CVV/CVC' }).click();
            await page.getByRole('form').locator('iframe[title="Iframe for security code"]').contentFrame().getByRole('textbox', { name: 'CVV/CVC' }).fill(cvc);
        } else {
            // Handle drop-in when there are are multiple CVC fields with stored payment methods, we select the correct CVC field
            await cardRegion.frameLocator('iframe[title*="security code"]').getByPlaceholder('123').fill(cvc);
        }


        // Find and fill "Name on card" field - Note: this field is not contained within an iframe
        await page.getByPlaceholder('J. Smith').fill(nameOnCard);
    },




    /**
     * Adyen Drop-in v5
     * Utility function to fill card details on the Adyen.Web.Component v5- Sets default values automatically if you do not overwrite it manually.
     * See: https://docs.adyen.com/online-payments/build-your-integration/?platform=Web&integration=Components.
     * Example usage:
     * ```
     * const utilities = '../utilities';
     * utilities.fillComponentCardDetails(page); // Example #1: Call with default values
     * utilities.fillComponentCardDetails(page, { nameOnCard = 'DECLINED' }); // Example #2: Replaces only 'J. Smith' with 'DECLINED'
     * ```
     */
    async fillComponentCardDetails(page, { cardNumber = this.CARD_NUMBER, expiryDate = this.EXPIRY_DATE, cvc = this.CVC, nameOnCard = this.NAME_ON_CARD} = {}) {
        // Find iframe and fill "Card number" field
        const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
        await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill(cardNumber);


        // Find iframe and fill "Expiry date" field
        const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
        await expiryDateFrame.getByPlaceholder('MM/YY').fill(expiryDate);


        // Find iframe and fill "CVC" field
        const cvcFrame = await page.frameLocator('iframe[title*="security code"]');
        await cvcFrame.getByPlaceholder('3 digits').fill(cvc);


        // Find and fill "Name on card" field - Note: this field is not contained within an iframe
        await page.getByPlaceholder('J. Smith').fill(nameOnCard);
    },


    /**
     * Adyen Drop-in v5
     * Utility function to fill card details on the Adyen.Web.Dropin v5 - Sets default values automatically if you do not overwrite it manually.
     * See: https://docs.adyen.com/online-payments/build-your-integration/?platform=Web&integration=Drop-in.
     * Example usage:
     * ```
     * const utilities = '../utilities';
     * utilities.fillDropinCardDetails(page); // Example #1: Call with default values
     * utilities.fillDropinCardDetails(page, { nameOnCard = 'DECLINED' }); // Example #2: Replaces only 'J. Smith' with 'DECLINED'
     * ```
     */
    async fillDropinCardDetails(page, { cardNumber = this.CARD_NUMBER, expiryDate = this.EXPIRY_DATE, cvc = this.CVC, nameOnCard = this.NAME_ON_CARD} = {}) {
        // Find iframe and fill "Card number" field
        const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
        await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill(cardNumber);


        // Find iframe and fill "Expiry date" field
        const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
        await expiryDateFrame.getByPlaceholder('MM/YY').fill(expiryDate);
       
        // Find iframe and fill "CVC" field
        const cardRegion = await page.getByRole('region[name="Credit or debit card"i]');
        if (await cardRegion.count() === 0) {
            // Handle drop-in
            await page.frameLocator('iframe[title="Iframe for security code"]').getByPlaceholder('3 digits').fill(cvc);
        } else {
            // Handle drop-in when there are are multiple CVC fields with stored payment methods, we select the correct CVC field
            await cardRegion.frameLocator('iframe[title*="security code"]').getByPlaceholder('3 digits').fill(cvc);
        }


        // Find and fill "Name on card" field - Note: this field is not contained within an iframe
        await page.getByPlaceholder('J. Smith').fill(nameOnCard);
    },


    /** Utility function to calculate HMAC signature (using Adyen NodeJS library)
    */
    async calculateHmacSignature(notificationRequestItem) {


        const hmacKey = process.env.ADYEN_HMAC_KEY;
        if(!hmacKey) {
            throw Error("HMAC_KEY is undefined")
        }


        return new HmacValidator().calculateHmac(notificationRequestItem, hmacKey);
    }


};
