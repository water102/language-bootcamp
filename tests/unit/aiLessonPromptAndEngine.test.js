import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateDayLessonPrompt, validateAndParseLessonJson } from '../../src/core/ai/lessonPromptBuilder.js';
import { CurriculumContentEngine } from '../../src/core/curriculum/curriculumContentEngine.js';

test('LessonPromptBuilder - generates valid Master Prompt for any day 1-120', () => {
  const promptDay1 = generateDayLessonPrompt(1);
  assert.ok(promptDay1.includes('Day 1'), 'Should contain Day 1');
  assert.ok(promptDay1.includes('JSON'), 'Should enforce JSON format');
  assert.ok(promptDay1.includes('"chunks"'), 'Should require chunks field in schema');
  assert.ok(promptDay1.includes('"speakingTask"'), 'Should require speakingTask');
  assert.ok(promptDay1.includes('"writingTask"'), 'Should require writingTask');

  const promptDay45 = generateDayLessonPrompt(45);
  assert.ok(promptDay45.includes('Day 45'), 'Should contain Day 45');
});

test('LessonPromptBuilder - validates and parses well-formed JSON from AI code fence', () => {
  const validAiResponse = `
Here is your complete Cambridge C1 customized lesson for Day 1:
\`\`\`json
{
  "day": 1,
  "theme": "Advanced Identity & Professional Presence",
  "grammar": "be: affirmative + subject pronouns & cleft sentences",
  "chunks": [
    { "en": "make a lasting impression", "vi": "tạo ấn tượng sâu sắc", "ex": "She made a lasting impression during the interview." },
    { "en": "establish rapport", "vi": "thiết lập mối quan hệ hòa hợp", "ex": "It takes time to establish rapport with new clients." },
    { "en": "stand out from the crowd", "vi": "nổi bật giữa đám đông", "ex": "Unique skills help you stand out from the crowd." }
  ],
  "listening": {
    "title": "Executive Introductions",
    "script": "Good morning team, let me officially introduce our new VP of Product.",
    "questions": ["Who is being introduced?", "What is the key objective?"]
  },
  "reading": {
    "title": "The Art of Self-Presentation",
    "text": "Self-presentation in high-stakes environments requires intentional verbal and non-verbal cues.",
    "prompt": "Summarize the three core pillars of executive presence."
  },
  "speakingTask": "Deliver a 2-minute elevator pitch highlighting your core competencies.",
  "writingTask": "Write a 250-word cover letter opening establishing executive presence."
}
\`\`\`
Hope this helps! Let me know if you need modifications.
  `;

  const result = validateAndParseLessonJson(validAiResponse);
  assert.equal(result.success, true);
  assert.equal(result.lesson.day, 1);
  assert.equal(result.lesson.theme, "Advanced Identity & Professional Presence");
  assert.equal(result.lesson.chunks.length, 3);
  assert.equal(result.lesson.listening.title, "Executive Introductions");
  assert.equal(result.lesson.reading.prompt, "Summarize the three core pillars of executive presence.");
});

test('LessonPromptBuilder - catches missing fields or invalid format gracefully', () => {
  const invalidJson = `{ "day": 1, "theme": "Incomplete" }`;
  const result = validateAndParseLessonJson(invalidJson);
  assert.equal(result.success, false);
  assert.ok(result.error.toLowerCase().includes('grammar') || result.error.toLowerCase().includes('ngữ pháp'), 'Should report missing grammar');

  const malformed = `This is just random text with no JSON at all`;
  const res2 = validateAndParseLessonJson(malformed);
  assert.equal(res2.success, false);
});

test('CurriculumContentEngine - sets, retrieves and removes custom AI lessons seamlessly', () => {
  const mockLesson = {
    day: 99,
    theme: "AI Generated Mastery Day 99",
    grammar: "Inversion with negative adverbials",
    chunks: [
      { en: "under no circumstances", vi: "trong bất kỳ hoàn cảnh nào cũng không", ex: "Under no circumstances should you yield." }
    ],
    speakingTask: "Argue against policy changes",
    writingTask: "Write a formal critique"
  };

  assert.equal(CurriculumContentEngine.hasCustomLesson(99), false);
  
  CurriculumContentEngine.setCustomLesson(mockLesson);
  assert.equal(CurriculumContentEngine.hasCustomLesson(99), true);

  const retrieved = CurriculumContentEngine.getDayLesson(99);
  assert.equal(retrieved.theme, "AI Generated Mastery Day 99");
  assert.equal(retrieved.speakingTask, "Argue against policy changes");

  CurriculumContentEngine.removeCustomLesson(99);
  assert.equal(CurriculumContentEngine.hasCustomLesson(99), false);
  const reverted = CurriculumContentEngine.getDayLesson(99);
  assert.notEqual(reverted.theme, "AI Generated Mastery Day 99");
});

