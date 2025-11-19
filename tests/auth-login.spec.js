const { test, expect } = require('@playwright/test');

// Simple auth flow: register, see logged-in header, and logout
test('user can register, see logged-in header, and logout', async ({ page }) => {
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';

  await page.goto('http://localhost:3000/');

  // Ensure the Register heading is visible
  const registerHeading = page.getByRole('heading', { name: 'Register' });
  await expect(registerHeading).toBeVisible();

  // Use the DOM structure instead of labels
  const registerSection = registerHeading.locator('xpath=..');
  const emailInput = registerSection.locator('input[type="email"]');
  const passwordInput = registerSection.locator('input[type="password"]');

  await emailInput.fill(uniqueEmail);
  await passwordInput.fill(password);
  await registerSection.getByRole('button', { name: 'Register' }).click();

  // After successful registration, header should show logged-in user
  await expect(page.getByText(`Logged in as ${uniqueEmail}`)).toBeVisible();

  // Logout and verify header updates
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText('Not logged in')).toBeVisible();
});