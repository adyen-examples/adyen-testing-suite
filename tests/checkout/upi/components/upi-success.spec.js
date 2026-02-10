import { test, expect } from '@playwright/test';

test('components upi success', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Components Individual payment' }).click();

  await page.getByRole('link', { name: /upi/i }).click();

  await page.getByRole('button', { name: 'QR code', exact: true }).click();

  const context = page.context();

  let qrCodePayload;
  await Promise.all([
    page.waitForResponse(async (res) => {
      if (res.request().method() !== 'POST') return false;
      if (!res.url().includes('checkoutshopper')) return false;

      try {
        const text = await res.text();
        if (!/"qrCodeData"\s*:\s*"/i.test(text) && !/payment-simulator/i.test(text)) return false;
        const data = JSON.parse(text);
        const action = data?.action ?? data;
        if (action?.type !== 'qrCode' || typeof action?.qrCodeData !== 'string') return false;
        qrCodePayload = data;
        return true;
      } catch {
        return false;
      }
    }, { timeout: 30_000 }),
    page.getByRole('button', { name: /generate qr code/i }).click(),
  ]);

  if (!qrCodePayload) throw new Error('UPI response did not include qrCode action');
  const action = qrCodePayload?.action ?? qrCodePayload;

  const simulatorUrl = new URL(action.qrCodeData);
  const reference = simulatorUrl.searchParams.get('reference');
  if (!reference) throw new Error('UPI qrCodeData did not include reference');

  const simulatorPage = await context.newPage();
  await simulatorPage.goto(
    `https://simulators.adyen.com/payment-simulator/outcomes?reference=${encodeURIComponent(reference)}`
  );
  await simulatorPage.getByText(/successful payment/i).click();

  await page.waitForURL(/\/result\/success/i);
  await page.getByRole('heading', { name: 'Payment Successful!' });

  await page.getByRole('link', { name: 'Return to demo types' }).click();
});