test('LessonPromptBuilder & CurriculumContentEngine - supports all 9 Daily Blocks', () => {
  const complete9BlockJson = JSON.stringify({
    day: 5,
    theme: "Comprehensive Day 5 — Habit Formation & Productivity",
    grammar: {
      topic: "Conditionals with Inversion (Had I known, Should you need)",
      explanation: "Lý thuyết câu điều kiện đảo ngữ thể hiện sự trang trọng học thuật.",
      rules: ["Bỏ 'if', đảo trợ động từ lên trước chủ ngữ."],
      sentenceDrills: [
        { drill: "Had you invested earlier...", answer: "Had you invested earlier, returns would be higher." }
      ]
    },
    vocabDomain: "Productivity & Time Management",
    chunks: [
      { en: "deliberate practice", vi: "luyện tập có chủ đích", ex: "Deliberate practice is key." },
      { en: "cognitive load", vi: "tải trọng nhận thức", ex: "Minimize unnecessary cognitive load." }
    ],
    listening: {
      title: "The Neuroscience of Habit Loops",
      script: "Neuroscientists observe that cue-routine-reward loops govern human automaticity.",
      questions: ["What is the primary loop component?"],
      shadowingFocus: "Nối âm 'cue-and-routine' và nuốt âm /t/ trong automaticity."
    },
    reading: {
      title: "Deep Work Architectures",
      text: "Cal Newport argues that the ability to perform deep work is becoming increasingly rare.",
      prompt: "Summarize the primary thesis in 100 words.",
      vocabularyFocus: ["cognitive load", "deliberate practice", "automaticity"]
    },
    speaking: {
      topic: "Discuss how deep focus alters creative problem solving",
      prompt: "Thuyết trình 3 phút về deep focus",
      outline: ["Mở đầu 30s", "Thân bài 60s", "Kết luận 30s"],
      pronunciationTips: "Nhấn mạnh từ khóa nhận thức.",
      followUpQuestions: ["How to manage distractions?"]
    },
    writing: {
      topic: "Analyze the trade-offs of multitasking",
      prompt: "Viết bài luận 200 từ phân tích tác hại của multitasking",
      outline: "Introduction → Body → Conclusion",
      targetStructures: ["Had we understood cognitive switching costs"],
      sampleSnippet: "Had modern professionals understood switching costs, workflows would be different."
    },
    extensiveListening: {
      title: "Podcast: The Huberman Lab on Focus",
      description: "Thảo luận 90 phút về dopamine và nhịp điệu sinh học.",
      discussionQuestions: ["What protocol was most actionable?"],
      recommendedSources: "Huberman Lab Podcast Episode 42"
    },
    immersion: {
      context: "Môi trường văn phòng quốc tế và quản lý dự án linh hoạt (Agile).",
      realWorldExpressions: [
        { phrase: "get down to brass tacks", meaning: "đi thẳng vào vấn đề cốt lõi", situation: "Họp giao ban dự án" }
      ],
      mediaSuggestion: "Xem video phỏng vấn nhà thần kinh học."
    },
    srsAndErrorLog: {
      commonPitfalls: ["Quên đổi trật tự từ khi đảo ngữ với Had/Should"],
      reviewReminders: "Ôn 20 chunks và thêm lỗi đảo ngữ vào sổ lỗi vàng.",
      reflectionQuestions: ["Bạn đã vận dụng đảo ngữ thành thạo chưa?"]
    },
    scheduleBlocks: [
      { id: 1, time: "07:00–08:30", duration: "90 min", block: "Ngữ pháp: Đảo ngữ", mode: "Deep", output: "Hoàn thành 30 câu đảo ngữ", color: "#6366f1" },
      { id: 2, time: "09:00–10:30", duration: "90 min", block: "Nghe Chuyên Sâu: Habit Loops", mode: "Deep", output: "Dictation + Shadowing 5 lần", color: "#06b6d4" },
      { id: 3, time: "10:45–12:15", duration: "90 min", block: "20 Chunks: Productivity", mode: "Deep", output: "Nạp 20 chunks", color: "#10b981" },
      { id: 4, time: "13:15–14:45", duration: "90 min", block: "Active Reading: Deep Work", mode: "Medium", output: "Tóm tắt 100 từ", color: "#3b82f6" },
      { id: 5, time: "15:00–16:30", duration: "90 min", block: "Speaking: Deep Focus", mode: "Deep", output: "Thu âm Take 1 & 2", color: "#f59e0b" },
      { id: 6, time: "16:45–18:15", duration: "90 min", block: "Writing: Multitasking", mode: "Deep", output: "Draft 1 & Rewrite Draft 2", color: "#ec4899" },
      { id: 7, time: "19:15–20:45", duration: "90 min", block: "Extensive: Huberman Lab", mode: "Medium", output: "Nghe 90m", color: "#8b5cf6" },
      { id: 8, time: "21:00–22:30", duration: "90 min", block: "Immersion: Agile Workplace", mode: "Light", output: "Nạp thành ngữ thực tế", color: "#14b8a6" },
      { id: 9, time: "22:30–23:00", duration: "30 min", block: "SRS & Reflection", mode: "Light", output: "Nhật ký 3 dòng", color: "#64748b" }
    ]
  });

  const parsed = validateAndParseLessonJson(complete9BlockJson);
  assert.equal(parsed.success, true);
  assert.equal(parsed.lesson.day, 5);
  assert.equal(parsed.lesson.grammarDetail.rules.length, 1);
  assert.equal(parsed.lesson.grammarDetail.sentenceDrills.length, 1);
  assert.equal(parsed.lesson.listening.shadowingFocus.includes('Shadowing'), false);
  assert.equal(parsed.lesson.reading.vocabularyFocus.length, 3);
  assert.equal(parsed.lesson.speaking.outline.length, 3);
  assert.equal(parsed.lesson.writing.targetStructures.length, 1);
  assert.equal(parsed.lesson.extensiveListening.title, "Podcast: The Huberman Lab on Focus");
  assert.equal(parsed.lesson.immersion.realWorldExpressions.length, 1);
  assert.equal(parsed.lesson.srsAndErrorLog.reflectionQuestions.length, 1);
  assert.equal(parsed.lesson.scheduleBlocks.length, 9);
});

