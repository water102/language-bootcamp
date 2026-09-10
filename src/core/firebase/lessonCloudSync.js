/**
 * Firebase Firestore Cloud Synchronization for Custom AI Lessons
 * Allows users to backup, share, and synchronize custom curriculum lessons across devices.
 *
 * Sharing model:
 * - Each imported version is uploaded twice: a `day_${day}` pointer doc (latest per day,
 *   kept for backwards compatibility with the per-day fetch) and a `v_${lesson.id}` doc
 *   so multiple versions from different members accumulate for the same day.
 * - On startup every client subscribes to the collection, merges all shared versions
 *   into its local store and auto-activates them for days that have no local lesson,
 *   so everyone sees the lessons everyone has imported.
 */

import { db, firebaseConfig } from './firebaseConfig.js';
import { collection, doc, setDoc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import {
  saveRemoteCustomLessonVersion,
  activateRemoteCustomLesson,
  getCustomLessonVersions,
  getAllCustomLessonsLocal
} from '@/core/storage/db.js';

const COLLECTION_NAME = 'custom_lessons';

/**
 * Check if Firebase is realistically configured with non-empty API keys
 */
export function isFirebaseConfigured() {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id'
  );
}

/**
 * Cloud sync kill-switch: automated tests set VITE_DISABLE_CLOUD_SYNC=1 so
 * e2e runs never read from or write to the production Firestore collection.
 */
export function isCloudSyncEnabled() {
  return isFirebaseConfigured() && import.meta.env.VITE_DISABLE_CLOUD_SYNC !== '1';
}

function getSharedByLabel() {
  try {
    let label = localStorage.getItem('c1_device_label');
    if (!label) {
      label = `Thanh-vien-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      localStorage.setItem('c1_device_label', label);
    }
    return label;
  } catch (e) {
    return 'Thanh-vien';
  }
}

/**
 * Save a custom AI lesson to Firestore cloud (visible to every member)
 * @param {Object} lesson
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function saveCustomLessonToCloud(lesson) {
  if (!isCloudSyncEnabled()) {
    return {
      success: false,
      message: 'Firebase chưa được cấu hình API Key thực trong .env. Dữ liệu vẫn được lưu an toàn tại máy của bạn (Local Storage).'
    };
  }

  try {
    const day = Number(lesson.day);
    const payload = {
      ...lesson,
      sharedBy: getSharedByLabel(),
      cloudSyncedAt: new Date().toISOString()
    };
    const ops = [setDoc(doc(db, COLLECTION_NAME, `day_${day}`), payload, { merge: true })];
    if (lesson.id) {
      ops.push(setDoc(doc(db, COLLECTION_NAME, `v_${lesson.id}`), payload));
    }
    await Promise.all(ops);
    return {
      success: true,
      message: `Đã đồng bộ bài học Ngày ${day} lên Firebase Cloud — mọi thành viên sẽ tự động nhận được!`
    };
  } catch (err) {
    console.warn('[FirebaseSync] Failed to push lesson to cloud:', err);
    return {
      success: false,
      message: `Lỗi kết nối Firebase: ${err.message}. Bài học vẫn được lưu tại thiết bị của bạn.`
    };
  }
}

/**
 * Fetch a custom AI lesson from Firestore cloud for a specific day
 * @param {number} dayNum
 * @returns {Promise<{ success: boolean, lesson?: Object, message: string }>}
 */
export async function fetchCustomLessonFromCloud(dayNum) {
  if (!isCloudSyncEnabled()) {
    return {
      success: false,
      message: 'Firebase chưa được cấu hình. Đang dùng dữ liệu Local.'
    };
  }

  try {
    const day = Number(dayNum);
    const docRef = doc(db, COLLECTION_NAME, `day_${day}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        lesson: docSnap.data(),
        message: `Đã tải bài học Ngày ${day} từ Firebase Cloud.`
      };
    } else {
      return {
        success: false,
        message: `Chưa có bài học tùy biến nào trên Cloud cho Ngày ${day}.`
      };
    }
  } catch (err) {
    console.warn('[FirebaseSync] Failed to fetch lesson from cloud:', err);
    return {
      success: false,
      message: `Lỗi tải từ Firebase: ${err.message}`
    };
  }
}

