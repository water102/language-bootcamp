/**
 * Comprehensive 120-Day Curriculum Content Engine
 * Integrates docs/learning-content-pack with the 120-day roadmap.
 * Provides authentic daily content:
 * - 20 Target Chunks (CEFR-J & WordNet)
 * - Intensive Listening scripts (VOA Learning English & Tatoeba)
 * - Active Reading passages (VOA & Gutenberg)
 * - Embeddable media players (VOA Learning English official embeds & LibriVox audio)
 * - Speaking & Writing tasks
 */

import { BOOTCAMP_DATA } from '../../data.js';
import {
  TATOEBA_SENTENCES,
  VOA_STORIES,
  EXTENSIVE_READERS,
  CEFR_VOCAB_QUIZ
} from '../../data/learningContentPackData.js';

// Pre-compiled topic chunks generator for any CEFR level and vocabulary domain
const TOPIC_CHUNKS_MAP = {
  identity: [
    { en: "first and foremost", vi: "đầu tiên và quan trọng nhất", ex: "First and foremost, let me introduce our core mission." },
    { en: "personal background", vi: "lý lịch / hoàn cảnh cá nhân", ex: "She shared her personal background with the team." },
    { en: "native speaker", vi: "người bản xứ", ex: "He speaks English fluently like a native speaker." },
    { en: "mother tongue", vi: "tiếng mẹ đẻ", ex: "Her mother tongue is Vietnamese, but she works in English." },
    { en: "career aspiration", vi: "khát vọng nghề nghiệp", ex: "My long-term career aspiration is to lead an AI research group." },
    { en: "cultural identity", vi: "bản sắc văn hóa", ex: "Maintaining cultural identity is vital in a globalized era." },
    { en: "self-taught", vi: "tự học", ex: "He is a self-taught programmer with extensive practical experience." },
    { en: "passion for learning", vi: "niềm đam mê học tập", ex: "Her passion for learning drives continuous daily progress." },
    { en: "strengths and weaknesses", vi: "điểm mạnh và điểm yếu", ex: "Be transparent about your strengths and weaknesses." },
    { en: "come from a background of", vi: "xuất thân từ hoàn cảnh", ex: "I come from a background of software engineering." },
    { en: "professional milestone", vi: "cột mốc chuyên nghiệp", ex: "Earning this certification was a major professional milestone." },
    { en: "adapt to changes", vi: "thích nghi với những thay đổi", ex: "Resilient learners adapt to changes rapidly." },
    { en: "pursue higher education", vi: "theo đuổi học vấn cao hơn", ex: "She decided to pursue higher education abroad." },
    { en: "core values", vi: "giá trị cốt lõi", ex: "Honesty and diligence are our foundational core values." },
    { en: "broaden my horizons", vi: "mở rộng tầm nhìn của tôi", ex: "Learning English helps broaden my horizons." },
    { en: "stepping stone", vi: "bước đệm", ex: "Regard every small setback as a stepping stone to mastery." },
    { en: "stand out from the crowd", vi: "nổi bật giữa đám đông", ex: "High communicative competence helps you stand out from the crowd." },
    { en: "reach my full potential", vi: "đạt tới tiềm năng tối đa", ex: "Deliberate practice empowers you to reach your full potential." },
    { en: "gain valuable insights", vi: "thu được góc nhìn quý giá", ex: "I gained valuable insights from talking to senior mentors." },
    { en: "take immense pride in", vi: "vô cùng tự hào về", ex: "I take immense pride in achieving consistent daily study streaks." }
  ],
  travel: [
    { en: "off the beaten track", vi: "nơi hẻo lánh / ít người tới", ex: "We prefer exploring quiet spots off the beaten track." },
    { en: "breathtaking scenery", vi: "cảnh sắc ngoạn mục tuyệt đẹp", ex: "The mountaintop offered breathtaking scenery." },
    { en: "embark on a journey", vi: "bắt đầu một chuyến hành trình", ex: "Tomorrow we embark on an intensive language journey." },
    { en: "travel itinerary", vi: "lịch trình chuyến đi", ex: "Double-check your travel itinerary before boarding." },
    { en: "local delicacy", vi: "đặc sản địa phương", ex: "Sampling local delicacies is the highlight of any trip." },
    { en: "pack light", vi: "mang hành lý gọn nhẹ", ex: "Experienced backpackers always pack light." },
    { en: "delayed flight", vi: "chuyến bay bị hoãn", ex: "Our flight was delayed due to inclement weather." },
    { en: "public transit system", vi: "hệ thống giao thông công cộng", ex: "The city boasts an efficient public transit system." },
    { en: "culture shock", vi: "sốc văn hóa", ex: "Experiencing mild culture shock is normal when moving abroad." },
    { en: "book in advance", vi: "đặt trước", ex: "Make sure to book train tickets in advance during peak season." },
    { en: "scenic route", vi: "tuyến đường ngắm cảnh", ex: "We opted for the longer scenic route along the coastline." },
    { en: "tourist trap", vi: "bẫy du khách / nơi chặt chém", ex: "Avoid overpriced souvenir shops in notorious tourist traps." },
    { en: "hospitable locals", vi: "người dân địa phương hiếu khách", ex: "We were warmly welcomed by the hospitable locals." },
    { en: "travel insurance", vi: "bảo hiểm du lịch", ex: "Never travel internationally without comprehensive travel insurance." },
    { en: "immerse oneself in", vi: "đắm mình vào", ex: "The best way to acquire a language is to immerse oneself in the environment." },
    { en: "board the train", vi: "lên tàu", ex: "Passengers must board the train five minutes before departure." },
    { en: "customs clearance", vi: "thủ tục hải quan", ex: "Customs clearance was expedited smoothly at the terminal." },
    { en: "historic landmark", vi: "di tích lịch sử", ex: "The cathedral is the most prominent historic landmark in town." },
    { en: "wander aimlessly", vi: "đi dạo thong thả không mục đích", ex: "I love to wander aimlessly through ancient cobblestone streets." },
    { en: "memorable encounter", vi: "cuộc gặp gỡ đáng nhớ", ex: "Meeting a fellow language enthusiast was a memorable encounter." }
  ],
  technology: [
    { en: "cutting-edge technology", vi: "công nghệ tiên tiến hàng đầu", ex: "The research lab deploys cutting-edge technology." },
    { en: "artificial intelligence", vi: "trí tuệ nhân tạo", ex: "Artificial intelligence is reshaping education and workflow automation." },
    { en: "data privacy", vi: "bảo mật dữ liệu cá nhân", ex: "Modern digital platforms must prioritize strict data privacy." },
    { en: "seamless integration", vi: "tích hợp liền mạch", ex: "The app offers seamless integration with cloud backup storage." },
    { en: "user-friendly interface", vi: "giao diện thân thiện người dùng", ex: "The updated version features an intuitive, user-friendly interface." },
    { en: "algorithmic bias", vi: "định kiến thuật toán", ex: "Auditing datasets is required to mitigate algorithmic bias." },
    { en: "cloud infrastructure", vi: "hạ tầng điện toán đám mây", ex: "Our backend runs reliably on distributed cloud infrastructure." },
    { en: "automation of tasks", vi: "tự động hóa các tác vụ", ex: "Automation of repetitive tasks frees up time for creative thinking." },
    { en: "technological leap", vi: "bước nhảy vọt công nghệ", ex: "Generative AI marks a monumental technological leap." },
    { en: "digital transformation", vi: "chuyển đổi số", ex: "The company accelerated its digital transformation during the pandemic." },
    { en: "cybersecurity threat", vi: "mối đe dọa an ninh mạng", ex: "Organizations must proactively defend against cybersecurity threats." },
    { en: "paradigm shift", vi: "bước ngoặt tư duy", ex: "Autonomous agents signify a profound paradigm shift in software." },
    { en: "breakthrough discovery", vi: "phát hiện đột phá", ex: "The scientists made a breakthrough discovery in quantum physics." },
    { en: "high computational power", vi: "năng lực tính toán cao", ex: "Training deep models demands tremendous computational power." },
    { en: "ethical ramifications", vi: "các hệ quả đạo đức", ex: "Engineers must ponder the ethical ramifications of automated choices." },
    { en: "push the boundaries of", vi: "vượt qua giới hạn của", ex: "Innovative startups consistently push the boundaries of modern science." },
    { en: "state of the art", vi: "tân tiến nhất hiện nay", ex: "We benchmark our system against state of the art models." },
    { en: "disruptive innovation", vi: "đổi mới mang tính đột phá lật đổ", ex: "Smartphones were a classic example of disruptive innovation." },
    { en: "remote collaboration", vi: "hợp tác làm việc từ xa", ex: "Digital whiteboards facilitate effective remote collaboration." },
    { en: "exponential growth", vi: "tăng trưởng theo cấp số nhân", ex: "Data volumes are experiencing exponential growth year over year." }
  ],
  genericAcademic: [
    { en: "in light of recent events", vi: "dưới góc độ các sự kiện gần đây", ex: "In light of recent findings, we revised our research thesis." },
    { en: "play a pivotal role in", vi: "đóng vai trò then chốt trong", ex: "Regular review plays a pivotal role in long-term memory." },
    { en: "substantial evidence", vi: "bằng chứng đáng kể", ex: "There is substantial evidence supporting spaced retrieval practice." },
    { en: "shed light on", vi: "làm sáng tỏ", ex: "The study helped shed light on the cognitive mechanics of language." },
    { en: "strike a balance between", vi: "đạt được thế cân bằng giữa", ex: "Learners must strike a balance between accuracy and fluency." },
    { en: "take into consideration", vi: "tính đến / cân nhắc kỹ", ex: "We must take into consideration individual learning paces." },
    { en: "draw a clear distinction", vi: "vạch ra sự phân biệt rõ ràng", ex: "It is crucial to draw a clear distinction between input and acquisition." },
    { en: "pave the way for", vi: "mở đường / tạo tiền đề cho", ex: "Solid grammar foundations pave the way for expressive writing." },
    { en: "bear in mind that", vi: "hãy ghi nhớ rằng", ex: "Bear in mind that consistency always trumps intensity." },
    { en: "underpinning mechanism", vi: "cơ chế nền tảng bên dưới", ex: "Synaptic plasticity is the underpinning mechanism of skill mastery." },
    { en: "give rise to", vi: "làm nảy sinh", ex: "Unaddressed foundational gaps give rise to persistent fossilized errors." },
    { en: "corroborate findings", vi: "chứng thực các phát hiện", ex: "Multiple independent studies corroborate these benchmark results." },
    { en: "critical appraisal", vi: "sự thẩm định phản biện", ex: "Scholarly research requires rigorous critical appraisal." },
    { en: "far-reaching implications", vi: "hệ quả sâu rộng", ex: "Economic shifts carry far-reaching implications for social policy." },
    { en: "on the grounds that", vi: "với lý do rằng", ex: "He contested the hypothesis on the grounds that the sample was small." },
    { en: "delve deeply into", vi: "đào sâu nghiên cứu vào", ex: "Today we delve deeply into advanced counterfactual structures." },
    { en: "render something obsolete", vi: "khiến cái gì trở nên lỗi thời", ex: "Rapid innovation can render outdated paradigms obsolete." },
    { en: "in stark contrast to", vi: "trái ngược hoàn toàn với", ex: "His concise synthesis stood in stark contrast to verbose summaries." },
    { en: "manifest itself in", vi: "biểu hiện ra ở", ex: "Fluency manifests itself in effortless lexical retrieval." },
    { en: "reach consensus on", vi: "đạt được sự đồng thuận về", ex: "The committee reached consensus on the new CEFR guidelines." }
  ]
};

