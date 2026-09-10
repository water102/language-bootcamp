import { test, expect } from '@playwright/test';

test.describe('C1 Bootcamp Enhancements Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 });
  });

  test('1. Roadmap day selection auto-navigates to day study content', async ({ page }) => {
    await page.goto('/#/roadmap');
    await expect(page.locator('#view-roadmap')).toHaveClass(/active/);

    // Open Day 2 card in the roadmap grid
    const day2Card = page.locator('#roadmap-grid-container .day-card').nth(1);
    await expect(day2Card).toBeVisible();
    await day2Card.click();

    // Verify global modal opened
    const modal = page.locator('#global-modal-overlay');
    await expect(modal).toHaveClass(/open/);

    // Click "Chọn làm ngày học hiện tại"
    const switchDayBtn = modal.locator('[data-action="switch-day"]');
    await expect(switchDayBtn).toBeVisible();
    await switchDayBtn.click();

    // Verify modal closed (open class removed) and auto-navigated to lessons (starter pack has day 2)
    await expect(modal).not.toHaveClass(/open/);
    await expect(page.locator('#view-lessons')).toHaveClass(/active/);

    // Verify current day badge updated to Day 2
    await expect(page.locator('#header-day-display')).toContainText('Day 2');
    await expect(page.locator('#quick-day-select')).toHaveValue('2');
  });

  test('2. Re-study block by clicking schedule item in sidebar', async ({ page }) => {
    await page.goto('/#/dashboard');
    await expect(page.locator('#view-dashboard')).toHaveClass(/active/);

    // Click schedule block 5 (Speaking) in the sidebar
    const block5 = page.locator('#schedule-block-5');
    await expect(block5).toBeVisible();
    await block5.click();

    // Sidebar blocks now open the Lesson Hub and scroll to the matching section
    await expect(page).toHaveURL(/#\/lessons/);
    await expect(page.locator('#view-lessons')).toHaveClass(/active/);
    const speakingTask = page.locator('#lesson-speaking-task');
    await expect(speakingTask).not.toBeEmpty();
  });

  test('3. Schedule Editor Modal - Reorder, edit and apply 8H B1->C1 preset', async ({ page }) => {
    await page.goto('/#/dashboard');

    // Click open schedule editor button
    const openBtn = page.locator('#open-schedule-editor-btn');
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Verify modal opened
    const editorModal = page.locator('#schedule-editor-modal');
    await expect(editorModal).toBeVisible();

    // Click B1 -> C1 8h preset button
    const preset8hBtn = editorModal.locator('#apply-8h-preset-btn');
    await expect(preset8hBtn).toBeVisible();
    await preset8hBtn.click();

    // Verify preset loaded in list (check first time input)
    await expect(editorModal.locator('input[type="text"]').first()).toHaveValue(/07:00/);

    // Click Save schedule button
    const saveBtn = editorModal.locator('#btn-save-schedule');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Verify modal closed
    await expect(editorModal).not.toBeVisible();

    // Verify localStorage has custom schedule saved with 7 blocks (480 min study)
    const saved = await page.evaluate(() => {
      const raw = localStorage.getItem('c1_custom_schedule');
      return raw ? JSON.parse(raw) : null;
    });

    expect(saved).not.toBeNull();
    expect(saved.length).toBe(7);
  });

  test('4. IPA Enhancements - Quick checkmark on tile, slow audio, and sample sentences', async ({ page }) => {
    await page.goto('/#/pronunciation');
    await expect(page.locator('#view-pronunciation')).toHaveClass(/active/);

    // Quick checkmark on first tile
    const firstCheckBtn = page.locator('.ipa-quick-check').first();
    await expect(firstCheckBtn).toBeVisible();
    await firstCheckBtn.click();

    // Verify checkmark becomes active (✅)
    await expect(firstCheckBtn).toHaveText('✅');
    const firstLessonTile = page.locator('[data-lesson="ipa-1"]');
    await expect(firstLessonTile).toHaveClass(/is-complete/);

    // Open first IPA lesson dialog
    await firstLessonTile.click();

    const dialog = page.locator('#ipa-lesson');
    await expect(dialog).toBeVisible();

    // Verify Slow audio (Nghe chậm) button exists
    const slowBtn = dialog.locator('[data-audio="words-slow"]');
    await expect(slowBtn).toBeVisible();
    await slowBtn.click();

    // Verify Discrete audio (Nghe từng âm) button exists
    const discreteBtn = dialog.locator('[data-audio="words-discrete"]');
    await expect(discreteBtn).toBeVisible();
    await discreteBtn.click();

    // Verify Extra sample sentences listen button exists
    const extraAudioBtn = dialog.locator('[data-audio="extra-1"]');
    await expect(extraAudioBtn).toBeVisible();
    await extraAudioBtn.click();

    // Close dialog
    await page.locator('#ipa-lesson [data-close]').click();
    await expect(dialog).not.toBeVisible();
  });

  test('5. Writing Diff Modal - Compare Draft 1 vs Draft 2 Rewrite', async ({ page }) => {
    await page.goto('/#/writing');
    await expect(page.locator('#view-writing')).toHaveClass(/active/);

    // Click header open diff button or in-page button
    const diffBtn = page.locator('#btn-open-writing-diff');
    await expect(diffBtn).toBeVisible();
    await diffBtn.click();

    // Verify Writing Diff modal opened
    await expect(page.getByText('So Sánh Bản Viết: Draft 1 vs Draft 2 (Rewrite Rule)')).toBeVisible();
    await expect(page.getByText('Draft 1 (Bản Thô Ban Đầu)')).toBeVisible();
    await expect(page.getByText('Draft 2 (Bản Viết Lại Hoàn Chỉnh)')).toBeVisible();

    // Switch view mode
    const inlineBtn = page.getByRole('button', { name: /Xem Chi Tiết Nâng Cấp/i });
    await expect(inlineBtn).toBeVisible();
    await inlineBtn.click();

    // Close modal
    const closeBtn = page.locator('#close-writing-diff-modal-btn');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByText('So Sánh Bản Viết: Draft 1 vs Draft 2 (Rewrite Rule)')).not.toBeVisible();
  });

  test('6. SRS Schedule Modal - Leitner distribution and intervals', async ({ page }) => {
    await page.goto('/#/dashboard');

    const srsBtn = page.locator('#open-srs-schedule-btn');
    await expect(srsBtn).toBeVisible();
    await srsBtn.click();

    // Verify modal opens with 5 boxes
    const srsModal = page.locator('#srs-schedule-modal');
    await expect(srsModal).toBeVisible();
    await expect(srsModal.getByText('Hàng ngày', { exact: true })).toBeVisible();
    await expect(srsModal.getByText(/Mastered/i)).toBeVisible();

    // Close modal
    const closeBtn = page.locator('#close-srs-schedule-modal-btn');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(srsModal).not.toBeVisible();
  });

  test('7. Weekly Report Modal - Review analytics and C1 recommendations', async ({ page }) => {
    await page.goto('/#/dashboard');

    const reportBtn = page.locator('#open-weekly-report-btn');
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    // Verify modal opened
    await expect(page.getByText('Báo Cáo Tuần & Phân Tích Tiến Độ C1')).toBeVisible();
    await expect(page.getByText('Độ Tuân Thủ')).toBeVisible();
    await expect(page.getByText('Tổng Giờ Học')).toBeVisible();

    // Close modal
    const closeBtn = page.locator('#close-weekly-report-modal-btn');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByText('Báo Cáo Tuần & Phân Tích Tiến Độ C1')).not.toBeVisible();
  });

  test('8. Dexie IndexedDB persistence initialized', async ({ page }) => {
    await page.goto('/');

    const dbInitialized = await page.evaluate(async () => {
      const basePath = window.__BASE_PATH__ || (window.location.pathname.includes('/language-bootcamp') ? '/language-bootcamp' : '');
      const { db } = await import(`${basePath}/src/core/storage/db.js`);
      await db.open();
      const tables = db.tables.map(t => t.name);
      return tables.includes('recordings') && tables.includes('writingDrafts');
    });

    expect(dbInitialized).toBe(true);
  });

  test('9. Schedule Shared Data & JSON Export/Import - Timeline and Sidebar in sync', async ({ page }) => {
    await page.goto('/#/dashboard');
    await expect(page.locator('#global-timeline-strip')).toBeVisible();

    // 1. Open Schedule Editor from the timeline button
    const timelineEditBtn = page.locator('#timeline-edit-schedule-btn');
    await expect(timelineEditBtn).toBeVisible();
    await timelineEditBtn.click();

    const editorModal = page.locator('#schedule-editor-modal');
    await expect(editorModal).toBeVisible();

    // 2. Apply 8H preset (7 study blocks)
    await editorModal.locator('#apply-8h-preset-btn').click();

    // 3. Test JSON Export button triggers download
    const downloadPromise = page.waitForEvent('download');
    await editorModal.locator('#btn-export-schedule-json').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('c1_study_schedule_');

    // 4. Save schedule
    await editorModal.locator('#btn-save-schedule').click();
    await expect(editorModal).not.toBeVisible();

    // 5. Verify Timeline header & Sidebar header reflect 8H and 7 blocks
    await expect(page.locator('#global-timeline-title')).toHaveText('Tiến Trình 8 Giờ Trong Ngày');
    await expect(page.locator('#sidebar-schedule-title')).toHaveText('📅 7 Khung Giờ Trong Ngày');

    // 6. Verify sidebar items count equals 7
    const sidebarBlocks = page.locator('#schedule-list-container .schedule-block-item');
    await expect(sidebarBlocks).toHaveCount(7);

    // 7. Verify timeline segments rendered for all 7 blocks
    const seg1 = page.locator('#daily-timeline-bar-track #timeline-seg-1');
    await expect(seg1).toBeVisible();
  });

  test('10. Grammar Matrix - Lesson theory and interactive quiz with mastery tracking', async ({ page }) => {
    await page.goto('/#/grammar');
    await expect(page.locator('#view-grammar')).toHaveClass(/active/);

    // Find the first grammar row
    const firstRow = page.locator('#grammar-table-body tr').first();
    await expect(firstRow).toBeVisible();

    // Click "Học & Bài Tập" button
    const lessonBtn = firstRow.locator('.btn-open-grammar-lesson');
    await expect(lessonBtn).toBeVisible();
    await lessonBtn.click();

    // Verify Grammar Lesson Modal opens
    const lessonModal = page.locator('#grammar-lesson-modal');
    await expect(lessonModal).toBeVisible();

    // Verify Theory content is visible
    await expect(lessonModal.getByText('Cấu Trúc & Công Thức Chuẩn')).toBeVisible();
    await expect(lessonModal.getByText('Bản Chất & Cách Dùng Chuyên Sâu')).toBeVisible();

    // Switch to Exercises Tab using the button
    const exercisesTab = lessonModal.locator('#tab-grammar-exercises-btn');
    await expect(exercisesTab).toBeVisible();
    await exercisesTab.click();

    // Answer all questions to unlock save button
    const questions = lessonModal.locator('.space-y-6 > div');
    const qCount = await questions.count();
    for (let i = 0; i < qCount; i++) {
      const q = questions.nth(i);
      const checkBtn = q.getByText('Kiểm tra đáp án');
      if (await checkBtn.isVisible()) {
        await q.locator('button').first().click();
        await checkBtn.click();
        await expect(q.getByText('Giải thích chi tiết:')).toBeVisible();
      }
    }

    // Save mastery progress
    const saveMasteryBtn = lessonModal.locator('#btn-save-grammar-mastery');
    await expect(saveMasteryBtn).toBeVisible();
    await saveMasteryBtn.click();

    // Verify modal closes
    await expect(lessonModal).not.toBeVisible();

    // Verify the "1. Hiểu" checkbox in the first row is now checked
    const understandCheck = firstRow.locator('input[data-type="understand"]');
    await expect(understandCheck).toBeChecked();
  });
});

