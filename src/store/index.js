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
  },
});
const metaSlice = createSlice({
  name: 'meta', initialState: { savedAt: null, error: null },
  reducers: { saved: (_, action) => action.payload },
});
export const { replaceStudy } = studySlice.actions;
const persistence = api => next => action => {
  const result = next(action);
  if (action.type === replaceStudy.type) {
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