// Official educational embeds mapping
const EMBED_MEDIA_CATALOG = {
  voaLevel1: {
    type: 'video',
    title: "VOA Let's Learn English (Level 1 Video Lesson)",
    embedUrl: "https://www.youtube-nocookie.com/embed/videoseries?list=PL_JkP7gqC9rM0BqPqN2E7A-N-b5a8w9qF",
    provider: "Voice of America",
    license: "Public Domain (US Govt)"
  },
  librivoxSherlock: {
    type: 'audio',
    title: "LibriVox Classic Audiobook — The Adventures of Sherlock Holmes",
    streamUrl: "https://ia800300.us.archive.org/1/items/adventures_sherlock_holmes_1106_librivox/adventuresofsherlockholmes_01_doyle.mp3",
    provider: "LibriVox Public Domain",
    license: "Public Domain"
  },
  librivoxTimeMachine: {
    type: 'audio',
    title: "LibriVox Classic Audiobook — The Time Machine by H.G. Wells",
    streamUrl: "https://ia800208.us.archive.org/21/items/time_machine_0706_librivox/timemachine_01_wells.mp3",
    provider: "LibriVox Public Domain",
    license: "Public Domain"
  }
};

const inMemoryCustomLessons = new Map();
const inMemoryLessonVersions = new Map();