/**
 * Fetch all available custom lessons stored on Firestore cloud (raw doc array)
 * @returns {Promise<{ success: boolean, lessons: Array<Object>, message: string }>}
 */
export async function fetchAllCustomLessonsFromCloud() {
  if (!isCloudSyncEnabled()) {
    return {
      success: false,
      lessons: [],
      message: 'Firebase chưa được cấu hình.'
    };
  }

  try {
    const docs = await fetchCloudLessonDocs();
    return {
      success: true,
      lessons: docs,
      message: `Đã tải ${docs.length} bài học từ Firebase Cloud.`
    };
  } catch (err) {
    console.warn('[FirebaseSync] Failed to fetch all cloud lessons:', err);
    return {
      success: false,
      lessons: [],
      message: `Lỗi tải danh mục từ Firebase: ${err.message}`
    };
  }
}

/**
 * Fetch the deduplicated shared lesson library (one entry per lesson id).
 * The collection stores both a `day_${day}` pointer doc and a `v_${lesson.id}`
 * version doc per import, so raw results contain duplicates that must merge.
 * @returns {Promise<{ success: boolean, lessons: Array<Object>, totalDocs: number, message: string }>}
 */
export async function fetchSharedLessonLibrary() {
  const res = await fetchAllCustomLessonsFromCloud();
  if (!res.success) {
    return { ...res, lessons: [], totalDocs: 0 };
  }

  const byId = new Map();
  res.lessons.forEach(raw => {
    const lesson = normalizeCloudLesson(raw);
    if (!lesson) return;
    const existing = byId.get(lesson.id);
    if (!existing || new Date(lesson.cloudSyncedAt || 0) > new Date(existing.cloudSyncedAt || 0)) {
      byId.set(lesson.id, lesson);
    }
  });

  const lessons = [...byId.values()].sort((a, b) =>
    (Number(a.day) - Number(b.day)) ||
    (new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
  );

  return {
    success: true,
    lessons,
    totalDocs: res.lessons.length,
    message: `Đã tải ${lessons.length} bài học dùng chung từ Firebase Cloud.`
  };
}

async function fetchCloudLessonDocs() {
  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
}

function normalizeCloudLesson(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const day = Number(raw.day);
  if (!Number.isFinite(day) || day < 1 || day > 120) return null;

  const lesson = { ...raw };
  delete lesson.docId;
  if (!lesson.id) {
    lesson.id = `cloud_${raw.docId || `day_${day}`}`;
  }
  lesson.day = day;
  if (!lesson.createdAt) lesson.createdAt = lesson.updatedAt || lesson.cloudSyncedAt || new Date().toISOString();
  if (!lesson.updatedAt) lesson.updatedAt = lesson.cloudSyncedAt || lesson.createdAt;
  return lesson;
}

/**
 * Merge cloud lesson docs into the local store.
 * - Deduplicates by lesson id, so re-downloads and own uploads are skipped.
 * - Adds unknown versions to the local version list (visible in the version selector).
 * - Auto-activates the newest shared lesson only for days that have NO local
 *   custom lesson yet, so a device's own active version is never overridden.
 */
async function mergeCloudLessonsIntoLocal(docs) {
  const validLessons = [];
  (docs || []).forEach(raw => {
    const lesson = normalizeCloudLesson(raw);
    if (lesson) validLessons.push(lesson);
  });
  if (validLessons.length === 0) {
    return { addedLessons: [], activatedLessons: [] };
  }

  const days = [...new Set(validLessons.map(l => l.day))];
  const daysWithoutLocal = new Set();
  for (const day of days) {
    try {
      const existing = await getCustomLessonVersions(day);
      if (!existing || existing.length === 0) daysWithoutLocal.add(day);
    } catch (e) {}
  }

  const addedLessons = [];
  for (const lesson of validLessons) {
    try {
      const res = await saveRemoteCustomLessonVersion(lesson);
      if (res && res.added) addedLessons.push(lesson);
    } catch (e) {
      console.warn('[FirebaseSync] Failed to store shared lesson locally:', e);
    }
  }

  const activatedLessons = [];
  for (const day of daysWithoutLocal) {
    const candidates = addedLessons.filter(l => l.day === day);
    if (candidates.length === 0) continue;
    candidates.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    const newest = candidates[0];
    try {
      if (activateRemoteCustomLesson(newest)) {
        activatedLessons.push(newest);
      }
    } catch (e) {}
  }

  return { addedLessons, activatedLessons };
}

/**
 * Self-healing upload: every lesson this device imported (or activated from
 * the cloud) but that is missing from the shared cloud collection is pushed
 * back up. This repairs the shared library when a device holds the only copy
 * (e.g. after a failed past upload or cloud cleanup), so all members keep
 * seeing every lesson.
 * @returns {Promise<{ pushed: number, error?: string }>}
 */
export async function restoreLocalLessonsToCloud() {
  if (!isCloudSyncEnabled()) return { pushed: 0 };

  try {
    const docs = await fetchCloudLessonDocs();
    const cloudIds = new Set();
    docs.forEach(d => {
      if (d.id) cloudIds.add(d.id);
      if (typeof d.docId === 'string' && d.docId.startsWith('v_')) cloudIds.add(d.docId.slice(2));
    });

    const localLessons = await getAllCustomLessonsLocal();
    let pushed = 0;
    for (const lesson of Object.values(localLessons || {})) {
      if (lesson?.id && !cloudIds.has(lesson.id)) {
        const res = await saveCustomLessonToCloud(lesson);
        if (res.success) pushed++;
      }
    }
    if (pushed > 0) {
      console.info(`[FirebaseSync] Restored ${pushed} local lesson(s) missing from the cloud library.`);
    }
    return { pushed };
  } catch (err) {
    console.warn('[FirebaseSync] Local lesson restore failed:', err);
    return { pushed: 0, error: err.message };
  }
}

/**
 * One-shot pull: download all shared lessons and merge them into the local store.
 * @returns {Promise<{ success: boolean, addedLessons: Array, activatedLessons: Array, totalDocs: number, message: string }>}
 */
export async function syncCustomLessonsFromCloud() {
  if (!isCloudSyncEnabled()) {
    return {
      success: false,
      addedLessons: [],
      activatedLessons: [],
      totalDocs: 0,
      message: 'Firebase chưa được cấu hình.'
    };
  }

  try {
    const docs = await fetchCloudLessonDocs();
    const { addedLessons, activatedLessons } = await mergeCloudLessonsIntoLocal(docs);
    return {
      success: true,
      addedLessons,
      activatedLessons,
      totalDocs: docs.length,
      message: `Đã đồng bộ ${docs.length} bài học dùng chung từ Firebase Cloud.`
    };
  } catch (err) {
    console.warn('[FirebaseSync] Cloud lesson sync failed:', err);
    return {
      success: false,
      addedLessons: [],
      activatedLessons: [],
      totalDocs: 0,
      message: `Lỗi đồng bộ từ Firebase: ${err.message}`
    };
  }
}

/**
 * Live subscription: every time any member imports a lesson, all connected
 * clients receive it instantly. The first snapshot delivers the full shared
 * library (initial sync), later snapshots deliver incremental changes.
 * @param {Function} handler ({ isFirst, addedLessons, activatedLessons, totalDocs }) => void
 * @returns {Function} unsubscribe
 */
export function subscribeToCustomLessonsFromCloud(handler) {
  if (!isCloudSyncEnabled()) {
    return () => {};
  }

  try {
    let isFirstSnapshot = true;
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, async snapshot => {
      const isFirst = isFirstSnapshot;
      isFirstSnapshot = false;
      const docs = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
      try {
        const { addedLessons, activatedLessons } = await mergeCloudLessonsIntoLocal(docs);
        if (typeof handler === 'function') {
          handler({ isFirst, addedLessons, activatedLessons, totalDocs: docs.length });
        }
      } catch (e) {
        console.warn('[FirebaseSync] Live sync merge failed:', e);
      }
    }, err => {
      console.warn('[FirebaseSync] Live subscription error:', err);
    });
  } catch (err) {
    console.warn('[FirebaseSync] Could not subscribe to cloud lessons:', err);
    return () => {};
  }
}
