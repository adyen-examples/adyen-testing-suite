import { test, expect } from '@playwright/test';

test('components vipps failure', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Components Individual payment' }).click();

  await page.getByRole('link', { name: 'vipps Vipps' }).click();
  await page.getByRole('button', { name: 'Fortsett til Vipps' }).click();

  await page.getByTestId('success-payment-outcome-button').click();
  await page.getByRole('button', { name: 'Check updated status' }).click();
  
  await page.getByRole('heading', { name: 'Payment Successful!' });
 
  await page.getByRole('link', { name: 'Return to demo types' }).click();
});