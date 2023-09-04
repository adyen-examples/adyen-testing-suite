module.exports = {
    /** Card number. */
    CARD_NUMBER: '4111 1111 1111 1111',

    /** Expiry Date. */
    EXPIRY_DATE: '03/30',

    /** CVC number. */
    CVC: '737',

    /** Cardholder name. */
    NAME_ON_CARD: 'J. Smith',

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
        const cvcFrame = await page.getByRole('region[name="Credit or debit card"i]').frameLocator('iframe[title*="security code"]');
        await cvcFrame.getByPlaceholder('3 digits').fill(cvc);

        // Find and fill "Name on card" field - Note: this field is not contained within an iframe
        await page.getByPlaceholder('J. Smith').fill(nameOnCard);
    }
};