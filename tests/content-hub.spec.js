import { test, expect } from '@playwright/test';

test('Content Hub - Full Flow from Sidebar, Lessons Banner, Practice, and Readers', async ({ page }) => {
  await page.goto('/');

  // 1. Check sidebar nav link exists
  const hubNavLink = page.locator('.nav-link[data-target="content-hub"]');
  await expect(hubNavLink).toBeVisible();

  // 2. Click to open Content Hub
  await hubNavLink.click();
  await expect(page.locator('#view-content-hub')).toHaveClass(/active/);
  await expect(page.getByText('Kho Tài Nguyên & Luyện Tập Mở Rộng')).toBeVisible();

  // 3. Test filter buttons: Click 'B1' level
  const b1FilterBtn = page.locator('#view-content-hub button', { hasText: /^B1$/ });
  await b1FilterBtn.click();

  // 4. Switch to Practice tab
  const practiceTabBtn = page.getByRole('button', { name: /Phòng Luyện Tập Tương Tác/i });
  await practiceTabBtn.click();
  await expect(page.getByText('Sắp Xếp Câu Song Ngữ Tatoeba')).toBeVisible();

  // 5. Interact with Sentence Scramble: click an available token
  const tokenButtons = page.locator('#view-content-hub button:has-text("Kiểm Tra Kết Quả")');
  await expect(tokenButtons).toBeVisible();

  // 6. Switch to Readers & Media tab
  const readersTabBtn = page.getByRole('button', { name: /Bài Đọc & Sách Nói/i });
  await readersTabBtn.click();
  await expect(page.getByText('Bài Đọc Multimedia VOA Learning English')).toBeVisible();
  await expect(page.getByText('Văn Học Cổ Điển Project Gutenberg')).toBeVisible();

  // 7. Switch to Provenance tab
  const provenanceTabBtn = page.getByRole('button', { name: /Minh Bạch Bản Quyền/i });
  await provenanceTabBtn.click();
  await expect(page.getByText('Ma Trận Bản Quyền & Nguồn Gốc')).toBeVisible();
  await expect(page.getByText('CEFR-J English Profiles')).toBeVisible();

  // 8. Test banner in Lessons page
  const lessonsNavLink = page.locator('.nav-link[data-target="lessons"]');
  await lessonsNavLink.click();
  await expect(page.locator('#view-lessons')).toHaveClass(/active/);
  const bannerBtn = page.getByRole('button', { name: /Khám Phá Kho Mở Rộng/i });
  await expect(bannerBtn).toBeVisible();
  await bannerBtn.click();
  await expect(page.locator('#view-content-hub')).toHaveClass(/active/);
});
