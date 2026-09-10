import { configureStore, createSlice } from '@reduxjs/toolkit';
import { initialState } from './defaults';

export const STORAGE_KEY = 'c1_bootcamp_state_v2';
export function readSavedStudy(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return structuredClone(initialState);
    return { ...structuredClone(initialState), ...saved, settings: { ...initialState.settings, ...saved.settings } };
  } catch {
    return structuredClone(initialState);
  }
}
const studySlice = createSlice({
  name: 'study',
  initialState: readSavedStudy(),
  reducers: {
    // Clone at the imperative tools boundary so Immer never freezes their working copy.
    replaceStudy: (_, action) => structuredClone(action.payload),
    setDay: (state, action) => {
      state.currentDay = Number(action.payload) || 1;
    },
    toggleCompleteDay: (state, action) => {
      const day = Number(action.payload);
      if (!Array.isArray(state.completedDays)) state.completedDays = [];
      const idx = state.completedDays.indexOf(day);
      if (idx >= 0) {
        state.completedDays.splice(idx, 1);
      } else {
        state.completedDays.push(day);
        state.completedDays.sort((a, b) => a - b);
      }
    },
    toggleKPI: (state, action) => {
      const { dayKey, kpiId } = action.payload;
      if (!state.kpis) state.kpis = {};
      if (!state.kpis[dayKey]) state.kpis[dayKey] = {};
      state.kpis[dayKey][kpiId] = !state.kpis[dayKey][kpiId];
    },
    updateGrammarMastery: (state, action) => {
      const { name, type, value } = action.payload;
      if (!state.grammarMastery) state.grammarMastery = {};
      if (!state.grammarMastery[name]) {
        state.grammarMastery[name] = { understand: false, written: false, spoken: false };
      }
      state.grammarMastery[name][type] = value !== undefined ? value : !state.grammarMastery[name][type];
    },
    reviewFlashcard: (state, action) => {
      const { cardId, quality } = action.payload;
      if (!Array.isArray(state.flashcards)) return;
      const card = state.flashcards.find(c => c.id === cardId);
      if (card) {
        card.box = quality;
        card.nextReview = Date.now() + (quality === 1 ? 1 : quality === 2 ? 3 : 7) * 86400000;
      }
    },
    addErrorLog: (state, action) => {
      if (!Array.isArray(state.errorLog)) state.errorLog = [];
      state.errorLog.unshift(action.payload);
    },
    removeErrorLog: (state, action) => {
      if (!Array.isArray(state.errorLog)) return;
      state.errorLog = state.errorLog.filter(e => e.id !== action.payload);
    },
    togglePronunciationCompleted: (state, action) => {
      const lessonId = action.payload;
      if (!state.pronunciationCompleted || typeof state.pronunciationCompleted !== 'object') {
        state.pronunciationCompleted = {};
      }
      state.pronunciationCompleted[lessonId] = !state.pronunciationCompleted[lessonId];
    },
    updateDay0Assessment: (state, action) => {
      if (!state.day0Assessment) state.day0Assessment = {};
      state.day0Assessment = { ...state.day0Assessment, ...action.payload };
    },
    updateWritingDraft: (state, action) => {
      const { day, draftType, text } = action.payload;
      if (!state.writingDrafts || typeof state.writingDrafts !== 'object') {
        state.writingDrafts = {};
      }
      if (!state.writingDrafts[day]) {
        state.writingDrafts[day] = {};
      }
      state.writingDrafts[day][draftType] = text;
    },
  },
});
const metaSlice = createSlice({
  name: 'meta', initialState: { savedAt: null, error: null },
  reducers: { saved: (_, action) => action.payload },
});
export const {
  replaceStudy,
  setDay,
  toggleCompleteDay,
  toggleKPI,
  updateGrammarMastery,
  reviewFlashcard,
  addErrorLog,
  removeErrorLog,
  togglePronunciationCompleted,
  updateDay0Assessment,
  updateWritingDraft
} = studySlice.actions;
const persistence = api => next => action => {
  const result = next(action);
  if (typeof action.type === 'string' && action.type.startsWith('study/')) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(api.getState().study));
      api.dispatch(metaSlice.actions.saved({ savedAt: Date.now(), error: null }));
    } catch {
      api.dispatch(metaSlice.actions.saved({ savedAt: null, error: 'Không thể lưu trên trình duyệt này.' }));
    }
  }
  return result;
};
export const store = configureStore({
  reducer: { study: studySlice.reducer, meta: metaSlice.reducer },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(persistence),
});
