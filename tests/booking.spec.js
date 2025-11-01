const { test, expect } = require('@playwright/test');

const TEST_EVENT = {
  name: 'Playwright Test Event',
  date: '2025-12-25',
  tickets: 5,
};

test.beforeEach(async ({ request }) => {
  // 1. Clear events
  await request.post('http://localhost:5001/api/admin/clear-events');
  
  // 2. Create a new event for the test
  const response = await request.post('http://localhost:5001/api/admin/events', {
    data: TEST_EVENT,
  });
  expect(response.ok()).toBeTruthy();
});

test.describe('TigerTix Booking Flows', () => {


  test('should allow a user to purchase a ticket using the standard button', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Wait for the full event row
    const eventRow = page.locator('li', { hasText: TEST_EVENT.name });
    await expect(eventRow).toBeVisible({ timeout: 10000 });

    // Confirm initial ticket count
    await expect(eventRow.locator('strong')).toHaveText(String(TEST_EVENT.tickets), { timeout: 2000 });

    // Locate the Buy Ticket button (DO NOT use getByRole, use .locator with button text)
    const buyButton = eventRow.locator('button', { hasText: 'Buy Ticket' });
    await expect(buyButton).toBeVisible({ timeout: 10000 });

    page.on('dialog', dialog => dialog.accept());
    await buyButton.click();

    // Wait for the ticket counter to decrement
    await expect(eventRow.locator('strong')).toHaveText(String(TEST_EVENT.tickets - 1), { timeout: 3000 });
  });



  test('should allow a user to book a ticket using the LLM chatbot', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const eventLocator = page.locator('li', { hasText: TEST_EVENT.name });
    await expect(eventLocator).toBeVisible();

    // Fill chat input and send
    await page.getByPlaceholder('Type a message or use the mic...').fill(`Book 1 ticket for ${TEST_EVENT.name}`);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait directly for the Confirm Booking button (no bot text check)
    const confirmButton = page.getByRole('button', { name: 'Confirm Booking' });
    await expect(confirmButton).toBeVisible({ timeout: 20000 });

    await confirmButton.click();

    // Final bot reply (success)
    await expect(page.locator('text=Successfully booked')).toBeVisible({ timeout: 15000 });

    // Ticket count should decrement
    await expect(eventLocator.locator('strong')).toHaveText(String(TEST_EVENT.tickets - 1), { timeout: 5000 });
  });


  test('should have no automatically detectable accessibility violations', async ({ page }) => {
    const { AxeBuilder } = require('@axe-core/playwright');
    
    await page.goto('http://localhost:3000/');
    
    // Wait for page to be ready
    await expect(page.locator(`text=${TEST_EVENT.name}`)).toBeVisible({ timeout: 10000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
