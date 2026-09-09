// English C1 Bootcamp 120 Days — Complete Database
const BOOTCAMP_DATA = {
  meta: {
    title: "English C1 Bootcamp — 120 Days",
    subTitle: "12 Hours per Day • Zero to C1 Performance Master Plan",
    totalDays: 120,
    dailyHours: 12,
    targetLevel: "C1",
    principles: [
      "Input builds the model. Output exposes the gaps. Feedback repairs the model. Spaced review makes the repair stick.",
      "Sleep 7.5–9 hours. Do not trade sleep for extra study.",
      "12 hours means English exposure (7–8h hard study; rest is lighter input, speaking, review & immersion).",
      "Speak from Day 1. Learn new vocabulary as chunks/collocations + sentence, never isolated words.",
      "Every error that repeats 3 times becomes an Anki/SRS item or an error-log item.",
      "From B1 onward, use English definitions first; Vietnamese only when the concept is unclear."
    ]
  },

  gates: [
    { gate: "A1 Survival", day: 14, level: "A1", criteria: "3-minute self-introduction; basic questions; 70% on A1 materials." },
    { gate: "A2 Independence", day: 28, level: "A2", criteria: "5–7 minute familiar-topic talk; 120–150 word text; ~75% A2 practice." },
    { gate: "B1 Intermediate", day: 56, level: "B1", criteria: "10-minute connected talk; 180–220 word essay/email; ~70% B1 materials." },
    { gate: "B2 Upper-Intermediate", day: 84, level: "B2", criteria: "15-minute argument/discussion; 250-word essay; ~65–70% B2 materials. (Crucial Gate: if failed, extend B2 by 4-8 weeks!)." },
    { gate: "C1 Benchmark Attempt", day: 120, level: "C1", criteria: "Cambridge-style four-skill mock; no skill catastrophically below B2. Full comparison with Day 0 baseline." }
  ],

  dailySchedule: [
    { id: 1, time: "07:00–08:30", duration: "90 min", block: "Grammar + sentence production", mode: "Deep", output: "30–50 spoken/written sentences", color: "#6366f1" },
    { id: 2, time: "09:00–10:30", duration: "90 min", block: "Intensive listening", mode: "Deep", output: "Dictation + transcript analysis + shadowing", color: "#06b6d4" },
    { id: 3, time: "10:45–12:15", duration: "90 min", block: "Vocabulary / collocations / SRS", mode: "Deep", output: "20 active chunks + reviews", color: "#10b981" },
    { id: 4, time: "13:15–14:45", duration: "90 min", block: "Reading", mode: "Medium", output: "Summary + 10 useful expressions", color: "#3b82f6" },
    { id: 5, time: "15:00–16:30", duration: "90 min", block: "Speaking + pronunciation", mode: "Deep", output: "Recorded speaking task (Take 1 & Take 2)", color: "#f59e0b" },
    { id: 6, time: "16:45–18:15", duration: "90 min", block: "Writing", mode: "Deep", output: "Draft 1 → correction → rewrite (Draft 2)", color: "#ec4899" },
    { id: 7, time: "19:15–20:45", duration: "90 min", block: "Extensive listening / conversation", mode: "Medium", output: "60–90 min English-only input/output", color: "#8b5cf6" },
    { id: 8, time: "21:00–22:30", duration: "90 min", block: "Immersion", mode: "Light", output: "English-only entertainment/tech/news", color: "#14b8a6" },
    { id: 9, time: "22:30–23:00", duration: "30 min", block: "SRS + error log", mode: "Light", output: "Review due cards + 3-line journal", color: "#64748b" }
  ],

  protocols: {
    listening: [
      { step: 1, text: "Listen once without subtitles or transcript." },
      { step: 2, text: "Write the main idea in English." },
      { step: 3, text: "Listen again and transcribe 30–90 seconds (Dictation)." },
      { step: 4, text: "Compare with transcript/subtitles." },
      { step: 5, text: "Mark unknown words, known-but-not-heard words, reductions/linking and stress." },
      { step: 6, text: "Shadow the same section 5 times." },
      { step: 7, text: "Retell it without looking." }
    ],
    reading: [
      { step: 1, duration: "20 min", text: "First read, no dictionary unless completely blocked." },
      { step: 2, duration: "25 min", text: "Second read, analyse structure and key vocabulary." },
      { step: 3, duration: "15 min", text: "Capture 10 useful chunks/collocations." },
      { step: 4, duration: "15 min", text: "Write a 100–150 word summary (shorter at A1/A2)." },
      { step: 5, duration: "15 min", text: "Explain the text aloud without notes." }
    ],
    speaking: [
      { step: 1, duration: "15 min", text: "Pronunciation / minimal pairs / rhythm." },
      { step: 2, duration: "20 min", text: "Shadowing target natural speech." },
      { step: 3, duration: "10 min", text: "Prepare ideas (keywords only, NO full script!)." },
      { step: 4, duration: "10 min", text: "First recording (Take 1)." },
      { step: 5, duration: "15 min", text: "Inspect errors, fillers, and awkward phrasing." },
      { step: 6, duration: "10 min", text: "Second recording (Take 2) incorporating fixes." },
      { step: 7, duration: "10 min", text: "Free Q&A with tutor or AI." }
    ],
    writing: [
      { step: 1, duration: "10 min", text: "Brainstorm & Outline plan." },
      { step: 2, duration: "25 min", text: "First draft (Draft 1) without interruptions." },
      { step: 3, duration: "15 min", text: "Self-edit for grammar, spelling and punctuation." },
      { step: 4, duration: "15 min", text: "Correction by tutor / ChatGPT Writing Examiner." },
      { step: 5, duration: "20 min", text: "REWRITE RULE: Rewrite from scratch from a blank page (Draft 2)!" },
      { step: 6, duration: "5 min", text: "Add recurring errors to the Error Log." }
    ],
    fatigueRule: {
      title: "Fatigue Rule (Quy tắc chống kiệt sức)",
      text: "If concentration collapses, DO NOT remove English exposure. Convert a deep block into graded listening, shadowing, an audiobook, documentary, easy reading or conversation. The objective is consistency without destroying the next day."
    }
  },

  dailyKPIs: [
    { id: "kpi_chunks", text: "20 active chunks learned in context & reviewed" },
    { id: "kpi_speaking", text: "≥30 minutes actual speaking aloud" },
    { id: "kpi_recording", text: "1 recorded speaking output saved (Take 1 & 2)" },
    { id: "kpi_writing", text: "1 written output completed (Draft 1 → Rewrite)" },
    { id: "kpi_listening", text: "1 intensive listening item completed (Dictation + Shadowing)" },
    { id: "kpi_srs", text: "SRS review completed + Error Log updated" }
  ],

  // 120-Day Roadmap Day-by-Day Master Dataset
  roadmap: [
    // Days 1-7 (Week 1)
    { day: 1, week: 1, level: "A1", grammar: "be: affirmative", vocab: "identity", speaking: "self-introduction and goals", writing: "Write a short personal profile (60-80w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 2, week: 1, level: "A1", grammar: "be: negative", vocab: "numbers", speaking: "daily routine", writing: "Describe your normal day (80w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 3, week: 1, level: "A1", grammar: "be: questions", vocab: "time", speaking: "family and people you know", writing: "Describe a person you know well (80w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 4, week: 1, level: "A1", grammar: "subject/object pronouns", vocab: "routine", speaking: "your home and neighbourhood", writing: "Describe your home (80-100w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 5, week: 1, level: "A1", grammar: "possessive adjectives & possessive 's", vocab: "identity", speaking: "work or study", writing: "Write about your job/studies (100w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 6, week: 1, level: "A1", grammar: "present simple affirmative/negative", vocab: "numbers", speaking: "food and shopping", writing: "Write a simple shopping message/list with reasons.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 7, week: 1, level: "A1", grammar: "present simple questions + review", vocab: "time", speaking: "weekly review: what changed", writing: "Weekly journal: 80 words.", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 8-14 (Week 2)
    { day: 8, week: 2, level: "A1", grammar: "present continuous", vocab: "home", speaking: "a normal weekday", writing: "Write about a weekday.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 9, week: 2, level: "A1", grammar: "present simple vs continuous", vocab: "family", speaking: "what people are doing now", writing: "Describe what people are doing in a scene.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 10, week: 2, level: "A1", grammar: "there is/there are", vocab: "food", speaking: "your room/home", writing: "Describe a room.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 11, week: 2, level: "A1", grammar: "can/can’t", vocab: "shopping", speaking: "asking for and giving directions", writing: "Write simple directions from A to B.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 12, week: 2, level: "A1", grammar: "imperatives + object pronouns", vocab: "town", speaking: "abilities and limitations", writing: "Write about three things you can/cannot do.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 13, week: 2, level: "A1", grammar: "countable/uncountable + some/any", vocab: "home", speaking: "buying food and comparing prices", writing: "Write a short restaurant/shop message.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 14, week: 2, level: "A1", grammar: "A1 review", vocab: "family", speaking: "weekly review (3-min self-intro)", writing: "Weekly journal: 100 words.", kpi: "Phase gate + weekly test: recording, timed writing, fresh listening/reading, error-log reset", isGate: true, isWeeklyTest: true },

    // Days 15-21 (Week 3)
    { day: 15, week: 3, level: "A2", grammar: "past simple regular", vocab: "travel", speaking: "a memorable day", writing: "Write a short past story (100w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 16, week: 3, level: "A2", grammar: "past simple irregular", vocab: "weather", speaking: "a trip you took", writing: "Write an email about a trip (100w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 17, week: 3, level: "A2", grammar: "past simple questions/negatives", vocab: "transport", speaking: "plans for next month", writing: "Write your plan for next month.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 18, week: 3, level: "A2", grammar: "going to", vocab: "leisure", speaking: "compare two places", writing: "Compare two places (120w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 19, week: 3, level: "A2", grammar: "will for decisions/predictions", vocab: "health basics", speaking: "transport in your city", writing: "Explain how you travel somewhere.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 20, week: 3, level: "A2", grammar: "comparatives/superlatives", vocab: "travel", speaking: "a healthy routine", writing: "Give simple health advice (120w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 21, week: 3, level: "A2", grammar: "A1→A2 review", vocab: "weather", speaking: "weekly review", writing: "Weekly story: 120 words.", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 22-28 (Week 4)
    { day: 22, week: 4, level: "A2", grammar: "present perfect: ever/never", vocab: "work", speaking: "experience learning a skill", writing: "Write about a skill you have learned (150w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 23, week: 4, level: "A2", grammar: "present perfect: just/already/yet", vocab: "study", speaking: "rules at work/school", writing: "Write rules/instructions for a workplace or class.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 24, week: 4, level: "A2", grammar: "past simple vs present perfect intro", vocab: "technology", speaking: "giving advice to a beginner", writing: "Give advice to a new learner (120w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 25, week: 4, level: "A2", grammar: "articles a/an/the/zero", vocab: "appointments", speaking: "technology you use every day", writing: "Explain a useful technology (120w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 26, week: 4, level: "A2", grammar: "much/many/a lot/few/little", vocab: "work", speaking: "an appointment or problem", writing: "Write an appointment/problem email.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 27, week: 4, level: "A2", grammar: "should/must/have to", vocab: "study", speaking: "a personal achievement", writing: "Describe an achievement (150w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 28, week: 4, level: "A2", grammar: "gerund/infinitive basics + A2 review", vocab: "technology", speaking: "weekly review (5-7 min talk)", writing: "A2 checkpoint: 150 words.", kpi: "Phase gate + weekly test: recording, timed writing, fresh listening/reading, error-log reset", isGate: true, isWeeklyTest: true },

    // Days 29-35 (Week 5)
    { day: 29, week: 5, level: "B1", grammar: "past continuous", vocab: "problems", speaking: "a problem that happened while doing something", writing: "Write a narrative using past simple + past continuous.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 30, week: 5, level: "B1", grammar: "past continuous vs past simple", vocab: "services", speaking: "a service problem and solution", writing: "Write a complaint and requested solution (150w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 31, week: 5, level: "B1", grammar: "first conditional", vocab: "money", speaking: "if I have a free month...", writing: "First-conditional advice text.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 32, week: 5, level: "B1", grammar: "defining relative clauses", vocab: "learning", speaking: "a person/place that influenced you", writing: "Write about a person/place using relative clauses.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 33, week: 5, level: "B1", grammar: "adverbs of manner/degree", vocab: "problems", speaking: "how you manage money/time", writing: "Explain a time-management problem.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 34, week: 5, level: "B1", grammar: "because/so/although/however", vocab: "services", speaking: "how you learn effectively", writing: "Write how you study effectively (150-180w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 35, week: 5, level: "B1", grammar: "A2→B1 review", vocab: "money", speaking: "weekly review", writing: "Weekly connected text (180w).", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 36-42 (Week 6)
    { day: 36, week: 6, level: "B1", grammar: "passive present/past", vocab: "news", speaking: "retell a short news story", writing: "Summarise a short news item.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 37, week: 6, level: "B1", grammar: "reported statements", vocab: "workplace", speaking: "how something is made/done", writing: "Explain a process in the passive.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 38, week: 6, level: "B1", grammar: "reported questions/commands", vocab: "education", speaking: "if I could change one thing...", writing: "Second-conditional opinion.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 39, week: 6, level: "B1", grammar: "second conditional", vocab: "culture", speaking: "childhood vs now", writing: "Compare childhood and adulthood.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 40, week: 6, level: "B1", grammar: "used to/would for past habits", vocab: "news", speaking: "education and practical skills", writing: "Opinion: practical vs academic education (180w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 41, week: 6, level: "B1", grammar: "verb patterns: -ing/to", vocab: "workplace", speaking: "culture shock", writing: "Write about cultural differences carefully.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 42, week: 6, level: "B1", grammar: "B1 review", vocab: "education", speaking: "weekly review", writing: "B1 checkpoint essay (180-200w).", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 43-49 (Week 7)
    { day: 43, week: 7, level: "B1", grammar: "present perfect continuous", vocab: "relationships", speaking: "how long you have been learning something", writing: "Write about a long-running activity.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 44, week: 7, level: "B1", grammar: "modal deduction present", vocab: "productivity", speaking: "guess why something happened", writing: "Explain possible causes using modal deduction.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 45, week: 7, level: "B1", grammar: "common phrasal verbs", vocab: "environment", speaking: "productivity habits", writing: "Opinion: productivity methods.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 46, week: 7, level: "B1", grammar: "linkers of reason/result/contrast", vocab: "relationships", speaking: "an environmental problem", writing: "Problem-solution: local environment.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 47, week: 7, level: "B1", grammar: "question tags + indirect questions", vocab: "productivity", speaking: "friendship and teamwork", writing: "Write about teamwork.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 48, week: 7, level: "B1", grammar: "tense control drill", vocab: "environment", speaking: "technology distractions", writing: "Opinion: digital distraction.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 49, week: 7, level: "B1", grammar: "B1 review", vocab: "relationships", speaking: "weekly review (10-min discussion)", writing: "Weekly opinion essay (180-220w).", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 50-56 (Week 8)
    { day: 50, week: 8, level: "B1", grammar: "noun clauses", vocab: "society", speaking: "media you trust", writing: "Review a media source.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 51, week: 8, level: "B1", grammar: "non-defining relative clauses", vocab: "travel", speaking: "travel changes people", writing: "Write a travel reflection.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 52, week: 8, level: "B1", grammar: "contrast/concession", vocab: "media", speaking: "one habit worth building", writing: "Explain how to build a habit.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 53, week: 8, level: "B1", grammar: "purpose/result clauses", vocab: "personal development", speaking: "advantages and disadvantages of remote work", writing: "Advantages/disadvantages essay: remote work.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 54, week: 8, level: "B1", grammar: "tense sequence", vocab: "society", speaking: "a social problem", writing: "Problem-solution essay.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 55, week: 8, level: "B1", grammar: "sentence combining", vocab: "travel", speaking: "a book/video that changed your view", writing: "Review a book/video/article (200-220w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 56, week: 8, level: "B1", grammar: "B1 mock review", vocab: "media", speaking: "B1 mock discussion (10 min)", writing: "B1 mock writing (200-220w).", kpi: "Phase gate + weekly test: recording, timed writing, fresh listening/reading, error-log reset", isGate: true, isWeeklyTest: true },

    // Days 57-63 (Week 9)
    { day: 57, week: 9, level: "B2", grammar: "zero/first/second conditional review", vocab: "AI", speaking: "AI and employment", writing: "Argument: AI and jobs (220-250w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 58, week: 9, level: "B2", grammar: "third conditional intro", vocab: "work", speaking: "public transport vs private vehicles", writing: "Report: transport options.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 59, week: 9, level: "B2", grammar: "passive variants", vocab: "cities", speaking: "city life trade-offs", writing: "Essay: city vs smaller town.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 60, week: 9, level: "B2", grammar: "have/get something done", vocab: "science", speaking: "science in daily life", writing: "Explain a scientific idea for non-experts.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 61, week: 9, level: "B2", grammar: "future continuous/perfect", vocab: "AI", speaking: "automation at work", writing: "Report: automation benefits/risks.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 62, week: 9, level: "B2", grammar: "advanced comparison", vocab: "work", speaking: "privacy vs convenience", writing: "Essay: privacy vs convenience.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 63, week: 9, level: "B2", grammar: "B2 bridge review", vocab: "cities", speaking: "weekly review", writing: "Weekly 230-word essay.", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 64-70 (Week 10)
    { day: 64, week: 10, level: "B2", grammar: "modal perfects", vocab: "risk", speaking: "why a project failed", writing: "Analyse why a project failed (230-260w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 65, week: 10, level: "B2", grammar: "participle clauses intro", vocab: "innovation", speaking: "what might have prevented a problem", writing: "Counterfactual: what could have prevented it?", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 66, week: 10, level: "B2", grammar: "negative inversion intro", vocab: "health policy", speaking: "innovation vs risk", writing: "Essay: innovation and risk.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 67, week: 10, level: "B2", grammar: "emphasis with do/does/did", vocab: "economics basics", speaking: "economic choices people make", writing: "Discuss a personal/economic trade-off.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 68, week: 10, level: "B2", grammar: "determiners/quantifiers advanced", vocab: "risk", speaking: "public health decisions", writing: "Policy note: public health choice.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 69, week: 10, level: "B2", grammar: "speculation language", vocab: "innovation", speaking: "future uncertainty", writing: "Essay on uncertainty.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 70, week: 10, level: "B2", grammar: "B2 review", vocab: "health policy", speaking: "weekly review", writing: "Weekly timed writing (250w).", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 71-77 (Week 11)
    { day: 71, week: 11, level: "B2", grammar: "cleft sentences", vocab: "education", speaking: "what makes a good teacher", writing: "Essay: qualities of a good teacher.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 72, week: 11, level: "B2", grammar: "advanced relative clauses", vocab: "leadership", speaking: "leadership styles", writing: "Report: leadership styles (250w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 73, week: 11, level: "B2", grammar: "hedging modals/adverbs", vocab: "ethics", speaking: "an ethical dilemma", writing: "Discuss an ethical dilemma.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 74, week: 11, level: "B2", grammar: "nominalisation intro", vocab: "culture", speaking: "should university be job-focused?", writing: "Essay: purpose of university.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 75, week: 11, level: "B2", grammar: "substitution: one/ones/so/do so", vocab: "education", speaking: "art and culture funding", writing: "Proposal: cultural funding.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 76, week: 11, level: "B2", grammar: "cohesion/reference", vocab: "leadership", speaking: "how to evaluate online information", writing: "Report: evaluating online information.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 77, week: 11, level: "B2", grammar: "B2 review", vocab: "ethics", speaking: "weekly review", writing: "Weekly B2 writing (250w).", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 78-84 (Week 12 - B2 Exam Mechanics)
    { day: 78, week: 12, level: "B2", grammar: "word formation: prefixes/suffixes", vocab: "academic collocations", speaking: "paraphrase five difficult statements", writing: "Word-formation and paraphrase drill + short essay.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 79, week: 12, level: "B2", grammar: "collocation patterns", vocab: "work collocations", speaking: "explain one topic three different ways", writing: "Rewrite 10 sentences more naturally.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 80, week: 12, level: "B2", grammar: "phrasal verbs in context", vocab: "professional English", speaking: "collocations in professional English", writing: "Use 15 target collocations in a coherent text.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 81, week: 12, level: "B2", grammar: "key-word transformations", vocab: "academic collocations", speaking: "summarise and respond to an article", writing: "Write a 150-word summary + 100-word response.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 82, week: 12, level: "B2", grammar: "paraphrasing without meaning change", vocab: "academic collocations", speaking: "compare two authors’ views", writing: "Compare two short viewpoints.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 83, week: 12, level: "B2", grammar: "open cloze grammar", vocab: "academic collocations", speaking: "Cambridge-style long turn", writing: "Cambridge-style essay (250w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 84, week: 12, level: "B2", grammar: "B2 exam review", vocab: "academic collocations", speaking: "B2 mock (15-min argument/discussion)", writing: "B2 full writing mock (250w).", kpi: "CRITICAL GATE: recording, timed writing, fresh listening/reading, error-log reset. If not passed, extend B2 4-8w!", isGate: true, isWeeklyTest: true },

    // Days 85-91 (Week 13 - B2 to C1 Bridge)
    { day: 85, week: 13, level: "C1", grammar: "formal vs informal register", vocab: "technology policy", speaking: "tech regulation", writing: "Essay: regulating AI (250-300w).", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 86, week: 13, level: "C1", grammar: "stance verbs/adverbs", vocab: "climate", speaking: "climate responsibility", writing: "Report: climate responsibility.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 87, week: 13, level: "C1", grammar: "advanced discourse markers", vocab: "business", speaking: "business and automation", writing: "Proposal: responsible automation.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 88, week: 13, level: "C1", grammar: "complex noun phrases", vocab: "research", speaking: "how research should influence policy", writing: "Essay: research and policy.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 89, week: 13, level: "C1", grammar: "reporting verbs", vocab: "technology policy", speaking: "misinformation", writing: "Article: misinformation.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 90, week: 13, level: "C1", grammar: "summary language", vocab: "climate", speaking: "education in the AI era", writing: "Essay: education in the AI era.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 91, week: 13, level: "C1", grammar: "B2→C1 review", vocab: "business", speaking: "weekly review (15-min argument)", writing: "Weekly C1-style writing (280w).", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 92-98 (Week 14 - C1 Structures)
    { day: 92, week: 14, level: "C1", grammar: "inversion after negative adverbials", vocab: "uncertainty", speaking: "complex cause-and-effect problem", writing: "Analyse a multi-cause problem.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 93, week: 14, level: "C1", grammar: "mixed conditionals", vocab: "causality", speaking: "a decision under uncertainty", writing: "Memo: decision under uncertainty.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 94, week: 14, level: "C1", grammar: "ellipsis/substitution advanced", vocab: "systems thinking", speaking: "counterfactual: what would have happened if...", writing: "Mixed-conditional counterfactual essay.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 95, week: 14, level: "C1", grammar: "advanced modality", vocab: "uncertainty", speaking: "systems vs individual responsibility", writing: "Essay: systems vs individual responsibility.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 96, week: 14, level: "C1", grammar: "participle clauses advanced", vocab: "causality", speaking: "limits of prediction", writing: "Report: limits of prediction.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 97, week: 14, level: "C1", grammar: "complex cause/effect structures", vocab: "systems thinking", speaking: "when experts disagree", writing: "Essay: when experts disagree.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 98, week: 14, level: "C1", grammar: "C1 structure review", vocab: "uncertainty", speaking: "weekly review", writing: "Weekly timed C1 task.", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 99-105 (Week 15 - C1 Lexical Control)
    { day: 99, week: 15, level: "C1", grammar: "lexical precision: near-synonyms", vocab: "society", speaking: "nuanced agreement/disagreement", writing: "Nuanced opinion essay.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 100, week: 15, level: "C1", grammar: "connotation/register", vocab: "psychology", speaking: "psychology of habits", writing: "Article: psychology of habits.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 101, week: 15, level: "C1", grammar: "idiomatic chunks", vocab: "science", speaking: "scientific uncertainty", writing: "Report: communicating scientific uncertainty.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 102, week: 15, level: "C1", grammar: "advanced collocation", vocab: "work", speaking: "workplace incentives", writing: "Proposal: workplace incentives.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 103, week: 15, level: "C1", grammar: "nominalisation advanced", vocab: "society", speaking: "social inequality", writing: "Essay: inequality and opportunity.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 104, week: 15, level: "C1", grammar: "hedging/boosting balance", vocab: "psychology", speaking: "technology optimism vs pessimism", writing: "Review: technology optimism/pessimism.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 105, week: 15, level: "C1", grammar: "C1 lexical review", vocab: "science", speaking: "weekly review", writing: "Weekly C1 task.", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Days 106-112 (Week 16 - C1 Exam Production)
    { day: 106, week: 16, level: "C1", grammar: "error-driven tense repair", vocab: "Cambridge C1 themes", speaking: "C1 Speaking Part 1", writing: "C1 essay 220–260 words.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 107, week: 16, level: "C1", grammar: "error-driven article/preposition repair", vocab: "Cambridge C1 themes", speaking: "C1 Speaking Part 2", writing: "C1 report/proposal.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 108, week: 16, level: "C1", grammar: "transformations", vocab: "Cambridge C1 themes", speaking: "C1 Speaking Part 3", writing: "C1 review/email.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 109, week: 16, level: "C1", grammar: "cohesion/coherence devices", vocab: "Cambridge C1 themes", speaking: "C1 Speaking Part 4", writing: "C1 essay timed.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 110, week: 16, level: "C1", grammar: "writing grammar under time", vocab: "Cambridge C1 themes", speaking: "full speaking mock", writing: "Two-task writing mock.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 111, week: 16, level: "C1", grammar: "speaking grammar under pressure", vocab: "Cambridge C1 themes", speaking: "repair weakest speaking dimension", writing: "Rewrite weakest mock.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 112, week: 16, level: "C1", grammar: "C1 exam review", vocab: "Cambridge C1 themes", speaking: "weekly mock", writing: "Weekly full mock.", kpi: "Weekly mock: recording, timed writing, fresh listening/reading, error-log reset", isWeeklyTest: true },

    // Days 113-119 (Week 17 - C1 Mock & Repair)
    { day: 113, week: 17, level: "C1", grammar: "personal error list 1", vocab: "weakest lexical domains", speaking: "full mock discussion 1", writing: "Full timed writing 1.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 114, week: 17, level: "C1", grammar: "personal error list 2", vocab: "weakest lexical domains", speaking: "full mock discussion 2", writing: "Full timed writing 2.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 115, week: 17, level: "C1", grammar: "weak grammar 1", vocab: "weakest lexical domains", speaking: "weakness repair: fluency", writing: "Repair coherence.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 116, week: 17, level: "C1", grammar: "weak grammar 2", vocab: "weakest lexical domains", speaking: "weakness repair: grammar", writing: "Repair grammar.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 117, week: 17, level: "C1", grammar: "weak grammar 3", vocab: "weakest lexical domains", speaking: "weakness repair: vocabulary", writing: "Repair lexical precision.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 118, week: 17, level: "C1", grammar: "full Use of English mock", vocab: "weakest lexical domains", speaking: "weakness repair: pronunciation", writing: "Final timed writing.", kpi: "20 active chunks; 1 recording; 1 rewrite; SRS ≥90% due cards" },
    { day: 119, week: 17, level: "C1", grammar: "final repair", vocab: "weakest lexical domains", speaking: "final rehearsal", writing: "Final reflection.", kpi: "Weekly test + error-log reset; ≥70% target-level practice", isWeeklyTest: true },

    // Day 120 (Final C1 Benchmark)
    { day: 120, week: 17, level: "C1", grammar: "No new grammar — performance only", vocab: "No new vocabulary", speaking: "Full Cambridge-style speaking simulation (Parts 1-4)", writing: "Full timed C1 writing (Two tasks under official timing)", kpi: "FINAL FOUR-SKILL BENCHMARK: Reading & Use of English, Listening, Writing, Speaking. Compare Day 0 vs Day 120!", isGate: true }
  ],

  // Week 1 Starter Pack (Interactive Lessons)
  starterPack: [
    {
      day: 1,
      theme: "Identity & Introductions",
      grammar: "be: affirmative + subject pronouns",
      chunks: [
        { en: "my name is", vi: "tên tôi là", ex: "My name is Daniel and I live in Hanoi." },
        { en: "I am from", vi: "tôi đến từ", ex: "I am from Vietnam." },
        { en: "I live in", vi: "tôi sống ở", ex: "I live in a small apartment near the city centre." },
        { en: "I work as", vi: "tôi làm nghề", ex: "I work as a web designer for a local company." },
        { en: "I work for", vi: "tôi làm việc cho (công ty)", ex: "I work for a software development firm." },
        { en: "I am interested in", vi: "tôi quan tâm đến", ex: "I am interested in machine learning and design." },
        { en: "I would like to", vi: "tôi muốn", ex: "I would like to work with international clients." },
        { en: "my main goal is", vi: "mục tiêu chính của tôi là", ex: "My main goal is to achieve genuine C1 fluency." },
        { en: "in my free time", vi: "vào thời gian rảnh", ex: "In my free time, I enjoy taking photos and cooking." },
        { en: "at the moment", vi: "vào lúc này, hiện tại", ex: "At the moment, I am studying English intensively." },
        { en: "every day", vi: "mỗi ngày", ex: "I practise speaking aloud every day." },
        { en: "usually", vi: "thường thường", ex: "I usually study before work and again in the evening." },
        { en: "sometimes", vi: "thỉnh thoảng", ex: "Sometimes I take a short walk after dinner." },
        { en: "not yet", vi: "vẫn chưa", ex: "I am not completely fluent yet." },
        { en: "a little bit", vi: "một chút", ex: "I feel a little bit nervous when speaking." },
        { en: "good at", vi: "giỏi về", ex: "She is very good at explaining complex grammar." },
        { en: "new to", vi: "mới làm quen với", ex: "I am quite new to shadowing techniques." },
        { en: "ready to", vi: "sẵn sàng để", ex: "I am ready to commit 12 hours a day." },
        { en: "nice to meet you", vi: "rất vui được gặp bạn", ex: "Hello everyone, nice to meet you all." },
        { en: "tell me about yourself", vi: "hãy kể cho tôi về bản thân bạn", ex: "Can you please tell me about yourself and your background?" }
      ],
      listening: {
        title: "Daniel's Introduction",
        script: "Hello, I’m Daniel. I’m thirty-two years old, and I live in a small apartment near the city centre. I work as a web designer for a local company. At the moment, I’m also learning English because I would like to work with international clients. I usually study before work and again in the evening. In my free time, I enjoy taking photos, cooking simple meals and watching documentaries. I’m not very confident when I speak English yet, but I practise every day. My main goal this year is to have a ten-minute conversation without changing to my first language.",
        questions: [
          "Where does Daniel live?",
          "What does he do for a living?",
          "Why is he learning English?",
          "When does he study English?",
          "What are two of his hobbies?",
          "What is his main goal this year?"
        ]
      },
      reading: {
        title: "Mina's First Day",
        text: "Mina is a new employee at a software company. On her first morning, she meets three people from her team. She tells them her name, where she is from and what kind of work she does. She also asks simple questions because she wants to remember everyone. At lunch, Mina writes the names in a small notebook. She is nervous, but she is happy to be there. Her manager speaks clearly and tells her that it is normal to need time to learn how the team works.",
        prompt: "Write a 50-word summary and explain what Mina does to remember her colleagues."
      },
      speakingTask: "Record a 2-minute self-introduction with no script. State your background, work, daily routine, and one major English goal.",
      writingTask: "Write a 60–80 word personal profile describing who you are, your current job/study, and why English matters to you."
    },
    {
      day: 2,
      theme: "Daily Routine",
      grammar: "present simple affirmative/negative + frequency adverbs",
      chunks: [
        { en: "wake up", vi: "thức giấc", ex: "I wake up at six thirty every morning." },
        { en: "get up", vi: "rời giường", ex: "She wakes up at six but doesn't get up immediately." },
        { en: "get ready", vi: "chuẩn bị sẵn sàng", ex: "It takes me fifteen minutes to get ready for work." },
        { en: "leave home", vi: "rời khỏi nhà", ex: "He leaves home at seven thirty to catch the bus." },
        { en: "go to work", vi: "đi làm", ex: "I go to work by bicycle when the weather is nice." },
        { en: "start work", vi: "bắt đầu làm việc", ex: "My team starts work promptly at nine." },
        { en: "finish work", vi: "kết thúc công việc", ex: "She usually finishes work around five thirty." },
        { en: "have lunch", vi: "ăn trưa", ex: "We usually have lunch together in the cafeteria." },
        { en: "take a break", vi: "nghỉ giải lao", ex: "Remember to take a break every ninety minutes." },
        { en: "get home", vi: "về đến nhà", ex: "I get home around seven and prepare dinner." },
        { en: "go to bed", vi: "đi ngủ", ex: "Going to bed early helps me stay focused tomorrow." },
        { en: "on weekdays", vi: "vào các ngày trong tuần", ex: "On weekdays I maintain a strict study routine." },
        { en: "at weekends", vi: "vào dịp cuối tuần", ex: "At weekends I spend time reviewing what I learned." },
        { en: "most days", vi: "hầu hết các ngày", ex: "Most days I listen to an English podcast during breakfast." },
        { en: "once a week", vi: "mỗi tuần một lần", ex: "We conduct a mock speaking test once a week." },
        { en: "twice a day", vi: "hai lần một ngày", ex: "Review your active flashcards twice a day." },
        { en: "from time to time", vi: "thỉnh thoảng", ex: "I read English novels from time to time." },
        { en: "hardly ever", vi: "hầu như không bao giờ", ex: "He hardly ever skips his morning vocabulary session." },
        { en: "spend time doing", vi: "dành thời gian làm gì", ex: "I spend two hours doing dictation and shadowing." },
        { en: "make time for", vi: "thu xếp thời gian cho", ex: "You must make time for deliberate pronunciation practice." }
      ],
      listening: {
        title: "Sara's Weekday",
        script: "On weekdays, Sara wakes up at six thirty, but she does not get up immediately. She checks the time, drinks a glass of water and gets ready for work. She leaves home at seven thirty and takes a bus. Her work starts at eight thirty. She usually has lunch with two colleagues, and they sometimes take a short walk after eating. Sara finishes work at five thirty. In the evening, she cooks, studies English for an hour and calls her parents. She hardly ever watches television on weekdays because she goes to bed early.",
        questions: [
          "What time does Sara wake up?",
          "How does she travel to work?",
          "What does she do after lunch sometimes?",
          "What time does she finish work?",
          "Why does she hardly ever watch TV on weekdays?"
        ]
      },
      reading: {
        title: "The Power of a Repeatable Routine",
        text: "A routine can make a difficult goal easier. If you decide exactly when and where to study, you do not need to make the same decision every day. A simple routine might be twenty minutes after breakfast and another twenty minutes before dinner. The important point is not to create a perfect schedule. It is to create a schedule that you can repeat. When the routine becomes normal, starting feels easier.",
        prompt: "Why is a repeatable routine better than a perfect schedule according to the author?"
      },
      speakingTask: "Describe your real weekday for 3 minutes without stopping. Use at least 8 target chunks from today's list.",
      writingTask: "Write 80 words about your normal weekday and how you schedule your deep English study blocks."
    },
    {
      day: 3,
      theme: "People & Home",
      grammar: "possessives + there is/there are",
      chunks: [
        { en: "live with", vi: "sống cùng với", ex: "He lives with his family in an apartment." },
        { en: "live alone", vi: "sống một mình", ex: "Living alone taught me how to manage my time." },
        { en: "a family of", vi: "gia đình gồm (số người)", ex: "We are a family of four." },
        { en: "close to", vi: "gần với", ex: "The flat is close to a busy shopping area." },
        { en: "far from", vi: "xa khỏi", ex: "My workplace is not far from where I live." },
        { en: "next to", vi: "bên cạnh", ex: "There is a quiet coffee shop next to my house." },
        { en: "in front of", vi: "ở phía trước", ex: "The bus stop is located in front of the building." },
        { en: "behind", vi: "ở phía sau", ex: "There is a peaceful park right behind our block." },
        { en: "on the left", vi: "ở phía bên trái", ex: "My study desk is on the left side of the room." },
        { en: "on the right", vi: "ở phía bên phải", ex: "The bookshelf is on the right." },
        { en: "there is", vi: "có (danh từ số ít)", ex: "There is a large window that lets in natural sunlight." },
        { en: "there are", vi: "có (danh từ số nhiều)", ex: "There are two laptops on the main table." },
        { en: "a quiet place", vi: "một nơi yên tĩnh", ex: "I need a quiet place for intensive listening practice." },
        { en: "a busy area", vi: "khu vực đông đúc", ex: "The city center is usually a very busy area." },
        { en: "share a room", vi: "ở chung phòng", ex: "They share a room during their university years." },
        { en: "have in common", vi: "có điểm chung", ex: "We have many interests in common, especially reading." },
        { en: "get along with", vi: "hòa hợp với", ex: "I get along very well with my study partners." },
        { en: "spend time together", vi: "dành thời gian cùng nhau", ex: "We spend time together discussing difficult articles." },
        { en: "look like", vi: "trông giống như", ex: "What does your current study setup look like?" },
        { en: "be similar to", vi: "tương tự như", ex: "My daily timetable is similar to the bootcamp schedule." }
      ],
      listening: {
        title: "Kevin's Flat",
        script: "Kevin lives with his sister in a two-bedroom flat. The flat is on a quiet street, but it is close to a busy shopping area. There is a small kitchen next to the living room, and there are two desks near the window because both of them sometimes work from home. Kevin’s room is on the left. His sister’s room is on the right. They are quite different, but they get along well. Kevin likes cooking, while his sister prefers baking. At weekends, they often invite friends over for dinner.",
        questions: [
          "Who does Kevin live with?",
          "How many bedrooms are there in the flat?",
          "Why are there two desks near the window?",
          "Where is Kevin's room located?",
          "How are Kevin and his sister different yet compatible?"
        ]
      },
      reading: {
        title: "My Neighbourhood",
        text: "My neighbourhood is not famous, but I like it. There is a small park behind my building and a market about five minutes away. There are several cafés near the main road, but my street is usually quiet at night. The bus stop is in front of a pharmacy. I do not know all my neighbours, but I often see the same people in the morning. That makes the area feel familiar.",
        prompt: "Summarize the key features of the writer's neighborhood in 2-3 sentences."
      },
      speakingTask: "Describe your home and neighbourhood for 3 minutes aloud. Focus on using 'there is/are' and spatial prepositions.",
      writingTask: "Write 80–100 words describing your living space or study room and why it supports your learning."
    },
    {
      day: 4,
      theme: "Work & Study",
      grammar: "present simple questions + can/can’t",
      chunks: [
        { en: "be responsible for", vi: "chịu trách nhiệm về", ex: "He is responsible for user requests and technical issues." },
        { en: "work on", vi: "làm việc về, phát triển", ex: "I am currently working on improving my speaking rhythm." },
        { en: "take part in", vi: "tham gia vào", ex: "I take part in daily shadowing drills." },
        { en: "deal with", vi: "giải quyết, xử lý", ex: "Good students learn to deal with difficult challenges." },
        { en: "learn how to", vi: "học cách làm gì", ex: "I want to learn how to express nuanced opinions." },
        { en: "need to", vi: "cần phải", ex: "You need to retrieve vocabulary actively without hints." },
        { en: "have to", vi: "phải (nghĩa vụ)", ex: "I have to complete my error log before sleeping." },
        { en: "be able to", vi: "có khả năng", ex: "After 120 days, you will be able to sustain a C1 discussion." },
        { en: "ask for help", vi: "nhờ sự giúp đỡ", ex: "Don't hesitate to ask for help when feedback is needed." },
        { en: "solve a problem", vi: "giải quyết vấn đề", ex: "Let's analyse the cause and solve the problem systematically." },
        { en: "make a mistake", vi: "mắc lỗi", ex: "It is normal to make a mistake when learning a new structure." },
        { en: "check my work", vi: "kiểm tra bài làm", ex: "Always check your work for recurring errors before submitting." },
        { en: "meet a deadline", vi: "kịp hạn chót", ex: "We worked hard to meet the project deadline." },
        { en: "work in a team", vi: "làm việc nhóm", ex: "I enjoy learning how to work in an international team." },
        { en: "work by myself", vi: "tự làm một mình", ex: "I can study for six hours by myself without distraction." },
        { en: "pay attention to", vi: "chú ý đến", ex: "Pay close attention to final consonant sounds." },
        { en: "improve my skills", vi: "nâng cao kỹ năng", ex: "Daily deliberate practice will improve your speaking skills." },
        { en: "gain experience", vi: "tích lũy kinh nghiệm", ex: "You gain experience by producing output every day." },
        { en: "make progress", vi: "tiến bộ", ex: "Small daily gains help you make steady progress." },
        { en: "keep learning", vi: "tiếp tục học tập", ex: "Stay disciplined and keep learning every single day." }
      ],
      listening: {
        title: "Leo's IT Work",
        script: "Leo works in a small IT support team. He is responsible for checking user requests and solving simple technical problems. When a problem is difficult, he asks a senior engineer for help. Leo can fix many common issues, but he cannot solve everything by himself yet. He also studies for an online certificate after work. He says the hardest part is making time to study when he is tired. To make progress, he studies for short periods every day instead of waiting for the weekend.",
        questions: [
          "What is Leo responsible for?",
          "When does he ask for help?",
          "What can he fix and what can't he do yet?",
          "What does he study after work?",
          "How does he make progress even when tired?"
        ]
      },
      reading: {
        title: "Turning Errors into Training Targets",
        text: "Good learners do not try to avoid every mistake. They try to notice useful mistakes. If a mistake happens once, it may not matter. If the same mistake happens again and again, it becomes a pattern. A learner can write the pattern in an error log, create two correct examples and practise it during speaking. This turns an error into a training target.",
        prompt: "Explain how an error log converts mistakes into deliberate learning gains."
      },
      speakingTask: "Explain what you do at work or university. Include your responsibilities, what you can do well, and one skill you need to improve.",
      writingTask: "Write 100 words about your professional or academic goals and the skills you are currently targeting."
    },
    {
      day: 5,
      theme: "Food & Shopping",
      grammar: "countable/uncountable + some/any + much/many",
      chunks: [
        { en: "a bottle of", vi: "một chai", ex: "I bought a bottle of water after my study session." },
        { en: "a piece of", vi: "một mẩu, một mẩu tin/lời khuyên", ex: "Let me give you a useful piece of advice." },
        { en: "a cup of", vi: "một tách (cà phê/trà)", ex: "She drinks a cup of black coffee before studying." },
        { en: "a bowl of", vi: "một bát", ex: "He ordered a hot bowl of soup for lunch." },
        { en: "a little", vi: "một chút (không đếm được)", ex: "I need a little more time to finish this draft." },
        { en: "a few", vi: "một vài (đếm được)", ex: "Here are a few collocations worth memorizing." },
        { en: "not enough", vi: "không đủ", ex: "Simply reading grammar rules is not enough for speaking fluency." },
        { en: "too much", vi: "quá nhiều (không đếm được)", ex: "Too much passive input without output leads to stagnation." },
        { en: "too many", vi: "quá nhiều (đếm được)", ex: "Don't try to learn too many isolated words at once." },
        { en: "how much is", vi: "bao nhiêu tiền", ex: "How much is this textbook?" },
        { en: "how many do you need", vi: "bạn cần bao nhiêu cái", ex: "How many target chunks do you need to master today?" },
        { en: "I would like", vi: "tôi muốn (lịch sự)", ex: "I would like to order a warm beverage, please." },
        { en: "I am looking for", vi: "tôi đang tìm kiếm", ex: "I am looking for authentic podcasts with transcripts." },
        { en: "do you have any", vi: "bạn có cái nào không", ex: "Do you have any questions about this sentence?" },
        { en: "anything else", vi: "còn gì nữa không", ex: "Would you like anything else with your meal?" },
        { en: "pay by card", vi: "thanh toán bằng thẻ", ex: "Most modern supermarkets allow customers to pay by card." },
        { en: "pay in cash", vi: "thanh toán bằng tiền mặt", ex: "You can pay in cash at the traditional market." },
        { en: "on sale", vi: "đang giảm giá", ex: "This quality dictionary was on sale yesterday." },
        { en: "good value", vi: "đáng tiền, giá trị tốt", ex: "A durable notebook offers good value for language learners." },
        { en: "compare prices", vi: "so sánh giá cả", ex: "Smart consumers always compare prices before purchasing." }
      ],
      listening: {
        title: "Nora's Shopping Trip",
        script: "Nora stops at a supermarket on her way home. She needs some rice, a few tomatoes, two bottles of water and a little coffee. She does not buy any bread because there is still some at home. She wants to buy cheese, but it is more expensive than she expected, so she compares two brands. One is cheaper, but the other is larger and looks like better value. At the checkout, the cashier asks, ‘Anything else?’ Nora says no and pays by card.",
        questions: [
          "What items does Nora need to purchase?",
          "Why doesn't she buy any bread?",
          "Why does she compare two brands of cheese?",
          "What criteria does she use to evaluate which cheese is better value?",
          "How does she complete her payment?"
        ]
      },
      reading: {
        title: "Evaluating Real Value",
        text: "Price is not the only thing to consider when you buy something. A cheap product can be poor value if it breaks quickly. A more expensive product can also be poor value if you do not need its extra features. Before buying, ask three questions: What problem does this solve? How often will I use it? What is the total cost, including accessories or maintenance? These questions make comparison easier.",
        prompt: "Explain the three evaluation questions to ask before buying any tool or course."
      },
      speakingTask: "Pretend you are grocery shopping and buying one piece of tech. Explain aloud why you choose each item and compare their value.",
      writingTask: "Write a 100-word product comparison evaluating two items or apps you have recently used."
    },
    {
      day: 6,
      theme: "Places & Directions",
      grammar: "prepositions of place/movement + imperatives",
      chunks: [
        { en: "go straight", vi: "đi thẳng", ex: "Go straight for two blocks until you see the station." },
        { en: "turn left", vi: "rẽ trái", ex: "Turn left at the next intersection." },
        { en: "turn right", vi: "rẽ phải", ex: "Turn right after passing the bank." },
        { en: "cross the street", vi: "băng qua đường", ex: "Cross the street safely at the pedestrian crossing." },
        { en: "go past", vi: "đi ngang qua", ex: "Go past the coffee shop and you will see the library." },
        { en: "at the corner", vi: "ở góc đường", ex: "The pharmacy is right at the corner." },
        { en: "at the traffic lights", vi: "ở cột đèn giao thông", ex: "Wait at the traffic lights before turning." },
        { en: "across from", vi: "đối diện với", ex: "The bookstore is located directly across from the park." },
        { en: "between A and B", vi: "ở giữa A và B", ex: "The cafe is situated between a bookstore and a flower shop." },
        { en: "at the end of", vi: "ở cuối (con đường)", ex: "You will find the entrance at the end of the hall." },
        { en: "on your way", vi: "trên đường đi", ex: "You will pass several old monuments on your way." },
        { en: "take the first left", vi: "rẽ vào lối rẽ đầu tiên bên trái", ex: "Take the first left after the roundabout." },
        { en: "take the second right", vi: "rẽ vào lối rẽ thứ hai bên phải", ex: "Take the second right onto Oak Avenue." },
        { en: "you will see", vi: "bạn sẽ nhìn thấy", ex: "Keep walking and you will see the sign on your right." },
        { en: "it is about five minutes away", vi: "nó cách đây khoảng 5 phút", ex: "The subway station is about five minutes away." },
        { en: "within walking distance", vi: "trong khoảng cách đi bộ được", ex: "Everything in this neighborhood is within walking distance." },
        { en: "by bus", vi: "bằng xe buýt", ex: "It is faster to travel by bus during morning hours." },
        { en: "on foot", vi: "đi bộ", ex: "I prefer traveling on foot to enjoy the city atmosphere." },
        { en: "get off at", vi: "xuống xe ở (trạm)", ex: "Get off at Central Station and take exit 4." },
        { en: "how do I get to", vi: "làm sao để tôi đi đến", ex: "Excuse me, how do I get to the national museum?" }
      ],
      listening: {
        title: "Directions to the Library",
        script: "A visitor asks Maya how to get to the public library. Maya says, ‘Go straight for about three minutes and turn right at the traffic lights. Go past a bank and a small café. The library is on the left, across from a park. If you reach the train station, you have gone too far.’ The visitor asks if it is within walking distance. Maya says yes. It takes about ten minutes on foot, so there is no need to take a bus.",
        questions: [
          "Where should the visitor make a right turn?",
          "What two landmarks should the visitor pass?",
          "Where is the library located relative to the park?",
          "What landmark indicates that the visitor has walked too far?",
          "How long does the journey take on foot?"
        ]
      },
      reading: {
        title: "Giving Effective Directions",
        text: "Clear directions use landmarks, not only distances. ‘Walk 300 metres’ may be difficult if a person cannot judge distance accurately. ‘Go past the bank and turn left at the pharmacy’ is often much easier to follow. Good directions also contain a check: for example, ‘If you see the station, you have gone too far.’ A check helps the listener notice and correct a mistake early.",
        prompt: "What is a 'landmark check' and why does it make verbal directions clearer?"
      },
      speakingTask: "Give directions from your house to your favorite coffee shop or workplace aloud. Include at least two landmark checks.",
      writingTask: "Write clear, step-by-step directions in 80–120 words guiding a foreign visitor from the airport/station to your home."
    },
    {
      day: 7,
      theme: "Week 1 Review & Gate Benchmark",
      grammar: "review: be, present simple, questions, can, there is/are, countability, prepositions",
      chunks: [
        { en: "review all 120 Week-1 chunks", vi: "ôn tập toàn bộ 120 chunks tuần 1", ex: "Today we review all 120 Week-1 chunks with active recall." },
        { en: "active recall", vi: "chủ động gợi nhớ (không nhìn gợi ý)", ex: "Active recall produces much stronger synaptic connections than rereading." },
        { en: "correct a mistake", vi: "sửa chữa một lỗi sai", ex: "Learn to identify and correct a mistake on the spot." },
        { en: "say it again", vi: "nói lại lần nữa", ex: "Say it again with natural rhythm and sentence stress." },
        { en: "speak more clearly", vi: "nói rõ ràng hơn", ex: "Focus on articulating final consonants to speak more clearly." },
        { en: "slow down", vi: "nói chậm lại", ex: "Slow down slightly to maintain grammatical control." },
        { en: "speed up", vi: "tăng tốc độ", ex: "Speed up once the collocations become completely automatic." },
        { en: "check the meaning", vi: "kiểm tra ý nghĩa", ex: "Always check the meaning of the full phrase in context." },
        { en: "use it in context", vi: "sử dụng nó trong ngữ cảnh", ex: "Never memorize isolated words; always use it in context." },
        { en: "give an example", vi: "đưa ra một ví dụ", ex: "Can you give an example sentence demonstrating this verb pattern?" },
        { en: "ask a question", vi: "đặt một câu hỏi", ex: "Ask a question naturally during the conversation." },
        { en: "answer naturally", vi: "trả lời tự nhiên", ex: "Use standard conversational fillers to answer naturally." },
        { en: "without notes", vi: "không dùng tài liệu / giấy nhớ", ex: "Deliver your 3-minute presentation completely without notes." },
        { en: "from memory", vi: "từ trí nhớ", ex: "Recite the shadowing paragraph from memory." },
        { en: "in my own words", vi: "bằng lời văn của chính tôi", ex: "Explain the main thesis in my own words." },
        { en: "main idea", vi: "ý chính", ex: "Identify the main idea before analyzing minor details." },
        { en: "important detail", vi: "chi tiết quan trọng", ex: "Take note of every important detail in the transcript." },
        { en: "make a summary", vi: "tạo bản tóm tắt", ex: "Make a concise summary in under one hundred words." },
        { en: "compare my recordings", vi: "so sánh các bản thu âm của tôi", ex: "Compare my recordings from Day 1 and Day 7 to observe improvements." },
        { en: "plan next week", vi: "lên kế hoạch cho tuần tới", ex: "Review your error log and plan next week's focus areas." }
      ],
      listening: {
        title: "Why Deliberate Repetition Works",
        script: "This week you practised a small set of basic structures many times. That repetition is intentional. Fast progress does not come from seeing hundreds of grammar rules once. It comes from meeting useful language, retrieving it, using it in speech and writing, receiving feedback and then using it again. Today, do not chase many new items. Test what you can produce without notes. Compare your Day 1 and Day 7 recordings. The difference may still be small, but you should notice faster sentence building and a clearer idea of your weaknesses.",
        questions: [
          "Why is deliberate repetition intentional?",
          "What does genuine rapid progress NOT come from?",
          "What should you test today instead of chasing new items?",
          "What two audio recordings should you compare?",
          "What two improvements should you start noticing?"
        ]
      },
      reading: {
        title: "The Weekly Review as a Strategic Decision Point",
        text: "A weekly review is a decision point. First, check what improved. Second, identify what is still weak. Third, change next week’s study time based on evidence. If listening is much weaker than reading, move one block toward listening. If you know grammar rules but cannot speak, reduce explanation time and increase production. A plan should respond to your results.",
        prompt: "Explain the three steps of an evidence-based weekly review."
      },
      speakingTask: "Record a 5-minute continuous talk without notes: who you are, your routine, your work/study, your living space, and what you achieved in Week 1.",
      writingTask: "Write a 120-word Week 1 reflection detailing: what improved, which grammar errors repeated, and your priority adjustments for Week 2."
    }
  ],

  // Speaking Prompts Bank (60 Prompts)
  speakingPrompts: {
    A1_A2: [
      { id: 1, text: "Introduce yourself without notes (background, work, hobbies, goals).", targetTime: "2 min" },
      { id: 2, text: "Describe your normal weekday from waking up to sleeping.", targetTime: "2-3 min" },
      { id: 3, text: "Describe your home and the neighborhood where you live.", targetTime: "2-3 min" },
      { id: 4, text: "Describe a family member or close friend and why they matter to you.", targetTime: "2 min" },
      { id: 5, text: "Explain what you do for work or study and your main daily responsibilities.", targetTime: "3 min" },
      { id: 6, text: "Describe what you did yesterday using past simple tenses.", targetTime: "2-3 min" },
      { id: 7, text: "Talk about your plans for next weekend and next month.", targetTime: "2-3 min" },
      { id: 8, text: "Explain how to get from your home to a familiar landmark or city center.", targetTime: "2 min" },
      { id: 9, text: "Describe foods you like and dislike, and your cooking habits.", targetTime: "2-3 min" },
      { id: 10, text: "Compare two places you know well (e.g. big city vs peaceful countryside).", targetTime: "3 min" },
      { id: 11, text: "Explain one practical problem you had recently and how you solved it.", targetTime: "3 min" },
      { id: 12, text: "Give advice to someone starting your favorite hobby or skill.", targetTime: "3 min" },
      { id: 13, text: "Talk about a skill you want to learn this year and how you plan to practice.", targetTime: "3 min" },
      { id: 14, text: "Describe a useful piece of technology you rely on every day.", targetTime: "3 min" },
      { id: 15, text: "Tell a simple, memorable story from your childhood.", targetTime: "3-4 min" }
    ],
    B1: [
      { id: 16, text: "Is remote work better than traditional office work? Evaluate trade-offs.", targetTime: "5-7 min" },
      { id: 17, text: "What qualities make someone an outstanding colleague or teammate?", targetTime: "5 min" },
      { id: 18, text: "What is the most effective way to learn a challenging skill?", targetTime: "5-7 min" },
      { id: 19, text: "Should young children have unrestricted access to smartphones?", targetTime: "5 min" },
      { id: 20, text: "What infrastructure and cultural elements make a city pleasant to live in?", targetTime: "5-7 min" },
      { id: 21, text: "Does social media genuinely connect people or isolate them further?", targetTime: "6-8 min" },
      { id: 22, text: "Should universities focus on theoretical foundations or immediate practical job skills?", targetTime: "6 min" },
      { id: 23, text: "How can individuals overcome procrastination and build enduring habits?", targetTime: "6 min" },
      { id: 24, text: "What is a pressing environmental issue in your area and what solutions are viable?", targetTime: "6-8 min" },
      { id: 25, text: "Analyze the advantages and hidden drawbacks of modern online e-commerce.", targetTime: "6 min" },
      { id: 26, text: "Is failure an unavoidable prerequisite for deep learning and mastery?", targetTime: "5-7 min" },
      { id: 27, text: "How should modern companies handle mistakes made by junior employees?", targetTime: "5 min" },
      { id: 28, text: "How has instant messaging transformed personal and professional communication?", targetTime: "6 min" },
      { id: 29, text: "Is it better to specialize deeply in one niche or develop a broad range of skills?", targetTime: "7 min" },
      { id: 30, text: "What criteria should critical thinkers use to determine whether news is trustworthy?", targetTime: "7-10 min" }
    ],
    B2: [
      { id: 31, text: "Will generative AI create more sustainable jobs than it displaces?", targetTime: "10-12 min" },
      { id: 32, text: "Is digital privacy gradually becoming an unattainable luxury for ordinary citizens?", targetTime: "10-12 min" },
      { id: 33, text: "Should regulatory authorities intervene to police algorithmic content curation?", targetTime: "10-15 min" },
      { id: 34, text: "What are the hidden societal and cognitive costs of modern hyper-convenience?", targetTime: "10-12 min" },
      { id: 35, text: "At what point does economic automation transform from efficiency into a social crisis?", targetTime: "12 min" },
      { id: 36, text: "Should public mass transit be heavily subsidized or entirely cost-free?", targetTime: "10-12 min" },
      { id: 37, text: "Is indefinite economic growth genuinely compatible with ecological sustainability?", targetTime: "12-15 min" },
      { id: 38, text: "How should open societies counteract algorithmic misinformation without infringing on speech?", targetTime: "12-15 min" },
      { id: 39, text: "Should high-tech employers prioritize portfolio evidence over academic degrees?", targetTime: "10-12 min" },
      { id: 40, text: "What gives modern institutional leaders true credibility and legitimacy?", targetTime: "10-12 min" },
      { id: 41, text: "Should organizational error be punished or analyzed in high-risk engineering environments?", targetTime: "12 min" },
      { id: 42, text: "Does productivity software make knowledge workers more effective or merely busier?", targetTime: "10-12 min" },
      { id: 43, text: "How should modern societies balance technological speed with precautionary safety?", targetTime: "12-15 min" },
      { id: 44, text: "Is standardized testing fundamentally flawed as an evaluation metric for human intelligence?", targetTime: "10-12 min" },
      { id: 45, text: "Why is public trust in scientific expertise eroding in certain domains?", targetTime: "12-15 min" }
    ],
    C1: [
      { id: 46, text: "To what extent should individual citizens be held ethically responsible for systemic crises?", targetTime: "15-20 min" },
      { id: 47, text: "Is technological innovation inherently teleological and beneficial, or is that an ideological illusion?", targetTime: "15-20 min" },
      { id: 48, text: "How must institutional policymakers act when scientific consensus is marked by profound uncertainty?", targetTime: "15-20 min" },
      { id: 49, text: "Where lies the demarcation line where legitimate rhetorical persuasion degenerates into psychological manipulation?", targetTime: "15-20 min" },
      { id: 50, text: "Is thermodynamic and economic efficiency an inherently desirable social objective?", targetTime: "15-20 min" },
      { id: 51, text: "Can an open constitutional democracy simultaneously optimize both civic liberties and total surveillance security?", targetTime: "15-20 min" },
      { id: 52, text: "Should synthetic cultural artifacts produced by generative algorithms carry distinct legal and copyright status?", targetTime: "15-20 min" },
      { id: 53, text: "Examine how misaligned economic incentives systematically distort rational collective decision-making.", targetTime: "15-20 min" },
      { id: 54, text: "Why do complex bureaucracies routinely reproduce known systemic blunders despite extensive historical documentation?", targetTime: "15-20 min" },
      { id: 55, text: "What are the epistemological boundaries and perils of purely data-driven governance?", targetTime: "15-20 min" },
      { id: 56, text: "Is persistent socio-economic inequality fundamentally an economic, institutional, or philosophical conundrum?", targetTime: "15-20 min" },
      { id: 57, text: "Re-evaluate the ontological purpose of higher education institutions in an era of hyper-accessible knowledge.", targetTime: "15-20 min" },
      { id: 58, text: "Under what conditions should technical experts subordinate empirical recommendations to populist sentiment?", targetTime: "15-20 min" },
      { id: 59, text: "Can legal and regulatory frameworks realistically keep pace with exponential technological developments?", targetTime: "15-20 min" },
      { id: 60, text: "What does it fundamentally mean to be a cultivated, well-educated intellectual in the twenty-first century?", targetTime: "15-20 min" }
    ]
  },

  // Writing Prompts Bank (40 Prompts)
  writingPrompts: {
    A1_A2: [
      { id: 1, words: "60 words", text: "Introduce yourself, including your name, origin, job/study and one goal." },
      { id: 2, words: "80 words", text: "Describe your normal daily schedule from morning until night." },
      { id: 3, words: "80 words", text: "Describe your home or study space, using prepositions of place." },
      { id: 4, words: "100 words", text: "Write a narrative about a memorable day or weekend in your life." },
      { id: 5, words: "100 words", text: "Write an email to a friend outlining your plans for next summer." },
      { id: 6, words: "120 words", text: "Compare two cities, neighborhoods, or seasons that you know well." },
      { id: 7, words: "120 words", text: "Write a short guide giving advice to a newcomer starting to learn English." },
      { id: 8, words: "120 words", text: "Explain a software tool, gadget, or app that helps your daily workflow." },
      { id: 9, words: "150 words", text: "Describe a challenge you faced recently at work/study and how you resolved it." },
      { id: 10, words: "150 words", text: "Write about an important personal skill you have learned through practice." }
    ],
    B1: [
      { id: 11, words: "180 words", text: "Essay: Is remote working genuinely better than traditional office work?" },
      { id: 12, words: "180 words", text: "Article: How can students retain complex information more effectively?" },
      { id: 13, words: "180-200 words", text: "Opinion Essay: The tangible benefits and mental health drawbacks of social media." },
      { id: 14, words: "180-200 words", text: "Essay: What pedagogical qualities distinguish an inspiring educator?" },
      { id: 15, words: "180-200 words", text: "Opinion: Should university curricula prioritize vocational skills over abstract theory?" },
      { id: 16, words: "180-200 words", text: "Article: An emerging technological breakthrough that will reshape everyday living." },
      { id: 17, words: "200 words", text: "Proposal: Practical measures a municipality can take to boost civic happiness." },
      { id: 18, words: "180-220 words", text: "Formal Email: Lodge a formal complaint regarding defective service and propose equitable restitution." },
      { id: 19, words: "200-220 words", text: "Review: Review a non-fiction book, documentary, or course that significantly shifted your perspective." },
      { id: 20, words: "200-220 words", text: "Summary & Commentary: Summarize a contemporary news editorial and defend your counter-stance." }
    ],
    B2: [
      { id: 21, words: "220-250 words", text: "Discursive Essay: 'Artificial intelligence will create superior employment rather than displace workers.' Discuss both sides." },
      { id: 22, words: "220-250 words", text: "Opinion Essay: Digital confidentiality and privacy must be preserved as non-negotiable human rights." },
      { id: 23, words: "230-250 words", text: "Formal Report: Investigate internal bottlenecks in an organization and propose operational optimizations." },
      { id: 24, words: "230-250 words", text: "Strategic Proposal: Outline a cohesive institutional plan to foster continuous professional upskilling." },
      { id: 25, words: "230-260 words", text: "Essay: Technological rollout should be systematically decelerated when systemic hazards remain uncertain." },
      { id: 26, words: "240-260 words", text: "Critical Review: Critically appraise a modern technological solution that promised revolution but underdelivered." },
      { id: 27, words: "240-260 words", text: "Incident Report: Dissect the root operational causes of an ambitious project failure and articulate actionable lessons." },
      { id: 28, words: "250 words", text: "Essay: Traditional academic diplomas are experiencing credential inflation and declining market relevance." },
      { id: 29, words: "250 words", text: "Infrastructure Proposal: Formulate a multi-modal transit modernization initiative for a congested metropolis." },
      { id: 30, words: "250 words", text: "Legal/Social Essay: Social platforms should bear strict liability for the viral amplification of coordinated disinformation." }
    ],
    C1: [
      { id: 31, words: "250-280 words", text: "Cambridge C1 Essay: Which factor contributes more decisively to sustained educational mastery — intrinsic student motivation or instructional pedagogical excellence?" },
      { id: 32, words: "250-280 words", text: "C1 Policy Essay: Should macroeconomic state policy prioritize aggressive GDP growth or socio-ecological resilience during turbulent decades?" },
      { id: 33, words: "250-280 words", text: "Formal C1 Proposal: Formulate an executive proposal establishing a high-performance talent incubation framework." },
      { id: 34, words: "250-280 words", text: "C1 Analytical Report: Evaluate two competing paradigm models for deploying autonomous software agents across knowledge enterprises." },
      { id: 35, words: "250-280 words", text: "C1 Critical Review: Write an erudite review evaluating an influential academic treatise or philosophical documentary." },
      { id: 36, words: "260-300 words", text: "C1 Discursive Essay: Is algorithmic efficiency an adequate surrogate metric for civilizational progress?" },
      { id: 37, words: "260-300 words", text: "C1 Argumentative Essay: To what degree can decentralized consumer choices resolve planetary environmental externalities?" },
      { id: 38, words: "260-300 words", text: "C1 Investigative Report: Account for why a high-profile organizational transformation collapsed despite overwhelming capital backing." },
      { id: 39, words: "260-300 words", text: "C1 Policy Proposal: Devise concrete systemic mechanisms to suppress viral disinformation without sanctioning state censorship." },
      { id: 40, words: "260-300 words", text: "C1 Philosophical Essay: Should algorithmic decisions affecting civil liberties be mandated by jurisprudence to be transparently explainable?" }
    ]
  },

  // Grammar Mastery Matrix (From A1 to C1)
  grammarSyllabus: {
    A1_A2: [
      "be: statements / negatives / questions",
      "subject and object pronouns",
      "possessive adjectives/pronouns and possessive 's",
      "articles: a/an/the/zero",
      "present simple",
      "adverbs of frequency",
      "present continuous",
      "present simple vs present continuous",
      "there is / there are",
      "can / can’t",
      "imperatives",
      "countable / uncountable nouns",
      "some / any / much / many / a lot of",
      "past simple regular/irregular",
      "past questions and negatives",
      "going to / will",
      "comparatives / superlatives",
      "basic prepositions of time/place/movement",
      "present perfect: ever/never, just/already/yet",
      "should / must / have to",
      "gerund / infinitive basics"
    ],
    B1: [
      "past continuous",
      "present perfect vs past simple",
      "first conditional",
      "second conditional",
      "passive present/past",
      "reported statements/questions/commands",
      "defining/non-defining relative clauses",
      "used to / would for past habits",
      "present perfect continuous",
      "modal deduction",
      "indirect questions",
      "verb patterns: -ing / to-infinitive",
      "reason/result/contrast/concession linkers",
      "noun clauses",
      "tense sequence and sentence combining"
    ],
    B2: [
      "zero/first/second/third conditional system",
      "future continuous / future perfect",
      "passive variants",
      "causative have/get",
      "modal perfects (could have, should have, must have)",
      "participle clauses",
      "inversion basics",
      "cleft sentences",
      "advanced relative clauses",
      "advanced determiners/quantifiers",
      "hedging",
      "nominalisation",
      "substitution/reference",
      "word formation: prefixes/suffixes",
      "open cloze patterns",
      "key-word transformations",
      "paraphrasing without meaning change"
    ],
    C1: [
      "mixed conditionals",
      "negative adverbial inversion (Seldom, Under no circumstances, Not only...)",
      "advanced ellipsis and substitution",
      "advanced modality and stance",
      "complex noun phrases & pre-modification",
      "reporting verbs and epistemic distancing",
      "advanced cause/effect/concession structures",
      "register control (formal academic vs conversational)",
      "lexical grammar & dense collocations",
      "article/preposition accuracy under acute time pressure",
      "grammatical range without forced artificial complexity"
    ]
  },

  // Pronunciation Training Plan
  pronunciationPlan: {
    dailyCore: [
      { min: "3 min", task: "Mouth warm-up and troublesome consonant sounds (/θ/, /ð/, /ʃ/, /tʃ/)." },
      { min: "4 min", task: "Word stress: articulate 10 polysyllabic target words with correct primary accent." },
      { min: "4 min", task: "Sentence stress & rhythm: shadow 4–6 lines with timed content beats." },
      { min: "4 min", task: "Linking & reduction: repeat one natural fast-speech sentence 10 times." }
    ],
    phases: [
      {
        phase: "Days 1–14: Sound Stability",
        focus: "Consonant endings, minimal pairs: ship/sheep, full/fool, think/this, see/she, work/worked."
      },
      {
        phase: "Days 15–35: Stress & Rhythm",
        focus: "Stressed content words vs reduced function words. Schwa /ə/ in unstressed syllables. Strong vs weak forms."
      },
      {
        phase: "Days 36–70: Connected Speech",
        focus: "Consonant-to-vowel linking, elision of /t/ and /d/, assimilation, natural contraction flow (going to -> gonna, want to -> wanna)."
      },
      {
        phase: "Days 71–100: Prosody for Nuance",
        focus: "Contrastive stress, pitch movement signaling uncertainty vs conviction, breath/thought grouping."
      },
      {
        phase: "Days 101–120: Exam Flow & Fluency",
        focus: "Eliminating vocalized fillers ('uhm, ah'), maintaining prosodic cohesion across extended 4-minute monologues."
      }
    ]
  },

  // ChatGPT 8 AI Tutor Prompts Pack
  aiPrompts: [
    {
      id: 1,
      title: "1. Daily Speaking Tutor",
      description: "Luyện nói phản xạ strict CEFR: hỏi từng câu một, chỉ ra 3 lỗi đắt giá nhất, gợi ý 2 cụm từ C1 và hỏi tiếp.",
      template: `You are my strict CEFR English speaking coach. My current target level is [LEVEL]. Ask me one question at a time about [TOPIC]. Do not give me a model answer before I speak. After each answer: (1) identify only the 3 highest-value mistakes, (2) give a natural corrected version, (3) give 2 stronger phrases at my target level, and (4) ask a follow-up question. Keep the conversation in English unless I explicitly ask for Vietnamese clarification.`
    },
    {
      id: 2,
      title: "2. Pronunciation & Shadowing Coach",
      description: "Tạo bài luyện phát âm & shadowing 90 giây: ngắt theo nhịp thở, viết hoa trọng âm, đánh dấu nối âm.",
      template: `Create a 90-second shadowing script at [LEVEL] about [TOPIC]. Use natural spoken English, contractions and useful chunks. Then split it into short breath groups. Mark stressed words in CAPS, show linking with underscores where useful, and list 8 pronunciation features I should notice. Do not use IPA unless I ask.`
    },
    {
      id: 3,
      title: "3. Listening Generator",
      description: "Sinh bài nghe chuẩn CEFR: hiển thị 8 câu hỏi trước, sau khi trả lời mới hiện transcript, chấm điểm và tạo bài tập shadowing.",
      template: `Create an original listening exercise at CEFR [LEVEL] on [TOPIC]. First show only 8 comprehension questions. Do not show the transcript until I answer. After I answer, give the transcript, score me, explain every mistake, identify “known words I failed to hear”, and create a 10-item shadowing drill.`
    },
    {
      id: 4,
      title: "4. Writing Examiner (Cambridge Style)",
      description: "Chấm bài viết theo 5 tiêu chí chuẩn Cambridge, chỉ ra 5 lỗi hệ thống nghiêm trọng nhất và giao bài viết lại từ đầu.",
      template: `Act as a CEFR/Cambridge-style writing examiner. Do not rewrite my text immediately. First score: task achievement, organization/cohesion, grammar range/accuracy, vocabulary range/precision, and register. Estimate CEFR cautiously. Then list my 5 highest-impact recurring errors. Finally give me a rewrite assignment that forces me to fix those errors. Only provide a model answer after I submit my rewrite.

Here is my text for [TASK_DESCRIPTION]:
\"\"\"
[PASTE_YOUR_ESSAY_HERE]
\"\"\"`
    },
    {
      id: 5,
      title: "5. Error-Log Miner",
      description: "Khai thác dữ liệu nhật ký lỗi: gom cụm các lỗi lặp lại, xếp hạng tác động và tạo thẻ Anki/SRS cloze tương phản.",
      template: `Here is my English output and correction history. Extract recurring error patterns, merge duplicates, rank them by impact, and produce a table with: pattern, my example, corrected form, short rule, one contrast example, and one SRS cloze card. Ignore one-off typos unless they repeat.

My Output & Correction History:
\"\"\"
[PASTE_ERROR_LOG_HERE]
\"\"\"`
    },
    {
      id: 6,
      title: "6. Vocabulary / Chunk Trainer",
      description: "Kiểm tra chủ động gợi nhớ (Active Recall) cho danh sách cụm từ: cho tình huống để người học tự tạo câu hoàn chỉnh.",
      template: `I am learning these chunks: [PASTE_LIST]. Test active recall, not recognition. Give me Vietnamese or an English situation and make me produce the phrase in a complete sentence. Mix old and new items. If I fail an item twice, give one memorable contrast/example and retest it later. Never test items in the original order.`
    },
    {
      id: 7,
      title: "7. C1 Discussion Opponent (Tranh luận C1)",
      description: "Đóng vai đối thủ tranh luận C1: thử thách các giả định yếu, đòi bằng chứng và bắt bẻ cách khái quát hóa quá mức.",
      template: `Debate me on [TOPIC] at C1 level. Take a defensible position that is not necessarily mine. Challenge weak assumptions, ask for evidence, introduce counterexamples and force me to qualify overgeneralizations. After 15 minutes, stop the debate and assess fluency, coherence, grammatical control, lexical precision, interaction and pronunciation. Give me 5 replacement phrases for language I overused.`
    },
    {
      id: 8,
      title: "8. Daily 12H Planner Generator",
      description: "Lên lịch trình cụ thể 12 tiếng hôm nay dựa theo thời khóa biểu Bootcamp và các kỹ năng yếu cần khắc phục.",
      template: `Today is Day [X] of my 120-day English C1 bootcamp. My weak skills are [LIST]. Build today’s 12-hour study agenda using the bootcamp schedule. Give exact tasks, output quantities and pass/fail KPIs. Use only material appropriate to my current CEFR. Do not add extra hours.`
    }
  ],

  // Weekly CEFR Test Rubric
  weeklyRubric: {
    vocab: { title: "A. Vocabulary retrieval (30 min)", desc: "Sample 50 active chunks. Produce chunk in original sentence within 10s. Pass: ≥40/50." },
    grammar: { title: "B. Grammar production (30 min)", desc: "For each point: 2 affirmative, 1 negative, 1 question, 1 spontaneous spoken. Pass: ≥80% accuracy." },
    listening: { title: "C. Listening (45 min)", desc: "Target: Gist, details, numbers, attitude, known-but-not-heard words. Pass: ≥70% (aim ≥80%)." },
    reading: { title: "D. Reading (45 min)", desc: "Target: A1/A2 ≥80%, B1 ≥75%, B2 ≥70%, C1 ≥65–70% under timed conditions." },
    speakingDimensions: [
      { name: "Fluency", 0: "Cannot sustain speech; frequent blocking", 3: "Connected sentences with natural pauses", 5: "Sustained, effortless, flexible delivery" },
      { name: "Grammar Range & Control", 0: "Frequent blocking errors in basic structures", 3: "Generally controlled; errors do not obscure meaning", 5: "Broad, nuanced range with consistent high precision" },
      { name: "Lexical Precision", 0: "Extremely limited; repetitive basic words", 3: "Adequate functional range for unfamiliar topics", 5: "Rich, idiomatic, highly precise collocations" },
      { name: "Pronunciation & Intelligibility", 0: "Heavily distorted; often incomprehensible", 3: "Generally intelligible despite non-native accent", 5: "Clear articulation, natural linking, controlled prosody" },
      { name: "Coherence & Discourse", 0: "Fragmented, isolated bullet-point speech", 3: "Connected with standard cohesive linkers", 5: "Elegantly structured with subtle discourse markers" }
    ]
  }
};

export { BOOTCAMP_DATA };
export default BOOTCAMP_DATA;
