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

    /** Utility function to fill card details on the Adyen.Web.Component - Sets default values automatically if you do not overwrite it manually.
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

    /** Utility function to fill card details on the Adyen.Web.Dropin - Sets default values automatically if you do not overwrite it manually.
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