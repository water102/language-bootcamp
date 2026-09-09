import { test, expect } from '@playwright/test';

test('Planner UX - Open GoalPlannerModal, calculate CEFR hours, select scenario and activate plan', async ({ page }) => {
  await page.goto('/');

  // Check header button exists and click it
  const openBtn = page.locator('#open-goal-planner-btn');
  await expect(openBtn).toBeVisible();
  await openBtn.click();

  // Verify modal is displayed
  await expect(page.getByText('Thiết Lập Mục Tiêu & Kế Hoạch CEFR')).toBeVisible();

  // Change current level to B1
  const levelSelect = page.locator('#goal-current-level');
  await levelSelect.selectOption('B1');

  // Verify Cambridge expected hours updated
  await expect(page.getByText('Ước Tính Giờ Học Cambridge')).toBeVisible();

  // Select "Bền bỉ (Sustainable)" scenario
  const sustainableCard = page.getByText('Bền bỉ (Sustainable Habit)');
  await expect(sustainableCard).toBeVisible();
  await sustainableCard.click();

  // Click Activate Plan button
  const activateBtn = page.getByRole('button', { name: /Kích Hoạt Kế Hoạch/i });
  await expect(activateBtn).toBeVisible();
  await activateBtn.click();

  // Verify modal closes
  await expect(page.getByText('Thiết Lập Mục Tiêu & Kế Hoạch CEFR')).not.toBeVisible();

  // Verify state saved in localStorage
  const savedState = await page.evaluate(() => {
    const raw = localStorage.getItem('cefr_planner_state_v1');
    return raw ? JSON.parse(raw) : null;
  });

  expect(savedState).not.toBeNull();
  expect(savedState.data.activePlanSummary).toBeDefined();
  expect(savedState.data.activePlanSummary.currentLevel).toBe('B1');
  expect(savedState.data.activePlanSummary.targetLevel).toBe('C1');
});

test('AI Bridge - Open AiBridgeModal, view fixed-slots prompt and switch tabs', async ({ page }) => {
  await page.goto('/');

  // Check AI Bridge button exists in header
  const aiBtn = page.locator('#open-ai-bridge-btn');
  await expect(aiBtn).toBeVisible();
  await aiBtn.click();

  // Verify modal opens
  await expect(page.getByText('AI Bridge Contract & Trạm Nạp Bài Học')).toBeVisible();

  // Verify prompt contains fixed-slots invariant
  const textarea = page.locator('#ai-prompt-preview');
  await expect(textarea).toBeVisible();
  const promptVal = await textarea.inputValue();
  expect(promptVal).toContain('QUY TẮC BẤT BIẾN BẮT BUỘC');
  expect(promptVal).toContain('KHÔNG ĐƯỢC thay đổi slotId');

  // Switch to Tab 2
  const importTabBtn = page.getByRole('button', { name: /Nạp Phản Hồi AI/i });
  await importTabBtn.click();
  await expect(page.getByPlaceholder('Dán mã JSON trả về từ AI vào đây')).toBeVisible();

  // Close modal
  await page.getByRole('button', { name: 'Đóng' }).click();
  await expect(page.getByText('AI Bridge Contract & Trạm Nạp Bài Học')).not.toBeVisible();
});

test('P2P Social & Chibi - Open StudyRoomModal and verify Chibi widget', async ({ page }) => {
  await page.goto('/');

  // Verify Chibi companion is mounted on screen
  await expect(page.getByText(/Aoi/i).first()).toBeVisible();

  // Check P2P Study Room button exists in header
  const p2pBtn = page.locator('#open-study-room-btn');
  await expect(p2pBtn).toBeVisible();
  await p2pBtn.click();

  // Verify Study Room modal opens
  await expect(page.getByText('Phòng Học Nhóm P2P (WebRTC Study Room)')).toBeVisible();
  await expect(page.getByText('Tham Gia Phòng Học Cùng Bạn Bè')).toBeVisible();

  // Close Study Room modal
  await page.locator('#close-study-room-modal-btn').click();
  await expect(page.getByText('Phòng Học Nhóm P2P (WebRTC Study Room)')).not.toBeVisible();
});

test('Share Modal - Open milestone card preview, verify privacy toggles and actions', async ({ page }) => {
  await page.goto('/');

  const shareBtn = page.locator('#open-share-modal-btn');
  await expect(shareBtn).toBeVisible();
  await shareBtn.click();

  // Verify Share Modal opens
  await expect(page.getByText('Chia Sẻ Tiến Độ & Thẻ Thành Tựu')).toBeVisible();
  await expect(page.getByText('Tuỳ Chọn Hiển Thị (Bảo Mật Cá Nhân)')).toBeVisible();
  await expect(page.getByRole('button', { name: '📥 Tải Ảnh (.PNG)' })).toBeVisible();

  // Close Share Modal
  await page.locator('#close-share-modal-btn').click();
  await expect(page.getByText('Chia Sẻ Tiến Độ & Thẻ Thành Tựu')).not.toBeVisible();
});
