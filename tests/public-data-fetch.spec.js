import { test, expect } from '@playwright/test';

test.describe('Externalized Public Data Fetching', () => {
  test('App fetches all JSON data from public/data/ via HTTP GET', async ({ page }) => {
    const fetchedUrls = [];

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/data/') && url.endsWith('.json')) {
        fetchedUrls.push({ url, status: response.status() });
      }
    });

    await page.goto('/#/dashboard');
    await page.waitForSelector('#sidebar-day-number');

    // Confirm all 3 external JSON files were requested and returned HTTP 200
    const bootcampReq = fetchedUrls.find(r => r.url.includes('bootcamp_data.json'));
    const grammarReq = fetchedUrls.find(r => r.url.includes('grammar_lessons.json'));
    const packReq = fetchedUrls.find(r => r.url.includes('learning_content_pack.json'));

    expect(bootcampReq, 'bootcamp_data.json must be fetched').toBeDefined();
    expect(bootcampReq.status).toBe(200);

    expect(grammarReq, 'grammar_lessons.json must be fetched').toBeDefined();
    expect(grammarReq.status).toBe(200);

    expect(packReq, 'learning_content_pack.json must be fetched').toBeDefined();
    expect(packReq.status).toBe(200);

    // Verify UI displays content originating from the fetched public data
    const sidebarDay = page.locator('#sidebar-day-number');
    await expect(sidebarDay).toContainText('Day 1/120');

    const scheduleTitle = page.locator('#sidebar-schedule-title');
    await expect(scheduleTitle).toContainText('Khung Giờ');

    // Verify content hub displays content from learning_content_pack.json
    await page.click('.nav-link[data-target="content-hub"]');
    await expect(page.locator('#view-content-hub')).toHaveClass(/active/);
    await expect(page.getByText(/Nguồn Tuyển Chọn \(9\)/)).toBeVisible();
    await expect(page.getByText('Kho Tài Nguyên & Luyện Tập Mở Rộng')).toBeVisible();
  });
});
