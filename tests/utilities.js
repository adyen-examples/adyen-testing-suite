module.exports = {
    /** Utility function to fill card details - Sets default values automatically if you do not overwrite it manually
     * 
     * Example usage:
     * ```
     * const utilities = '../utilities';
     * utilities.fillCardDetails(page); // Example #1: Leaves all default values
     * utilities.fillCardDetails(page, { nameOnCard = 'DECLINED' }); // Example #2: Replaces only 'J. Smith' with 'DECLINED'
     * ```
     */
    async fillCardDetails(page, { cardNumber = '4111 1111 1111 1111', expiryDate = '03/30', cvc = '737', nameOnCard = 'J. Smith' }) {
        // Find iframe and fill "Card number" field
        const cardNumberFrame = await page.frameLocator('iframe[title*="card number"]');
        await cardNumberFrame.getByPlaceholder('1234 5678 9012 3456').fill(cardNumber);
    
        // Find iframe and fill "Expiry date" field
        const expiryDateFrame = await page.frameLocator('iframe[title*="expiry date"]');
        await expiryDateFrame.getByPlaceholder('MM/YY').fill(expiryDate);
    
        // Find iframe for CVC
        const cvcFrame = await page.getByRole('region[name="Credit or debit card"i]').frameLocator('iframe[title*="security code"]');
    
        // Fill "CVC / CVV" field
        await cvcFrame.getByPlaceholder('3 digits').fill(cvc);
    
        // Find and fill "Name on card" field - Note: this field is not contained within an iframe
        await page.getByPlaceholder('J. Smith').fill(nameOnCard);
    }
};