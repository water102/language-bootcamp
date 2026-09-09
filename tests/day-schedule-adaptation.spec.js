import { test, expect } from '@playwright/test';

test('Dynamic Schedule Adaptation - Blocks in 9 Khung Giờ and Timeline match selected Roadmap Day', async ({ page }) => {
  await page.goto('/');

  // 1. Verify Day 1 default
  const block1Title = page.locator('#schedule-block-1 .block-title');
  await expect(block1Title).toContainText('be: affirmative');
  await expect(page.locator('#schedule-block-5 .block-title')).toContainText('self-introduction and goals');

  // Timeline segment 1 should reflect Day 1 grammar
  const seg1 = page.locator('#daily-timeline-bar-track #timeline-seg-1');
  await expect(seg1).toContainText('be: affirmative');

  // 2. Switch to Day 2 via Quick Day Select dropdown
  const quickSelect = page.locator('#quick-day-select');
  await quickSelect.selectOption('2');

  // Verify Schedule block 1 and block 5 updated to Day 2 content
  await expect(block1Title).toContainText('be: negative');
  await expect(page.locator('#schedule-block-5 .block-title')).toContainText('daily routine');
  await expect(seg1).toContainText('be: negative');

  // 3. Switch to Day 15 (A2 past simple)
  await quickSelect.selectOption('15');
  await expect(block1Title).toContainText('past simple regular');
  await expect(page.locator('#schedule-block-5 .block-title')).toContainText('a memorable day');
  await expect(page.locator('#schedule-block-1')).toContainText('A2');
  await expect(seg1).toContainText('past simple regular');

  // 4. Switch to Day 84 (B2 Gatekeeper)
  await quickSelect.selectOption('84');
  await expect(page.locator('#schedule-block-5 .block-title')).toContainText('B2 mock');
  await expect(page.locator('#schedule-block-1')).toContainText('B2');

  // 5. Switch to Day 92 (C1 negative inversion)
  await quickSelect.selectOption('92');
  await expect(block1Title).toContainText('inversion after negative adverbials');
  await expect(page.locator('#schedule-block-1')).toContainText('C1');
});
