// Smoke test for the shared cloud lesson library.
//  1. Boots the app in a fresh browser (simulating a new member).
//  2. Confirms shared lessons are auto-received from Firebase Cloud.
//  3. Opens the "Kho bài học dùng chung" modal, checks the list and applies one.
//  4. Optional self-heal check: set SEED_LOCAL_DAY=7 to seed a local-only lesson
//     and verify the device re-uploads it to the cloud on boot.
// Run (start a server first, e.g. `npm run dev -- --port 4173`):
//   node --env-file=.env tests/cloud-sync-diagnostic.mjs
import { chromium } from '@playwright/test';

const URL = process.env.APP_URL || 'http://127.0.0.1:4173/language-bootcamp/';
const SEED_LOCAL_DAY = Number(process.env.SEED_LOCAL_DAY || 0);
const TEST_LESSON_ID = `lesson_d${SEED_LOCAL_DAY}_selfheal_verify`;

async function launch() {
  try {
    return await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    return await chromium.launch({ headless: true });
  }
}

const browser = await launch();
const context = await browser.newContext();
const page = await context.newPage();

if (SEED_LOCAL_DAY > 0) {
  await page.addInitScript(({ day, id }) => {
    const lesson = {
      id,
      day,
      theme: `Self-Heal Verify Day ${day}`,
      grammar: 'self-heal test grammar',
      chunks: [{ en: 'self heal test chunk', vi: 'tự phục hồi', ex: 'Self-healing works.' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustomAiLesson: true
    };
    localStorage.setItem(`c1_custom_lesson_${day}`, JSON.stringify(lesson));
    localStorage.setItem(`c1_custom_lesson_versions_${day}`, JSON.stringify([lesson]));
    localStorage.setItem(`c1_active_lesson_ver_${day}`, lesson.id);
  }, { day: SEED_LOCAL_DAY, id: TEST_LESSON_ID });
}

const logs = [];
page.on('console', msg => {
  const text = msg.text();
  if (/\[CloudSync\]|\[FirebaseSync\]|\[Firebase\]|Restored|cloud|firestore|permission/i.test(text)) {
    logs.push(`[${msg.type()}] ${text}`);
  }
});
page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

console.log('Navigating to', URL);
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
try {
  await page.waitForSelector('#app-loading-screen', { state: 'detached', timeout: 45000 });
} catch { console.log('WARN: loading screen still visible after 45s'); }
await page.waitForTimeout(12000);

const bootReport = await page.evaluate(() => ({
  engineCustomDays: Object.keys(window.__BOOTCAMP_CUSTOM_LESSONS__ || {}).map(Number).sort((a, b) => a - b),
  toast: document.getElementById('app-toast')?.textContent?.trim() || null
}));

await page.evaluate(() => document.querySelector('[data-target="lessons"]')?.click());
await page.waitForTimeout(800);

const modalReport = { opened: false };
const libraryButton = page.locator('#btn-open-cloud-library');
if (await libraryButton.count() > 0) {
  await libraryButton.click();
  await page.waitForSelector('#cloud-library-modal', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(4000);
  modalReport.opened = true;
  modalReport.rowCount = await page.locator('#cloud-library-list > div').count();
  modalReport.containsStats = /bài học/.test((await page.locator('#cloud-library-modal').textContent()) || '');
  const firstApply = page.locator('[id^="btn-apply-cloud-lesson-"]').first();
  if (await firstApply.count() > 0) {
    modalReport.applyButton = await firstApply.getAttribute('id');
    await firstApply.click();
    await page.waitForTimeout(4000);
    modalReport.afterApplyToast = (await page.locator('#app-toast').textContent())?.trim() || null;
  }
} else {
  modalReport.reason = '#btn-open-cloud-library not found (cloud disabled?)';
}

console.log('\n===== BOOT REPORT =====');
console.log(JSON.stringify(bootReport, null, 2));
console.log('\n===== LIBRARY MODAL REPORT =====');
console.log(JSON.stringify(modalReport, null, 2));
console.log('\n===== RELEVANT CONSOLE LOGS =====');
logs.slice(0, 40).forEach(l => console.log(l));

await browser.close();