import { test, expect } from '@playwright/test';

test.describe('Day-Specific Content & Timeline Current Objective', () => {
  test('Timeline Current Objective Bar is rendered and dynamically updates with active day', async ({ page }) => {
    await page.goto('/#/dashboard');
    await page.waitForSelector('#timeline-current-objective-bar');

    const objBar = page.locator('#timeline-current-objective-bar');
    await expect(objBar).toBeVisible();

    const objText = page.locator('#timeline-current-objective-text');
    const dayPill = page.locator('#timeline-current-day-pill');
    const jumpBtn = page.locator('#timeline-obj-jump-btn');

    await expect(objText).not.toBeEmpty();
    await expect(dayPill).toContainText('Day 1');
    await expect(jumpBtn).toBeVisible();

    // Switch to Day 25 via quick select
    await page.selectOption('#quick-day-select', '25');
    await expect(dayPill).toContainText('Day 25');

    // Switch to Day 85 via quick select
    await page.selectOption('#quick-day-select', '85');
    await expect(dayPill).toContainText('Day 85');
  });

  test('Clicking schedule blocks on different days loads the exact day-specific prompts in Speaking and Writing', async ({ page }) => {
    await page.goto('/#/dashboard');
    await page.waitForSelector('#schedule-list-container');

    // 1. Select Day 3 in roadmap / quick selector
    await page.selectOption('#quick-day-select', '3');

    // Click Speaking block in sidebar schedule
    const speakingBlockDay3 = page.locator('.schedule-block-item').filter({ has: page.locator('.block-title', { hasText: /speaking|nói/i }) }).first();
    await speakingBlockDay3.click();

    // Sidebar blocks open the Lesson Hub with the exact day's content
    await expect(page).toHaveURL(/#\/lessons/);
    const themeTitle = page.locator('#lesson-theme-title');
    await expect(themeTitle).toContainText('Day 3');
    await expect(page.locator('#lesson-speaking-task')).not.toBeEmpty();

    // 2. Switch to Day 15
    await page.selectOption('#quick-day-select', '15');
    await expect(themeTitle).toContainText('Day 15');

    // 3. Navigate to Dashboard and click a Writing block for Day 15
    await page.click('.nav-link[data-target="dashboard"]');
    await page.waitForSelector('#schedule-list-container');
    const writingBlockDay15 = page.locator('.schedule-block-item').filter({ has: page.locator('.block-title', { hasText: /writing|viết/i }) }).first();
    await writingBlockDay15.click();

    // Verify Lesson Hub opened with Day 15 writing prompt
    await expect(page).toHaveURL(/#\/lessons/);
    await expect(themeTitle).toContainText('Day 15');
    await expect(page.locator('#lesson-writing-task')).not.toBeEmpty();

    // 4. Switch to Day 50
    await page.selectOption('#quick-day-select', '50');
    await expect(themeTitle).toContainText('Day 50');
  });

  test('Lessons Page supports all 120 days and renders media embeds for corresponding days', async ({ page }) => {
    await page.goto('/#/lessons');
    await page.waitForSelector('#lesson-theme-title');

    // Check Day 1 theme and media embed
    const lessonTitle = page.locator('#lesson-theme-title');
    await expect(lessonTitle).toContainText('Day 1');

    const mediaContainer = page.locator('#lesson-media-embed-container');
    await expect(mediaContainer).toBeVisible();
    await expect(mediaContainer.locator('iframe')).toBeVisible();

    // Jump to Day 15 using the new week/day selector (A2 Level)
    await page.selectOption('#lesson-day-jump-select', '15');
    await expect(lessonTitle).toContainText('Day 15');
    await expect(page.locator('#lesson-chunks-container .chunk-row')).toHaveCount(20);

    // Verify video embed is rendered for Day 15 (VOA video for A2)
    await expect(mediaContainer).toBeVisible();
    await expect(mediaContainer.locator('iframe')).toBeVisible();

    // Jump to Day 35 (B1 level - LibriVox audio reader)
    await page.selectOption('#lesson-day-jump-select', '35');
    await expect(lessonTitle).toContainText('Day 35');
    await expect(page.locator('#lesson-chunks-container .chunk-row')).toHaveCount(20);
    await expect(mediaContainer.locator('audio')).toBeVisible();

    // Jump to Day 90 (C1 level - LibriVox Time Machine audio)
    await page.selectOption('#lesson-day-jump-select', '90');
    await expect(lessonTitle).toContainText('Day 90');
    await expect(page.locator('#lesson-chunks-container .chunk-row')).toHaveCount(20);
    await expect(mediaContainer.locator('audio')).toBeVisible();
  });
});
