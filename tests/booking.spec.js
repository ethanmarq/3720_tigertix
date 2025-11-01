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
  
  test('should allow a user to purchase a ticket using the standard button', async ({ page, context }) => {
    await page.goto('http://localhost:3000/');

    // Wait for the event list to be populated
    await expect(page.locator(`text=${TEST_EVENT.name}`)).toBeVisible();

    // Check initial ticket count
    const eventLocator = page.locator('li', { hasText: TEST_EVENT.name });
    await expect(eventLocator.locator('strong')).toHaveText(String(TEST_EVENT.tickets));

    // Handle the alert dialog that pops up on success
    page.on('dialog', dialog => dialog.accept());

    const buttons = await page.getByRole('button', { name: /Buy one ticket for/ }).elementHandles();
    for (const btn of buttons) {
        await btn.click();
    }
    
    
    // Click the buy button
    //await page.getByRole('button', { name: `Buy one ticket for ${TEST_EVENT.name}` }).click();

    // Wait for the UI to refresh and check the new ticket count
    await expect(eventLocator.locator('strong')).toHaveText(String(TEST_EVENT.tickets - 1));
  });

  test('should allow a user to book a ticket using the LLM chatbot', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Wait for the event list to be populated
    await expect(page.locator(`text=${TEST_EVENT.name}`)).toBeVisible();
    const eventLocator = page.locator('li', { hasText: TEST_EVENT.name });

    // Type booking request into the chatbot
    await page.getByPlaceholder('Type a message or use the mic...').fill(`Book 1 ticket for ${TEST_EVENT.name}`);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for the bot's confirmation message and the confirmation buttons
    await expect(page.locator('text=I am ready to book 1 tickets')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Confirm Booking' })).toBeVisible();
    
    // Confirm the booking
    await page.getByRole('button', { name: 'Confirm Booking' }).click();
    
    // Wait for the final success message from the bot
    await expect(page.locator('text=Successfully booked 1 ticket')).toBeVisible();

    // Check that the main event list updated correctly
    await expect(eventLocator.locator('strong')).toHaveText(String(TEST_EVENT.tickets - 1));
  });

  test('should have no automatically detectable accessibility violations', async ({ page }) => {
    const { AxeBuilder } = require('@axe-core/playwright');
    
    await page.goto('http://localhost:3000/');
    
    // Wait for page to be ready
    await expect(page.locator(`text=${TEST_EVENT.name}`)).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
