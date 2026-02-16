import { test, expect } from '@playwright/test';

test('components iDEAL failure', async ({ page }) => {
  await page.goto('/checkout/ideal');
  await page.getByRole('button', { name: 'Continue to iDEAL' }).click();

  await page.getByTestId('payment-action-button').click();
  await page.getByRole('button', { name: 'TESTNL2A' }).click();
  await page.getByRole('button', { name: 'Failure' }).click();
  
  await page.getByRole('heading', { name: 'Payment Failed!' });
  await page.getByRole('link', { name: 'Return to demo types' }).click();
});