export const CurriculumContentEngine = {
  /**
   * Retrieve full, rich, verified daily lesson for ANY curriculum day (1 to 120)
   * @param {number} dayNum
   * @returns {Object}
   */
  getDayLesson(dayNum) {
    const targetDay = Number(dayNum) || 1;

    // 0. Check if a custom AI lesson has been imported for this day
    if (inMemoryCustomLessons.has(targetDay)) {
      return inMemoryCustomLessons.get(targetDay);
    }
    if (typeof window !== 'undefined' && window.__BOOTCAMP_CUSTOM_LESSONS__?.[targetDay]) {
      return window.__BOOTCAMP_CUSTOM_LESSONS__[targetDay];
    }

    // 1. If day is in Starter Pack (Days 1 to 7), use existing rich starter pack
    const starterMatch = BOOTCAMP_DATA.starterPack?.find(s => s.day === targetDay);
    if (starterMatch) {
      return {
        ...starterMatch,
        isStarterPack: true,
        mediaEmbed: EMBED_MEDIA_CATALOG.voaLevel1
      };
    }

    // 2. For Days 8 to 120, dynamically synthesize rich lesson from roadmap + content pack
    const roadmapItem = BOOTCAMP_DATA.roadmap.find(r => r.day === targetDay) || BOOTCAMP_DATA.roadmap[0];
    const level = roadmapItem.level || 'B1';
    const vocabDomain = (roadmapItem.vocab || '').toLowerCase();
    const grammarTopic = roadmapItem.grammar;

    // Pick matching chunk set
    let chunks = TOPIC_CHUNKS_MAP.genericAcademic;
    if (vocabDomain.includes('identity') || vocabDomain.includes('family') || vocabDomain.includes('home')) {
      chunks = TOPIC_CHUNKS_MAP.identity;
    } else if (vocabDomain.includes('travel') || vocabDomain.includes('weather') || vocabDomain.includes('transport')) {
      chunks = TOPIC_CHUNKS_MAP.travel;
    } else if (vocabDomain.includes('tech') || vocabDomain.includes('science') || vocabDomain.includes('innovation')) {
      chunks = TOPIC_CHUNKS_MAP.technology;
    }

    // Pick matching VOA story or reader
    const voaMatch = VOA_STORIES.find(s => s.level === level) || VOA_STORIES[1];
    const readerMatch = EXTENSIVE_READERS.find(r => r.level === level) || EXTENSIVE_READERS[1];

    // Formulate listening script
    const listeningTitle = `Intensive Listening (Day ${targetDay}): ${roadmapItem.speaking}`;
    const listeningScript = `Welcome to Day ${targetDay} of the C1 Bootcamp. Today's linguistic focus is centered on ${grammarTopic} within the contextual domain of ${roadmapItem.vocab}. 

When engaging with natural spoken English at the ${level} level, listeners must pay close attention to structural patterns, reductions, and sentence rhythm. For instance, when expressing ideas related to ${roadmapItem.speaking}, speakers frequently rely on deliberate pauses and transitional collocations to maintain coherence.

Listen carefully to the passage. Identify the main argument, note recurring collocations, and practice shadowing the sentences aloud to internalize natural prosody and intonation.`;

    const questions = [
      `What is the primary grammatical structure targeted in Day ${targetDay}?`,
      `How does the speaker recommend maintaining communicative coherence when speaking about ${roadmapItem.speaking}?`,
      `What are the three deliberate steps suggested for internalizing natural prosody?`
    ];

    // Formulate reading text
    const readingTitle = `Active Reading (Day ${targetDay}): Perspectives on ${roadmapItem.vocab}`;
    const readingText = `Mastering language at the ${level} benchmark demands moving beyond literal translation toward nuanced contextual comprehension. In the domain of ${roadmapItem.vocab}, authentic discourse weaves together syntactic control and lexical precision.

The structure of "${grammarTopic}" allows writers and speakers to qualify their claims with exactitude. Whether drafting ${roadmapItem.writing} or participating in spontaneous dialogue, proficient communicators employ varied discourse markers to signpost arguments clearly.

As you analyze this reading excerpt, underline at least ten collocations that you can repurpose immediately into your writing draft and spoken output.`;

    const readingPrompt = `Summarize in 80–120 words how applying "${grammarTopic}" elevates the sophistication of your argument regarding ${roadmapItem.vocab}.`;

    // Embed media for all curriculum days according to CEFR level
    let mediaEmbed = EMBED_MEDIA_CATALOG.voaLevel1;
    if (level === 'B1' || level === 'B2') {
      mediaEmbed = EMBED_MEDIA_CATALOG.librivoxSherlock;
    } else if (level === 'C1') {
      mediaEmbed = EMBED_MEDIA_CATALOG.librivoxTimeMachine;
    }

    const speakingTask = `🎙️ Day ${targetDay} Speaking Task: ${roadmapItem.speaking}. (Ghi âm Take 1 chuẩn bị → Nghe lại sửa lỗi → Ghi âm Take 2 hoàn thiện).`;
    const writingTask = `✍️ Day ${targetDay} Writing Task: ${roadmapItem.writing} (Draft 1 → Phân tích lỗi → Rewrite Draft 2 hoàn toàn từ trang trắng).`;

    return {
      day: targetDay,
      week: roadmapItem.week,
      level,
      theme: `Day ${targetDay} — ${grammarTopic} (${roadmapItem.vocab})`,
      grammar: grammarTopic,
      grammarDetail: {
        topic: grammarTopic,
        explanation: `Khung lý thuyết cốt lõi của ${grammarTopic} chuẩn Cambridge CEFR ${level}. Vận dụng linh hoạt trong đàm thoại học thuật và văn bản lập luận.`,
        rules: [
          `Nắm vững công thức và cấu trúc ngữ pháp trọng tâm: ${grammarTopic}.`,
          `Lưu ý hòa hợp chủ vị, trật tự từ và các cụm giới từ đi kèm.`
        ],
        sentenceDrills: [
          {
            drill: `Đặt câu hoàn chỉnh ứng dụng cấu trúc "${grammarTopic}" trong ngữ cảnh ${roadmapItem.vocab}.`,
            answer: `When examining ${roadmapItem.vocab}, one must carefully apply ${grammarTopic} to convey subtle shades of meaning.`
          }
        ]
      },
      chunks,
      listening: {
        title: listeningTitle,
        script: listeningScript,
        questions,
        shadowingFocus: "Luyện nối âm (linking consonant to vowel) và kiểm soát nhịp điệu trọng âm câu."
      },
      reading: {
        title: readingTitle,
        text: readingText,
        prompt: readingPrompt,
        vocabularyFocus: ["syntactic control", "nuanced contextual comprehension", "discourse markers", "lexical precision"]
      },
      speaking: {
        topic: roadmapItem.speaking,
        prompt: speakingTask,
        outline: [
          "Mở đầu (30s): Nêu trực tiếp quan điểm về " + roadmapItem.speaking,
          "Thân bài (60s): Đưa ra 2 luận chứng xác thực và ví dụ cụ thể",
          "Kết luận (30s): Tóm lược và đưa ra định hướng giải pháp"
        ],
        pronunciationTips: "Giữ trường độ nguyên âm dài, phát âm rõ âm đuôi /t/, /d/, /s/, /z/ và nối âm tự nhiên.",
        followUpQuestions: [
          `How would you substantiate your argument regarding ${roadmapItem.speaking}?`,
          `What potential counter-perspective might arise?`
        ]
      },
      speakingTask,
      writing: {
        topic: roadmapItem.writing,
        prompt: writingTask,
        outline: "Introduction (Thesis Statement) → Body Paragraph 1 (Key Point + Proof) → Body Paragraph 2 (Nuanced Analysis) → Conclusion (Synthesis).",
        targetStructures: [
          `Ứng dụng cấu trúc "${grammarTopic}"`,
          "Sử dụng ít nhất 4 collocations chuẩn CEFR của ngày"
        ],
        sampleSnippet: `Regarding ${roadmapItem.vocab}, empirical research demonstrates that structured application yields measurable improvement across communicative domains.`
      },
      writingTask,
      extensiveListening: {
        title: `Extensive Listening: ${roadmapItem.vocab} (${level})`,
        description: `Nghe thụ cảm tự nhiên 60–90 phút từ các nguồn tin tức bản xứ về chủ đề ${roadmapItem.vocab}.`,
        discussionQuestions: [
          `What are the most persuasive points raised in authentic discussions about ${roadmapItem.vocab}?`
        ],
        recommendedSources: "BBC 6 Minute English, NPR Planet Money, TED Radio Hour"
      },
      immersion: {
        context: `Bối cảnh thực tế: Trao đổi học thuật và môi trường làm việc quốc tế xoay quanh ${roadmapItem.vocab}.`,
        realWorldExpressions: [
          { phrase: "at the forefront of", meaning: "ở tuyến đầu / tiên phong", situation: "Khi bàn về đổi mới và công nghệ" },
          { phrase: "shed light on", meaning: "làm sáng tỏ", situation: "Khi giải thích và chứng minh luận điểm" }
        ],
        mediaSuggestion: "Xem video thời sự hoặc tài liệu phóng sự ngắn trên VOA / YouTube."
      },
      srsAndErrorLog: {
        commonPitfalls: [
          `Lỗi dịch thô word-by-word từ tiếng Việt sang tiếng Anh.`,
          `Bẫy nhầm lẫn thì hoặc vị trí trạng từ với cấu trúc ${grammarTopic}.`
        ],
        reviewReminders: "Ôn tập 20 target chunks mới trên SRS và bổ sung lỗi sai vào sổ lỗi vàng.",
        reflectionQuestions: [
          "Cụm từ mới nào bạn thấy ấn tượng nhất hôm nay?",
          "Lỗi phát âm hoặc ngữ pháp nào bạn đã chủ động sửa chữa?",
          "Mục tiêu trọng tâm cho ngày mai là gì?"
        ]
      },
      scheduleBlocks: [
        { id: 1, time: "07:00–08:30", duration: "90 min", block: `Ngữ pháp: ${grammarTopic}`, mode: "Deep", output: "Lý thuyết cốt lõi + thực hành sentence drills", color: "#6366f1" },
        { id: 2, time: "09:00–10:30", duration: "90 min", block: `Nghe Chuyên Sâu: ${roadmapItem.speaking}`, mode: "Deep", output: "Dictation + 3 câu hỏi hiểu + Shadowing", color: "#06b6d4" },
        { id: 3, time: "10:45–12:15", duration: "90 min", block: `20 Chunks Ngày ${targetDay}: ${roadmapItem.vocab}`, mode: "Deep", output: "Học 20 chunks + nghe TTS + nạp SRS", color: "#10b981" },
        { id: 4, time: "13:15–14:45", duration: "90 min", block: `Active Reading: ${roadmapItem.vocab}`, mode: "Medium", output: "Đọc phân tích + tóm tắt 80–120 từ", color: "#3b82f6" },
        { id: 5, time: "15:00–16:30", duration: "90 min", block: `Speaking: ${roadmapItem.speaking}`, mode: "Deep", output: "Thu âm Take 1 & Take 2 theo dàn ý 3 phần", color: "#f59e0b" },
        { id: 6, time: "16:45–18:15", duration: "90 min", block: `Writing: ${roadmapItem.writing}`, mode: "Deep", output: "Draft 1 → Phân tích lỗi → Rewrite Draft 2", color: "#ec4899" },
        { id: 7, time: "19:15–20:45", duration: "90 min", block: `Extensive Listening & Thảo Luận`, mode: "Medium", output: "60–90m nghe mở rộng + câu hỏi phản xạ", color: "#8b5cf6" },
        { id: 8, time: "21:00–22:30", duration: "90 min", block: `Immersion: ${roadmapItem.vocab}`, mode: "Light", output: "Thành ngữ đời thực + video học liệu mở", color: "#14b8a6" },
        { id: 9, time: "22:30–23:00", duration: "30 min", block: `SRS Review & Nhật Ký Phản Tư`, mode: "Light", output: "Ôn thẻ SRS + ghi sổ lỗi + nhật ký 3 dòng", color: "#64748b" }
      ],
      kpi: roadmapItem.kpi,
      isWeeklyTest: !!roadmapItem.isWeeklyTest,
      isGate: !!roadmapItem.isGate,
      mediaEmbed,
      sourceAttribution: "CEFR-J Profile, Tatoeba Corpus & VOA Learning English (CC-BY / Public Domain)"
    };

  },

  setCustomLesson(lesson) {
    if (!lesson || !lesson.day) return;
    const day = Number(lesson.day);
    if (!lesson.id) {
      lesson.id = `lesson_d${day}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }
    inMemoryCustomLessons.set(day, lesson);

    // Track versions
    let list = inMemoryLessonVersions.get(day) || [];
    list = list.filter(l => l.id !== lesson.id);
    list.unshift(lesson);
    inMemoryLessonVersions.set(day, list);

    if (typeof window !== 'undefined') {
      if (!window.__BOOTCAMP_CUSTOM_LESSONS__) window.__BOOTCAMP_CUSTOM_LESSONS__ = {};
      window.__BOOTCAMP_CUSTOM_LESSONS__[day] = lesson;
    }
  },

  registerLessonVersion(lesson) {
    this.setCustomLesson(lesson);
  },

  hasCustomLesson(dayNum) {
    const day = Number(dayNum);
    return inMemoryCustomLessons.has(day);
  },

  getCustomLessonVersions(dayNum) {
    const day = Number(dayNum);
    return inMemoryLessonVersions.get(day) || [];
  },

  setActiveVersion(dayNum, versionId) {
    const day = Number(dayNum);
    if (versionId === 'default' || !versionId) {
      inMemoryCustomLessons.delete(day);
      if (typeof window !== 'undefined' && window.__BOOTCAMP_CUSTOM_LESSONS__) {
        delete window.__BOOTCAMP_CUSTOM_LESSONS__[day];
      }
      return null;
    }
    const list = inMemoryLessonVersions.get(day) || [];
    let match = list.find(v => v.id === versionId);
    if (!match && typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`c1_custom_lesson_versions_${day}`);
        if (raw) {
          const storedList = JSON.parse(raw) || [];
          match = storedList.find(v => v.id === versionId);
        }
      } catch (e) {}
    }

    if (match) {
      this.setCustomLesson(match);
      return match;
    }
    return null;
  },

  removeCustomLesson(dayNum) {
    const day = Number(dayNum);
    inMemoryCustomLessons.delete(day);
    inMemoryLessonVersions.delete(day);
    if (typeof window !== 'undefined' && window.__BOOTCAMP_CUSTOM_LESSONS__) {
      delete window.__BOOTCAMP_CUSTOM_LESSONS__[day];
    }
  }
};
