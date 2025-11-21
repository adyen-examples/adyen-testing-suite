import { test, expect } from '@playwright/test';

test('components iDEAL failure', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Drop-in Pre-built payment UI' }).click();
  
  await page.locator('.country-picker').click();
  await page.locator('#countryDropdown').getByText('Netherlands').click();
  
  await page.locator('div').filter({ hasText: /^iDEAL$/ }).nth(0).click();
  await page.getByRole('button', { name: 'Doorgaan naar iDEAL' }).click();

  await page.getByTestId('payment-action-button').click();
  await page.getByRole('button', { name: 'TESTNL2A' }).click();
  await page.getByRole('button', { name: 'Failure' }).click();

  var element = await page.getByRole('heading', { name: 'Payment Failed' });
  expect(await element.innerText()).toBe('Payment Failed');
});