import { test, expect } from '@playwright/test';

test('components iDEAL success', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: 'Components Individual payment' }).click();
  await page.getByRole('link', { name: 'ideal iDEAL' }).click();
  await page.getByRole('button', { name: 'Continue to iDEAL' }).click();

  await page.getByTestId('payment-action-button').click();
  await page.getByRole('button', { name: 'TESTNL2A' }).click();
  await page.getByRole('button', { name: 'Failure' }).click();
  
  var element = await page.getByRole('heading', { name: 'Payment Failed' });
  expect(await element.innerText()).toBe('Payment Failed');
});