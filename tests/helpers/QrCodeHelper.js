const playwrightConfig = require('../../playwright.config');

const defaultTimeout = playwrightConfig?.use?.actionTimeout ?? playwrightConfig?.expect?.timeout ?? 30 * 1000;

class QrCodeHelper {
    constructor(page) {
        this.page = page;
    }

    async waitForUpiQrCodeResponse({ timeout = defaultTimeout } = {}) {
        return this.page.waitForResponse(async (res) => {
            if (res.request().method() !== 'POST') return false;
            if (!res.url().includes('checkoutshopper')) return false;

            try {
                const text = await res.text();
                return /"qrCodeData"\s*:\s*"/i.test(text) || /payment-simulator/i.test(text);
            } catch {
                return false;
            }
        }, { timeout });
    }
}

module.exports = QrCodeHelper;
