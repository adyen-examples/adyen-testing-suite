import { test, expect } from '@playwright/test';
const utilities = require('../../../utilities');

test('components upi refused', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Components Individual payment' }).click();

  await page.getByRole('link', { name: /upi/i }).click();

  await page.getByRole('button', { name: 'QR code', exact: true }).click();

  const context = page.context();

  const actionPromise = utilities.waitForUpiQrCodeAction(page);
  await page.getByRole('button', { name: /generate qr code/i }).click();
  const action = await actionPromise;

  const simulatorUrl = new URL(action.qrCodeData);
  const reference = simulatorUrl.searchParams.get('reference');
  if (!reference) throw new Error('UPI qrCodeData did not include reference');

  const simulatorPage = await context.newPage();
  await simulatorPage.goto(
    `https://simulators.adyen.com/payment-simulator/outcomes?reference=${encodeURIComponent(reference)}`
  );
  await simulatorPage.getByText(/refused payment/i).click();
  await simulatorPage.getByText(/refused/i).click();

  await page.waitForURL(/\/result\/(failed|error)/i);
  await page.getByRole('heading', { name: 'Payment Failed!' });

  await page.getByRole('link', { name: 'Return to demo types' }).click();
});
