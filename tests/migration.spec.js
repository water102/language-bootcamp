import { test, expect } from '@playwright/test';

test('all routes, history and persisted study tools', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#ipa-course .ipa-tile')).toHaveCount(44);
  for (const route of ['roadmap','schedule','lessons','speaking','writing','flashcards','grammar','pronunciation','assessment','ai-tutor','error-log','dashboard']) {
    await page.locator(`.nav-link[data-target="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#/${route}$`));
    await expect(page.locator(`#view-${route}`)).toBeVisible();
    await expect(page.locator('.page-view.active')).toHaveCount(1);
  }
  await page.goBack();
  await expect(page.locator('#view-error-log')).toBeVisible();
  await page.goto('/#/writing');
  await page.locator('#writing-draft-1').fill('My migration draft survives a page reload.');
  await page.reload();
  await expect(page.locator('#writing-draft-1')).toHaveValue('My migration draft survives a page reload.');
  await page.goto('/#/pronunciation');
  await page.locator('[data-lesson="ipa-1"]').click();
  await page.locator('#ipa-complete').check();
  await page.reload();
  await expect(page.locator('[data-lesson="ipa-1"]')).toHaveClass(/is-complete/);
  await page.goto('/#/dashboard');
  await page.getByRole('button', { name: 'Xem biểu đồ tiến độ' }).click();
  await expect(page.getByRole('img', { name: 'Số ngày hoàn thành theo giai đoạn CEFR' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('old storage is retained and invalid routes recover', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('seeded')) {
      localStorage.setItem('c1_bootcamp_state_v2', JSON.stringify({currentDay: 12, completedDays: [1,2,3], writingDrafts: {12:{draft1:'Existing work'}}}));
      localStorage.setItem('seeded','true');
    }
  });
  await page.goto('/#/dashboard');
  await expect(page.locator('#stat-completed-days')).toHaveText('3 / 120');
  await expect(page.locator('#quick-day-select')).toHaveValue('12');
  await page.goto('/#/writing');
  await expect(page.locator('#writing-draft-1')).toHaveValue('Existing work');
  await page.goto('/#/missing');
  await expect(page).toHaveURL(/#\/dashboard$/);
});

test('timer, KPI, roadmap modal, SRS and backup remain functional', async ({ page }) => {
  await page.goto('/#/dashboard');
  await page.locator('#daily-kpi-container .kpi-item').first().click();
  await expect(page.locator('#daily-kpi-container .kpi-item').first()).toHaveClass(/checked/);
  await page.locator('[data-mode="pomo"]').click();
  await expect(page.locator('#timer-time-text')).toHaveText('25:00');
  await page.locator('#timer-start-btn').click();
  await page.locator('.nav-link[data-target="roadmap"]').click();
  await expect(page.locator('#timer-time-text')).not.toHaveText('25:00', {timeout: 5000});
  await page.locator('#timer-start-btn').click();
  await page.locator('#timer-reset-btn').click();
  await expect(page.locator('#timer-time-text')).toHaveText('25:00');
  await page.locator('#roadmap-grid-container .day-card').nth(1).click();
  await page.locator('[data-action="switch-day"]').click();
  await expect(page.locator('#quick-day-select')).toHaveValue('2');
  await page.locator('.nav-link[data-target="flashcards"]').click();
  await page.locator('#flashcard-scene').click();
  await expect(page.locator('#flashcard-inner')).toHaveClass(/flipped/);
  await page.locator('#srs-good-btn').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('c1_bootcamp_state_v2')));
  expect(saved.flashcards[0].box).toBeGreaterThan(1);
  await page.locator('.nav-link[data-target="error-log"]').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#btn-export-backup').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/c1_bootcamp_backup_.*\.json/);
});
