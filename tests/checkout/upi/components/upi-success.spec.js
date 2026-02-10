import { test, expect } from '@playwright/test';

test('components upi success', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Components Individual payment' }).click();

  await page.getByRole('link', { name: /upi/i }).click();

  await page.getByRole('button', { name: /qr code/i }).click();

  const context = page.context();

  const qrCodeResponsePromise = page.waitForResponse(async (res) => {
    if (!res.ok()) return false;
    try {
      const data = await res.json();
      return data?.type === 'qrCode' && typeof data?.qrCodeData === 'string';
    } catch {
      return false;
    }
  });

  await page.getByRole('button', { name: /generate qr code/i }).click();
  const qrCodeResponse = await qrCodeResponsePromise;
  const qrCodePayload = await qrCodeResponse.json();

  const simulatorUrl = new URL(qrCodePayload.qrCodeData);
  const reference = simulatorUrl.searchParams.get('reference');
  if (!reference) throw new Error('UPI qrCodeData did not include reference');

  const simulatorPage = await context.newPage();
  await simulatorPage.goto(
    `https://simulators.adyen.com/payment-simulator/outcomes?reference=${encodeURIComponent(reference)}`
  );
  await simulatorPage.getByText(/successful payment/i).click();
  await simulatorPage.getByText(/authorized/i).click();

  await page.waitForURL(/\/result\/success/i);
  await page.getByRole('heading', { name: 'Payment Successful!' });

  await page.getByRole('link', { name: 'Return to demo types' }).click();
});
