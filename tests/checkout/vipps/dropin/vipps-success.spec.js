import { test, expect } from '@playwright/test';

test('dropin vipps success', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('link', { name: 'Drop-in Pre-built payment UI' }).click();

  await page.locator('.country-picker').click();
  await page.locator('#countryDropdown').getByText('Norway').click();
  
  await page.locator('div').filter({ hasText: /^Vipps$/ }).click();
  await page.getByRole('button', { name: 'Fortsett til Vipps' }).click();
  await page.getByTestId('success-payment-outcome-button').click();
  await page.getByRole('button', { name: 'Check updated status' }).click();
  
  await page.getByRole('heading', { name: 'Payment Successful!' });
  
  await page.getByRole('link', { name: 'Return to demo types' }).click();
});