export const initialState = {
  currentDay: 1,
  completedDays: [],
  dayNotes: {},
  kpis: {}, // dateString -> { kpi_chunks: bool, ... }
  streak: 1,
  totalHoursStudied: 0,
  flashcards: [],
  grammarMastery: {}, // grammarString -> { understand: bool, written: bool, spoken: bool }
  errorLog: [],
  writingDrafts: {}, // day -> { draft1: '', draft2: '' }
  day0Assessment: {
    externalCefr: '',
    grammarScore: '',
    vocabScore: '',
    listeningLevel: 'A1',
    readingLevel: 'A1',
    speakingScore: { fluency: 0, grammar: 0, vocab: 0, pronunciation: 0, org: 0 },
    writingScore: { task: 0, org: 0, grammar: 0, vocab: 0 }
  },
  settings: {
    soundAlerts: true,
    desktopNotif: false,
    voiceAlerts: true
  }
};
