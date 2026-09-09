/**
 * AI Curriculum Lesson Prompt Builder & Schema Validator
 * Generates CEFR-calibrated system prompts for ChatGPT / Claude / Gemini
 * and parses/validates structured JSON lesson payloads.
 */

import { getBootcampData } from '../data/dataLoader.js';

/**
 * Generate a strict, comprehensive AI prompt for a given day in the 120-day roadmap.
 * @param {number} dayNum
 * @returns {string}
 */
export function generateDayLessonPrompt(dayNum) {
  const targetDay = Number(dayNum) || 1;
  const bootcamp = getBootcampData() || {};
  const roadmap = bootcamp.roadmap || [];
  const dayData = roadmap.find(r => r.day === targetDay) || roadmap[0] || {
    day: targetDay,
    week: Math.ceil(targetDay / 7),
    level: 'B1',
    grammar: 'Target Grammar Structure',
    vocab: 'Academic & Professional English',
    speaking: 'Spontaneous communicative monologue',
    writing: 'Structured discursive paragraph',
    kpi: '20 target chunks, 1 recording, 1 rewrite'
  };

  return `You are a World-Class Cambridge C1 Curriculum Architect and CEFR Language Assessor.
Your mission is to generate a comprehensive, rigorous, all-in-one English learning package for Day ${dayData.day} of an intensive Bootcamp.
The Bootcamp daily schedule consists of 9 intensive learning blocks throughout the 12–14 hour day. You must generate high-yield learning content for ALL 9 BLOCKS.

### Target Parameters for Day ${dayData.day}:
- **CEFR Level**: ${dayData.level}
- **Curriculum Week**: Week ${dayData.week}
- **Target Grammar / Use of English**: "${dayData.grammar}"
- **Vocabulary Domain**: "${dayData.vocab}"
- **Spoken Task**: "${dayData.speaking}"
- **Written Task**: "${dayData.writing}"
- **Daily Target KPI**: "${dayData.kpi}"

---

### Output Requirements:
You must respond with a SINGLE, VALID, PARSABLE JSON object enclosed inside a \`\`\`json ... \`\`\` markdown code fence.
Do NOT include any conversational introduction, explanation, or pleasantries before or after the JSON code block.

The JSON object MUST strictly adhere to the following schema containing content for all 9 daily study blocks:

\`\`\`json
{
  "day": ${dayData.day},
  "week": ${dayData.week},
  "level": "${dayData.level}",
  "theme": "Day ${dayData.day} — ${dayData.grammar} (${dayData.vocab})",
  
  "grammar": {
    "topic": "${dayData.grammar}",
    "explanation": "Clear, concise linguistic explanation of ${dayData.grammar} tailored for ${dayData.level} learners with grammatical rules and formula.",
    "rules": [
      "Rule 1: Exact structural formula and usage trigger.",
      "Rule 2: Crucial nuance, common word-order traps, and contrast with similar tenses/structures.",
      "Rule 3: Natural spoken/written register considerations."
    ],
    "sentenceDrills": [
      {
        "drill": "Sentence transformation or gap-fill prompt applying ${dayData.grammar} in ${dayData.vocab} context.",
        "answer": "Complete authentic model sentence demonstrating high syntactic accuracy."
      },
      {
        "drill": "Sentence creation prompt challenging learner to express an opinion.",
        "answer": "Polished Cambridge C1 sentence."
      },
      {
        "drill": "Sentence combining drill using discourse markers.",
        "answer": "Model complex sentence."
      },
      {
        "drill": "Error correction or upgrade drill from B1 to ${dayData.level}.",
        "answer": "Refined native-like expression."
      }
    ]
  },

  "vocabDomain": "${dayData.vocab}",
  "chunks": [
    {
      "en": "high-yield collocation or idiom",
      "vi": "nghĩa tiếng Việt tương đương",
      "ex": "Example sentence using the chunk naturally in ${dayData.level} context."
    }
    // Generate EXACTLY 20 collocations / chunks for this topic!
  ],

  "listening": {
    "title": "Intensive Listening: Authentic dialogue/monologue title",
    "script": "A 180-250 word authentic spoken passage demonstrating ${dayData.grammar} and natural reductions / connected speech.",
    "questions": [
      "1. Comprehension question 1?",
      "2. Comprehension question 2?",
      "3. Inference / lexical question 3?"
    ],
    "shadowingFocus": "Specific phonetic focus: linking sounds, weak forms (schwa), or sentence stress patterns to exaggerate during shadowing."
  },

  "reading": {
    "title": "Active Reading: Perspectives on ${dayData.vocab}",
    "text": "A 220-300 word dense academic/discursive passage modeling ${dayData.grammar} and lexical precision.",
    "prompt": "Summarize in 80–120 words how applying ${dayData.grammar} elevates argument clarity regarding ${dayData.vocab}.",
    "vocabularyFocus": [
      "key academic term 1",
      "key academic term 2",
      "key academic term 3",
      "key academic term 4"
    ]
  },

  "speaking": {
    "topic": "${dayData.speaking}",
    "prompt": "Detailed speaking prompt: Deliver a 2–3 minute structured monologue on ${dayData.speaking} using at least 5 target chunks and ${dayData.grammar}.",
    "outline": [
      "Introduction (30s): Frame the core premise and define key terms.",
      "Main Argument (60s): Analyze the primary dimension with concrete examples.",
      "Counter-perspective & Nuance (45s): Address alternative viewpoints.",
      "Conclusion (25s): Synthesize findings and articulate actionable takeaway."
    ],
    "pronunciationTips": "Intonation guide: contrastive pitch accents, pauses before clauses, and clear consonant cluster endings.",
    "followUpQuestions": [
      "Follow-up question 1 challenging spontaneous defense of arguments?",
      "Follow-up question 2 testing quick hypothetical thinking?"
    ]
  },

  "writing": {
    "topic": "${dayData.writing}",
    "prompt": "Comprehensive writing prompt: ${dayData.writing} (Target 180–240 words; incorporate ${dayData.grammar} and at least 6 target chunks).",
    "outline": "Introduction (Hook + Thesis statement) → Body Paragraph 1 (Topic sentence + Evidence) → Body Paragraph 2 (Analytical depth) → Conclusion (Synthesis).",
    "targetStructures": [
      "Incorporate ${dayData.grammar} in the thesis or topic sentence.",
      "Use at least two cohesive transition markers (e.g., 'Consequently', 'In stark contrast')."
    ],
    "sampleSnippet": "A model 60–80 word exemplary opening paragraph illustrating Cambridge C1 style."
  },

  "speakingTask": "Deliver a 2–3 minute structured monologue on ${dayData.speaking} using at least 5 target chunks and ${dayData.grammar}.",
  "writingTask": "Write a 180–240 word text on: ${dayData.writing} (Incorporate ${dayData.grammar} and target chunks).",

  "extensiveListening": {
    "title": "Extensive Listening & Conversation: Real-World Discussion on ${dayData.vocab}",
    "description": "Summary of natural conversational dynamics and spontaneous communicative strategies.",
    "discussionQuestions": [
      "To what extent do you agree with the speaker's main thesis?",
      "How would you address this challenge in your own professional or cultural environment?"
    ],
    "recommendedSources": "Recommended podcasts, NPR/BBC episodes, or YouTube documentaries on ${dayData.vocab}"
  },

  "immersion": {
    "context": "Authentic real-world scenario (workplace, international negotiation, or cultural immersion) featuring ${dayData.vocab}.",
    "realWorldExpressions": [
      {
        "phrase": "authentic idiom / colloquial expression 1",
        "meaning": "Vietnamese explanation",
        "situation": "When and how native speakers deploy this phrase in real life."
      },
      {
        "phrase": "authentic idiom / colloquial expression 2",
        "meaning": "Vietnamese explanation",
        "situation": "Practical workplace or social context."
      },
      {
        "phrase": "authentic idiom / colloquial expression 3",
        "meaning": "Vietnamese explanation",
        "situation": "Everyday communicative scenario."
      }
    ],
    "mediaSuggestion": "Short authentic video / news report suggestion relevant to ${dayData.vocab}."
  },

  "srsAndErrorLog": {
    "commonPitfalls": [
      "Frequent Vietnamese learner fossilized mistake regarding ${dayData.grammar} and how to eradicate it.",
      "Collocation / preposition mispairing to avoid."
    ],
    "reviewReminders": "Spaced repetition checklist for the 20 target chunks and grammar cards.",
    "reflectionQuestions": [
      "What was the most challenging grammatical or phonetic nuance encountered today?",
      "Which target collocation did you successfully produce spontaneously?",
      "What is your priority adjustment for tomorrow's study blocks?"
    ]
  },

  "scheduleBlocks": [
    {
      "id": 1,
      "time": "07:00–08:30",
      "duration": "90 min",
      "block": "Ngữ pháp: ${dayData.grammar}",
      "mode": "Deep",
      "output": "Nắm vững lý thuyết + 30–50 câu thực hành sentence drills",
      "color": "#6366f1"
    },
    {
      "id": 2,
      "time": "09:00–10:30",
      "duration": "90 min",
      "block": "Nghe Chuyên Sâu: Chủ đề ${dayData.vocab}",
      "mode": "Deep",
      "output": "Dictation + 3 câu hỏi nghe hiểu + Shadowing ngữ điệu",
      "color": "#06b6d4"
    },
    {
      "id": 3,
      "time": "10:45–12:15",
      "duration": "90 min",
      "block": "20 Chunks & Collocations Ngày ${dayData.day}",
      "mode": "Deep",
      "output": "Học 20 chunks + nghe TTS + nạp vào Anki/SRS",
      "color": "#10b981"
    },
    {
      "id": 4,
      "time": "13:15–14:45",
      "duration": "90 min",
      "block": "Active Reading: ${dayData.vocab}",
      "mode": "Medium",
      "output": "Đọc văn bản phân tích + tóm tắt 80–120 từ",
      "color": "#3b82f6"
    },
    {
      "id": 5,
      "time": "15:00–16:30",
      "duration": "90 min",
      "block": "Speaking & Phát Âm: ${dayData.speaking}",
      "mode": "Deep",
      "output": "Thu âm bài nói Take 1 & Take 2 theo dàn ý 3 phần",
      "color": "#f59e0b"
    },
    {
      "id": 6,
      "time": "16:45–18:15",
      "duration": "90 min",
      "block": "Writing Studio: ${dayData.writing}",
      "mode": "Deep",
      "output": "Hoàn thành Draft 1 → Phân tích lỗi → Rewrite Draft 2",
      "color": "#ec4899"
    },
    {
      "id": 7,
      "time": "19:15–20:45",
      "duration": "90 min",
      "block": "Extensive Listening & Hội Thoại Thảo Luận",
      "mode": "Medium",
      "output": "60–90m nghe mở rộng + trả lời 2 câu hỏi phản xạ",
      "color": "#8b5cf6"
    },
    {
      "id": 8,
      "time": "21:00–22:30",
      "duration": "90 min",
      "block": "Immersion Thực Tế: ${dayData.vocab}",
      "mode": "Light",
      "output": "Nạp 3 thành ngữ đời thực + xem media bản xứ",
      "color": "#14b8a6"
    },
    {
      "id": 9,
      "time": "22:30–23:00",
      "duration": "30 min",
      "block": "SRS Review & Nhật Ký Phản Tư 3 Dòng",
      "mode": "Light",
      "output": "Ôn thẻ SRS đến hạn + ghi sổ lỗi + hoàn thành nhật ký 3 dòng",
      "color": "#64748b"
    }
  ]
}
\`\`\`

Generate the complete JSON package now:`;
}

