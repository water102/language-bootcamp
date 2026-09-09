import { test, expect } from '@playwright/test';

test.describe('AI Lesson Prompt and Multi-Version Import Flow', () => {
  test('Imports multiple AI lessons for same day, allows switching versions and restoring default', async ({ page }) => {
    // 1. Visit Lessons view
    await page.goto('/#/lessons');
    await page.waitForSelector('#btn-open-import-modal');

    // 2. Check UI buttons & version bar
    const copyBtn = page.locator('#btn-copy-day-prompt');
    const importBtn = page.locator('#btn-open-import-modal');
    const sourceBadge = page.locator('#lesson-source-badge');
    const restoreBtn = page.locator('#btn-restore-default-lesson');
    const versionSelect = page.locator('#lesson-version-select');

    await expect(copyBtn).toBeVisible();
    await expect(importBtn).toBeVisible();
    await expect(versionSelect).toBeVisible();
    await expect(sourceBadge).toBeHidden();
    await expect(restoreBtn).toBeHidden();

    // 3. Open Import Modal for Version 1
    await importBtn.click();
    await page.waitForSelector('#import-lesson-modal');
    await expect(page.locator('#import-lesson-modal')).toBeVisible();

    const testJsonV1 = JSON.stringify({
      day: 1,
      theme: "AI Version 1: Executive Presence",
      grammar: "Inversion and Cleft Sentences",
      vocabDomain: "High-Stakes Leadership",
      chunks: [
        { en: "seize the initiative", vi: "chủ động nắm bắt cơ hội", ex: "Great leaders seize the initiative early." },
        { en: "command respect", vi: "khiến mọi người kính trọng", ex: "Her deep expertise commands respect." }
      ],
      listening: {
        title: "Keynote on Executive Presence",
        script: "True executive presence is about intentional clarity and calm resonance.",
        questions: ["What defines authentic executive presence?"]
      },
      reading: {
        title: "The Architecture of Influence",
        text: "Influence in elite boardrooms operates on high-density communication.",
        prompt: "Synthesize the tenets of boardroom influence."
      },
      speakingTask: "Deliver a 90-second executive summary of your quarter results.",
      writingTask: "Draft a formal memorandum outlining strategic resource reallocation."
    }, null, 2);

    await page.locator('#lesson-version-title-input').fill('Bản 1: Lãnh Đạo & Hiện Diện');
    await page.locator('#lesson-json-textarea').fill(`\`\`\`json\n${testJsonV1}\n\`\`\``);

    await page.click('#btn-validate-lesson-json');
    await page.waitForSelector('#modal-preview-panel');
    await page.click('#btn-apply-custom-lesson');

    await expect(page.locator('#import-lesson-modal')).toBeHidden();

    // 4. Verify Version 1 is active on Lessons Page
    const themeTitle = page.locator('#lesson-theme-title');
    await expect(themeTitle).toContainText('Bản 1: Lãnh Đạo & Hiện Diện');
    await expect(sourceBadge).toBeVisible();

    // 5. Import Version 2 for the SAME Day 1
    await importBtn.click();
    await page.waitForSelector('#import-lesson-modal');

    const testJsonV2 = JSON.stringify({
      day: 1,
      theme: "AI Version 2: Strategic Negotiation",
      grammar: "Conditionals & Hedging Devices",
      vocabDomain: "Diplomatic Negotiations",
      chunks: [
        { en: "reach a consensus", vi: "đạt được sự đồng thuận", ex: "Both parties reached a consensus after hours." },
        { en: "drive a hard bargain", vi: "mặc cả quyết liệt", ex: "He drove a hard bargain during M&A talks." }
      ],
      listening: {
        title: "High-Stakes Diplomatic Talks",
        script: "In multilateral negotiations, subtle concessions pave the way for breakthrough agreements.",
        questions: ["What role do concessions play?"]
      },
      reading: {
        title: "The Harvard Negotiation Framework",
        text: "Principled negotiation separates the people from the problem.",
        prompt: "Identify the four pillars of principled negotiation."
      },
      speakingTask: "Simulate a bilateral concession negotiation regarding tariffs.",
      writingTask: "Draft a legally binding letter of intent with conditional clauses."
    }, null, 2);

    await page.locator('#lesson-version-title-input').fill('Bản 2: Đàm Phán Chiến Lược');
    await page.locator('#lesson-json-textarea').fill(`\`\`\`json\n${testJsonV2}\n\`\`\``);

    await page.click('#btn-validate-lesson-json');
    await page.waitForSelector('#modal-preview-panel');
    await page.click('#btn-apply-custom-lesson');

    await expect(page.locator('#import-lesson-modal')).toBeHidden();

    // 6. Verify Version 2 is now active
    await expect(themeTitle).toContainText('Bản 2: Đàm Phán Chiến Lược');
    const chunksContainer = page.locator('#lesson-chunks-container');
    await expect(chunksContainer).toContainText('reach a consensus');

    // 7. Test Switching between versions via Version Selector Dropdown
    await expect(versionSelect).toContainText('Bản 2: Đàm Phán');
    await expect(versionSelect).toContainText('Bản 1: Lãnh Đạo');

    // Switch back to Version 1 via select option value
    const v1OptionValue = await page.evaluate(() => {
      const select = document.getElementById('lesson-version-select');
      const opt = Array.from(select.options).find(o => o.text.includes('Lãnh Đạo'));
      return opt ? opt.value : '';
    });
    expect(v1OptionValue).not.toBe('');

    await versionSelect.selectOption(v1OptionValue);

    // Verify content reverted to Version 1!
    await expect(themeTitle).toContainText('Bản 1: Lãnh Đạo');
    await expect(chunksContainer).toContainText('seize the initiative');

    // 8. Switch to "Bài học chuẩn" (default)
    await versionSelect.selectOption('default');
    await expect(themeTitle).not.toContainText('Bản 1: Lãnh Đạo');
    await expect(sourceBadge).toBeHidden();

    // 9. Re-select Version 2 from dropdown
    const v2OptionValue = await page.evaluate(() => {
      const select = document.getElementById('lesson-version-select');
      const opt = Array.from(select.options).find(o => o.text.includes('Đàm Phán'));
      return opt ? opt.value : '';
    });
    await versionSelect.selectOption(v2OptionValue);
    await expect(themeTitle).toContainText('Bản 2: Đàm Phán');
    await expect(sourceBadge).toBeVisible();

    // 10. Delete Version 2 via delete button
    const deleteBtn = page.locator('#btn-delete-current-version');
    await expect(deleteBtn).toBeVisible();

    // Accept dialog
    page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();

    // After deleting Version 2, it should fallback to Version 1 or default
    await expect(versionSelect).not.toContainText('Bản 2: Đàm Phán');
  });

  test('Imports full 9-Block AI lesson, displays all sections and adapts sidebar 9 Khung Giờ', async ({ page }) => {
    await page.goto('/#/lessons');
    await page.waitForSelector('#btn-open-import-modal');

    // 1. Open Import Modal
    await page.click('#btn-open-import-modal');
    await page.waitForSelector('#import-lesson-modal');

    const full9BlockPayload = JSON.stringify({
      day: 1,
      theme: "Day 1 Comprehensive AI Masterclass",
      grammar: {
        topic: "Cleft Sentences for Focus & Emphasis",
        explanation: "Cleft sentences (It was X that... / What I need is...) create stylistic focal points.",
        rules: [
          "It is/was + emphasized element + that/who",
          "Wh-clause + be + emphasized element"
        ],
        sentenceDrills: [
          {
            drill: "Emphasize 'The team needed clear guidance' using It-cleft.",
            answer: "It was clear guidance that the team needed."
          }
        ]
      },
      vocabDomain: "Executive Communication",
      chunks: [
        { en: "set the benchmark", vi: "thiết lập chuẩn mực", ex: "This project sets the benchmark for quality." },
        { en: "underpin success", vi: "làm nền tảng cho thành công", ex: "Diligence underpins long-term success." }
      ],
      listening: {
        title: "All-Hands Keynote: Setting the Standard",
        script: "What truly defines excellence is not perfection, but relentless iterative improvement.",
        questions: ["What truly defines excellence?"],
        shadowingFocus: "Nối âm 'sets-the-benchmark' và giữ nhịp điệu."
      },
      reading: {
        title: "The Architecture of Executive Decisions",
        text: "It is through decisive synthesis that leaders articulate coherent strategy amidst ambiguity.",
        prompt: "Summarize the synthesis principles in 80 words.",
        vocabularyFocus: ["decisive synthesis", "coherent strategy", "relentless improvement"]
      },
      speaking: {
        topic: "Lead a strategic realignment discussion",
        prompt: "Deliver a 2-minute strategic pitch using cleft sentences and collocations.",
        outline: ["Mở đầu 30s", "Thân bài 60s", "Kết luận 30s"],
        pronunciationTips: "Nhấn mạnh từ 'What' và 'It was' khi dùng cấu trúc cleft.",
        followUpQuestions: ["How to manage dissenting stakeholders?"]
      },
      writing: {
        topic: "Draft an executive briefing memo",
        prompt: "Write a 200-word memo detailing operational restructuring.",
        outline: "Hook & Context → Strategic Rationale → Next Steps",
        targetStructures: ["It is vital that we align", "What we must prioritize is..."],
        sampleSnippet: "What the executive board must recognize is that agility demands decentralization."
      },
      extensiveListening: {
        title: "Podcast: Strategic Thinking in Uncertain Times",
        description: "60–90 phút thảo luận về lãnh đạo và thích ứng thị trường.",
        discussionQuestions: ["What was the most compelling strategic insight?"],
        recommendedSources: "Harvard Business Review Ideacast"
      },
      immersion: {
        context: "Họp ban cố vấn và đàm phán chiến lược xuyên quốc gia.",
        realWorldExpressions: [
          { phrase: "move the needle", meaning: "tạo ra sự thay đổi đáng kể", situation: "Khi đánh giá hiệu quả của chiến dịch" }
        ],
        mediaSuggestion: "Xem video phỏng vấn CEO trên Bloomberg."
      },
      srsAndErrorLog: {
        commonPitfalls: ["Dùng sai liên từ sau cleft: nhầm lẫn giữa 'which' và 'that'."],
        reviewReminders: "Ôn 20 chunks trên SRS và ghi nhận các lỗi mắc phải.",
        reflectionQuestions: ["Cấu trúc cleft nào bạn đã áp dụng thành công?"]
      },
      scheduleBlocks: [
        { id: 1, time: "07:00–08:30", duration: "90 min", block: "Ngữ pháp: Cleft Sentences", mode: "Deep", output: "Thực hành 30 câu cleft", color: "#6366f1" },
        { id: 2, time: "09:00–10:30", duration: "90 min", block: "Nghe Sâu: All-Hands Keynote", mode: "Deep", output: "Dictation bài phát biểu", color: "#06b6d4" },
        { id: 3, time: "10:45–12:15", duration: "90 min", block: "20 Chunks: Executive Communication", mode: "Deep", output: "Nạp 20 chunks vào SRS", color: "#10b981" },
        { id: 4, time: "13:15–14:45", duration: "90 min", block: "Đọc Phân Tích: Executive Decisions", mode: "Medium", output: "Tóm tắt 80 từ", color: "#3b82f6" },
        { id: 5, time: "15:00–16:30", duration: "90 min", block: "Luyện Nói: Strategic Realignment", mode: "Deep", output: "Thu âm pitch 2 phút", color: "#f59e0b" },
        { id: 6, time: "16:45–18:15", duration: "90 min", block: "Luyện Viết: Briefing Memo", mode: "Deep", output: "Hoàn thành Draft 1 & 2", color: "#ec4899" },
        { id: 7, time: "19:15–20:45", duration: "90 min", block: "Nghe Mở Rộng: HBR Ideacast", mode: "Medium", output: "Nghe 90 phút và phản biện", color: "#8b5cf6" },
        { id: 8, time: "21:00–22:30", duration: "90 min", block: "Immersion: Global Boardroom", mode: "Light", output: "Thành ngữ move the needle", color: "#14b8a6" },
        { id: 9, time: "22:30–23:00", duration: "30 min", block: "SRS Review & Phản Tư 3 Dòng", mode: "Light", output: "Nhật ký phản tư cuối ngày", color: "#64748b" }
      ]
    }, null, 2);

    await page.locator('#lesson-version-title-input').fill('Bản 9 Khối Toàn Diện');
    await page.locator('#lesson-json-textarea').fill(`\`\`\`json\n${full9BlockPayload}\n\`\`\``);

    await page.click('#btn-validate-lesson-json');
    await page.waitForSelector('#modal-preview-panel');
    await expect(page.locator('#modal-preview-panel')).toContainText('9/9 Khối Đầy Đủ');

    await page.click('#btn-apply-custom-lesson');
    await expect(page.locator('#import-lesson-modal')).toBeHidden();

    // 2. Verify all 9 Block Sections exist and have populated content
    await expect(page.locator('#block-section-grammar')).toBeVisible();
    await expect(page.locator('#lesson-grammar-explanation')).toContainText('Cleft sentences');

    // Test drill answer reveal
    const drillToggleBtn = page.locator('.btn-toggle-drill-ans').first();
    await expect(drillToggleBtn).toBeVisible();
    await drillToggleBtn.click();
    await expect(page.locator('.drill-answer-box').first()).toBeVisible();
    await expect(page.locator('.drill-answer-box').first()).toContainText('It was clear guidance');

    await expect(page.locator('#block-section-listening')).toBeVisible();
    await expect(page.locator('#lesson-listening-title')).toContainText('All-Hands Keynote');

    await expect(page.locator('#block-section-chunks')).toBeVisible();
    await expect(page.locator('#lesson-chunks-container')).toContainText('set the benchmark');

    await expect(page.locator('#block-section-reading')).toBeVisible();
    await expect(page.locator('#lesson-reading-title')).toContainText('Architecture of Executive Decisions');

    await expect(page.locator('#block-section-speaking')).toBeVisible();
    await expect(page.locator('#lesson-speaking-task')).toContainText('Deliver a 2-minute strategic pitch');

    await expect(page.locator('#block-section-writing')).toBeVisible();
    await expect(page.locator('#lesson-writing-task')).toContainText('Write a 200-word memo detailing operational restructuring');

    await expect(page.locator('#block-section-extensive')).toBeVisible();
    await expect(page.locator('#lesson-extensive-title')).toContainText('Strategic Thinking in Uncertain Times');

    await expect(page.locator('#block-section-immersion')).toBeVisible();
    await expect(page.locator('#lesson-immersion-expressions')).toContainText('move the needle');

    await expect(page.locator('#block-section-srs')).toBeVisible();
    await expect(page.locator('#lesson-srs-pitfalls')).toContainText('which');

    // 3. Verify that the Sidebar Schedule adapted to the custom blocks
    const scheduleList = page.locator('#schedule-list-container');
    await expect(scheduleList).toContainText('Ngữ pháp: Cleft Sentences');
    await expect(scheduleList).toContainText('Nghe Sâu: All-Hands Keynote');
    await expect(scheduleList).toContainText('Immersion: Global Boardroom');
  });
});
