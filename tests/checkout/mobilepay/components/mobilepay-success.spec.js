import { test, expect } from '@playwright/test';

test('components mobilepay success', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Components Individual payment' }).click();

  await page.getByRole('link', { name: 'mobilepay MobilePay' }).click();  
  await page.getByRole('button', { name: /Forts.*t til MobilePay/i }).click();
  await page.getByTestId('success-payment-outcome-button').click();
  await page.getByRole('button', { name: 'Check updated status' }).click();
  
  await page.getByRole('heading', { name: 'Payment Successful!' });
 
  await page.getByRole('link', { name: 'Return to demo types' }).click();
});