/**
 * Validate and parse raw AI text into a sanitized lesson object supporting all 9 daily blocks.
 * @param {string} rawText
 * @returns {{ success: boolean, lesson?: Object, error?: string }}
 */
export function validateAndParseLessonJson(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return { success: false, error: 'Dữ liệu nhập vào trống. Vui lòng dán phản hồi JSON từ AI.' };
  }

  let cleaned = rawText.trim();

  // Extract JSON from markdown code fences if present
  const jsonFenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonFenceMatch) {
    cleaned = jsonFenceMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    return {
      success: false,
      error: `Lỗi cú pháp JSON: ${err.message}. Hãy chắc chắn AI đã xuất đúng định dạng JSON chuẩn.`
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: 'Dữ liệu JSON phải là một đối tượng (Object).' };
  }

  const day = Number(parsed.day);
  if (isNaN(day) || day < 1 || day > 120) {
    return { success: false, error: 'Trường "day" phải là số nguyên từ 1 đến 120.' };
  }

  if (!parsed.theme || typeof parsed.theme !== 'string') {
    return { success: false, error: 'Thiếu trường "theme" (Chủ đề bài học).' };
  }

  if (!parsed.grammar) {
    return { success: false, error: 'Thiếu trường "grammar" (Ngữ pháp mục tiêu).' };
  }

  // Chunks validation
  if (!Array.isArray(parsed.chunks) || parsed.chunks.length === 0) {
    return { success: false, error: 'Trường "chunks" phải là một mảng chứa danh sách cụm từ/collocations.' };
  }

  const sanitizedChunks = [];
  for (let i = 0; i < parsed.chunks.length; i++) {
    const c = parsed.chunks[i];
    if (!c || typeof c !== 'object') continue;
    if (!c.en || typeof c.en !== 'string') continue;
    sanitizedChunks.push({
      en: c.en.trim(),
      vi: (c.vi && typeof c.vi === 'string') ? c.vi.trim() : 'Đang cập nhật nghĩa',
      ex: (c.ex && typeof c.ex === 'string') ? c.ex.trim() : `Example with "${c.en}".`
    });
  }

  if (sanitizedChunks.length === 0) {
    return { success: false, error: 'Không tìm thấy cụm từ hợp lệ nào trong trường "chunks" (cần có en, vi, ex).' };
  }

  // Listening validation
  if (!parsed.listening || typeof parsed.listening !== 'object') {
    return { success: false, error: 'Thiếu trường "listening" (Bài nghe chuyên sâu).' };
  }
  if (!parsed.listening.script || typeof parsed.listening.script !== 'string') {
    return { success: false, error: 'Thiếu trường "listening.script" (Transcript bài nghe).' };
  }

  // Reading validation
  if (!parsed.reading || typeof parsed.reading !== 'object') {
    return { success: false, error: 'Thiếu trường "reading" (Bài đọc phân tích).' };
  }
  if (!parsed.reading.text || typeof parsed.reading.text !== 'string') {
    return { success: false, error: 'Thiếu trường "reading.text" (Nội dung bài đọc).' };
  }

  // 1. Sanitize Grammar (Object or String)
  let grammarTopic = 'Target Grammar Structure';
  let grammarExplanation = '';
  let grammarRules = [];
  let grammarSentenceDrills = [];

  if (typeof parsed.grammar === 'object' && parsed.grammar !== null) {
    grammarTopic = parsed.grammar.topic || parsed.grammar.title || 'Target Grammar Structure';
    grammarExplanation = parsed.grammar.explanation || `Lý thuyết và nguyên lý sử dụng "${grammarTopic}" chuẩn Cambridge CEFR.`;
    grammarRules = Array.isArray(parsed.grammar.rules) ? parsed.grammar.rules : [
      `Áp dụng chính xác hình thái và trật tự từ của ${grammarTopic}.`,
      `Chú ý phối hợp thì và hòa hợp ngữ pháp trong ngữ cảnh tự nhiên.`
    ];
    grammarSentenceDrills = Array.isArray(parsed.grammar.sentenceDrills) ? parsed.grammar.sentenceDrills : [];
  } else if (typeof parsed.grammar === 'string') {
    grammarTopic = parsed.grammar.trim();
    grammarExplanation = `Quy tắc cốt lõi và ứng dụng ngữ pháp: ${grammarTopic}.`;
    grammarRules = [
      `Nắm vững công thức và vị trí của ${grammarTopic} trong câu.`,
      `Tránh dịch thô từng từ (word-by-word) từ tiếng Việt sang tiếng Anh.`
    ];
    grammarSentenceDrills = [
      {
        drill: `Vận dụng cấu trúc "${grammarTopic}" để đặt 1 câu văn tự nhiên.`,
        answer: `Example authentic sentence demonstrating ${grammarTopic}.`
      }
    ];
  }

  // 2. Sanitize Speaking (Object or Task String)
  let speakingTopic = 'Spoken Task';
  let speakingPrompt = 'Luyện nói tự do theo chủ đề của ngày.';
  let speakingOutline = [];
  let speakingPronunciationTips = '';
  let speakingFollowUp = [];

  if (typeof parsed.speaking === 'object' && parsed.speaking !== null) {
    speakingTopic = parsed.speaking.topic || 'Spoken Task';
    speakingPrompt = parsed.speaking.prompt || parsed.speakingTask || `Thuyết trình 2–3 phút về ${speakingTopic}.`;
    speakingOutline = Array.isArray(parsed.speaking.outline) ? parsed.speaking.outline : [
      'Mở đầu (30s): Giới thiệu quan điểm trực tiếp.',
      'Thân bài (60s): 2 luận điểm phân tích có ví dụ dẫn chứng.',
      'Kết luận (30s): Tóm tắt và đúc kết giải pháp.'
    ];
    speakingPronunciationTips = parsed.speaking.pronunciationTips || 'Chú ý nối âm tự nhiên, giữ trường độ nguyên âm dài và phát âm rõ âm đuôi.';
    speakingFollowUp = Array.isArray(parsed.speaking.followUpQuestions) ? parsed.speaking.followUpQuestions : [
      'How does this trend influence modern communication?'
    ];
  } else {
    speakingPrompt = (parsed.speakingTask && typeof parsed.speakingTask === 'string') ? parsed.speakingTask.trim() : (typeof parsed.speaking === 'string' ? parsed.speaking.trim() : 'Luyện nói tự do theo chủ đề của ngày.');
    speakingOutline = [
      'Mở đầu (30s): Giới thiệu quan điểm.',
      'Thân bài (60s): Phân tích luận điểm chính.',
      'Kết luận (30s): Đúc kết bài học.'
    ];
    speakingPronunciationTips = 'Luyện nối âm (linking sounds) và nhấn trọng âm từ khóa.';
    speakingFollowUp = ['How would you apply this concept in your own work or life?'];
  }

  // 3. Sanitize Writing (Object or Task String)
  let writingTopic = 'Written Task';
  let writingPrompt = 'Viết bài luận ngắn ứng dụng ngữ pháp của ngày.';
  let writingOutline = 'Introduction → Body Paragraphs → Conclusion';
  let writingTargetStructures = [];
  let writingSampleSnippet = '';

  if (typeof parsed.writing === 'object' && parsed.writing !== null) {
    writingTopic = parsed.writing.topic || 'Written Task';
    writingPrompt = parsed.writing.prompt || parsed.writingTask || `Viết bài luận 180–240 từ: ${writingTopic}`;
    writingOutline = parsed.writing.outline || 'Introduction (Thesis) → Body 1 (Evidence) → Body 2 (Analytical depth) → Conclusion.';
    writingTargetStructures = Array.isArray(parsed.writing.targetStructures) ? parsed.writing.targetStructures : [
      `Ứng dụng linh hoạt cấu trúc ${grammarTopic}`,
      `Kết nối ý bằng các liên từ học thuật (Furthermore, In light of, Consequently)`
    ];
    writingSampleSnippet = parsed.writing.sampleSnippet || '';
  } else {
    writingPrompt = (parsed.writingTask && typeof parsed.writingTask === 'string') ? parsed.writingTask.trim() : (typeof parsed.writing === 'string' ? parsed.writing.trim() : 'Viết bài luận ngắn ứng dụng ngữ pháp của ngày.');
    writingTargetStructures = [`Ứng dụng cấu trúc ${grammarTopic}`];
    writingSampleSnippet = `Regarding ${parsed.vocabDomain || 'this topic'}, structured writing requires deliberate lexical choices and syntactic variety.`;
  }

  // 4. Sanitize Extensive Listening & Conversation
  const extensiveListening = (parsed.extensiveListening && typeof parsed.extensiveListening === 'object') ? {
    title: parsed.extensiveListening.title || `Extensive Listening: ${parsed.vocabDomain || 'Natural English'}`,
    description: parsed.extensiveListening.description || `Lắng nghe thảo luận mở rộng và thực hành phản xạ đàm thoại.`,
    discussionQuestions: Array.isArray(parsed.extensiveListening.discussionQuestions) ? parsed.extensiveListening.discussionQuestions : [
      'To what extent do you align with the speaker\'s perspective?',
      'What alternative viewpoint would you propose?'
    ],
    recommendedSources: parsed.extensiveListening.recommendedSources || 'BBC 6 Minute English, NPR News, TED Radio Hour'
  } : {
    title: `Extensive Listening & Conversation (${parsed.level || 'C1'})`,
    description: `60–90 phút nghe thụ cảm tự nhiên và thảo luận phản biện không phụ đề.`,
    discussionQuestions: [
      'What are the primary implications discussed in this topic?',
      'How would you summarize the core argument in two sentences?'
    ],
    recommendedSources: 'VOA Learning English, BBC Radio 4, TED Talks'
  };

  // 5. Sanitize Immersion
  const immersion = (parsed.immersion && typeof parsed.immersion === 'object') ? {
    context: parsed.immersion.context || `Tình huống thực tế đời sống & công sở quốc tế liên quan đến ${parsed.vocabDomain || 'tiếng Anh thực chiến'}.`,
    realWorldExpressions: Array.isArray(parsed.immersion.realWorldExpressions) ? parsed.immersion.realWorldExpressions : [
      { phrase: "at the forefront of", meaning: "ở vị trí tiên phong", situation: "Thảo luận về sự đổi mới và bước tiến vượt bậc" },
      { phrase: "shed light on", meaning: "làm sáng tỏ vấn đề", situation: "Khi giải thích phân tích nguyên nhân" }
    ],
    mediaSuggestion: parsed.immersion.mediaSuggestion || 'Video phóng sự ngắn hoặc bài xã luận báo chí bản xứ.'
  } : {
    context: `Ứng dụng thực tế: Giao tiếp đời sống và tình huống làm việc thực tế.`,
    realWorldExpressions: [
      { phrase: "bear in mind", meaning: "hãy ghi nhớ rằng", situation: "Khi lưu ý nguyên tắc quan trọng" },
      { phrase: "gain traction", meaning: "bắt đầu tạo được đà phát triển", situation: "Nói về sáng kiến hoặc dự án" }
    ],
    mediaSuggestion: 'Theo dõi tin tức thời sự trên Bloomberg, Reuters hoặc BBC.'
  };

  // 6. Sanitize SRS & Error Log
  const srsAndErrorLog = (parsed.srsAndErrorLog && typeof parsed.srsAndErrorLog === 'object') ? {
    commonPitfalls: Array.isArray(parsed.srsAndErrorLog.commonPitfalls) ? parsed.srsAndErrorLog.commonPitfalls : [
      `Lỗi dùng sai giới từ hoặc chia sai thì với cấu trúc ${grammarTopic}.`,
      `Lỗi dịch word-by-word từ tiếng Việt thay vì dùng trọn vẹn cụm collocation chuẩn.`
    ],
    reviewReminders: parsed.srsAndErrorLog.reviewReminders || `Ôn tập 20 chunks mới trên Flashcards SRS và ghi nhận các lỗi mắc phải vào sổ lỗi vàng.`,
    reflectionQuestions: Array.isArray(parsed.srsAndErrorLog.reflectionQuestions) ? parsed.srsAndErrorLog.reflectionQuestions : [
      'Khái niệm hoặc cụm từ đắc ý nhất bạn đã sử dụng hôm nay?',
      'Lỗi nào bạn suýt mắc phải và đã kịp thời sửa?',
      'Mục tiêu cải thiện quan trọng nhất cho ngày mai?'
    ]
  } : {
    commonPitfalls: [
      `Lỗi dịch thô từng từ khiến câu văn thiếu tự nhiên.`,
      `Quên nuốt âm hoặc nối âm khi nói nhanh.`
    ],
    reviewReminders: `Ôn tập toàn bộ thẻ SRS đến hạn và hoàn thành nhật ký phản tư 3 dòng.`,
    reflectionQuestions: [
      'Bạn đã học được cụm từ nào giá trị nhất hôm nay?',
      'Cấu trúc ngữ pháp nào bạn thấy tự tin hơn khi sử dụng?',
      'Kế hoạch cụ thể cho bài học ngày mai là gì?'
    ]
  };

  // 7. Sanitize Schedule Blocks
  let scheduleBlocks = [];
  if (Array.isArray(parsed.scheduleBlocks) && parsed.scheduleBlocks.length > 0) {
    scheduleBlocks = parsed.scheduleBlocks.map((b, idx) => ({
      id: b.id || (idx + 1),
      time: b.time || '07:00–08:30',
      duration: b.duration || '90 min',
      durationMinutes: b.durationMinutes || (b.duration ? parseInt(b.duration) : 90),
      block: b.block || `Khối ${idx + 1}`,
      mode: b.mode || 'Deep',
      output: b.output || 'Mục tiêu học tập cụ thể',
      color: b.color || '#6366f1'
    }));
  } else {
    // Default 9-block tailored structure
    scheduleBlocks = [
      { id: 1, time: "07:00–08:30", duration: "90 min", block: `Ngữ pháp: ${grammarTopic}`, mode: "Deep", output: "Lý thuyết cốt lõi + thực hành sentence drills", color: "#6366f1" },
      { id: 2, time: "09:00–10:30", duration: "90 min", block: `Nghe Chuyên Sâu: ${parsed.listening?.title || 'Listening Script'}`, mode: "Deep", output: "Dictation + 3 câu hỏi hiểu + Shadowing ngữ điệu", color: "#06b6d4" },
      { id: 3, time: "10:45–12:15", duration: "90 min", block: `20 Chunks Ngày ${day}: ${parsed.vocabDomain || 'Collocations'}`, mode: "Deep", output: "Học 20 chunks + nghe mẫu TTS + nạp SRS", color: "#10b981" },
      { id: 4, time: "13:15–14:45", duration: "90 min", block: `Active Reading: ${parsed.reading?.title || 'Perspectives'}`, mode: "Medium", output: "Đọc phân tích + tóm tắt 80–120 từ", color: "#3b82f6" },
      { id: 5, time: "15:00–16:30", duration: "90 min", block: `Speaking: ${speakingTopic}`, mode: "Deep", output: "Thu âm Take 1 & Take 2 theo dàn ý 3 phần", color: "#f59e0b" },
      { id: 6, time: "16:45–18:15", duration: "90 min", block: `Writing: ${writingTopic}`, mode: "Deep", output: "Draft 1 → Phân tích lỗi → Rewrite Draft 2", color: "#ec4899" },
      { id: 7, time: "19:15–20:45", duration: "90 min", block: `Extensive Listening & Hội Thoại`, mode: "Medium", output: "60–90m nghe mở rộng + câu hỏi phản biện", color: "#8b5cf6" },
      { id: 8, time: "21:00–22:30", duration: "90 min", block: `Immersion: ${parsed.vocabDomain || 'Thực Tế'}`, mode: "Light", output: "3 thành ngữ đời thực + video học liệu mở", color: "#14b8a6" },
      { id: 9, time: "22:30–23:00", duration: "30 min", block: `SRS Review & Nhật Ký Phản Tư`, mode: "Light", output: "Ôn thẻ SRS + ghi sổ lỗi + nhật ký 3 dòng", color: "#64748b" }
    ];
  }

  // Build complete sanitized lesson object
  const sanitizedLesson = {
    day,
    week: Number(parsed.week) || Math.ceil(day / 7),
    level: parsed.level || 'B1',
    theme: parsed.theme.trim(),
    grammar: grammarTopic,
    grammarDetail: {
      topic: grammarTopic,
      explanation: grammarExplanation,
      rules: grammarRules,
      sentenceDrills: grammarSentenceDrills
    },
    vocab: parsed.vocabDomain || parsed.vocab || 'General Context',
    vocabDomain: parsed.vocabDomain || parsed.vocab || 'General Context',
    chunks: sanitizedChunks,
    listening: {
      title: parsed.listening.title || `Intensive Listening (Day ${day})`,
      script: parsed.listening.script.trim(),
      questions: Array.isArray(parsed.listening.questions) ? parsed.listening.questions : ['Tóm tắt ý chính của bài nghe.'],
      shadowingFocus: parsed.listening.shadowingFocus || 'Chú ý nối âm tự nhiên và ngữ điệu câu hỏi.'
    },
    reading: {
      title: parsed.reading.title || `Active Reading (Day ${day})`,
      text: parsed.reading.text.trim(),
      prompt: parsed.reading.prompt || 'Viết bài tóm tắt ngắn từ 80-120 từ.',
      vocabularyFocus: Array.isArray(parsed.reading.vocabularyFocus) ? parsed.reading.vocabularyFocus : []
    },
    speaking: {
      topic: speakingTopic,
      prompt: speakingPrompt,
      outline: speakingOutline,
      pronunciationTips: speakingPronunciationTips,
      followUpQuestions: speakingFollowUp
    },
    speakingTask: speakingPrompt,
    writing: {
      topic: writingTopic,
      prompt: writingPrompt,
      outline: writingOutline,
      targetStructures: writingTargetStructures,
      sampleSnippet: writingSampleSnippet
    },
    writingTask: writingPrompt,
    extensiveListening,
    immersion,
    srsAndErrorLog,
    scheduleBlocks,
    mediaEmbed: parsed.mediaEmbed && typeof parsed.mediaEmbed === 'object' ? parsed.mediaEmbed : null,
    isCustomAiLesson: true,
    importedAt: new Date().toISOString()
  };

  return {
    success: true,
    lesson: sanitizedLesson
  };
}

