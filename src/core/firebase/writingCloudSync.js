/**
 * Firebase Firestore Cloud Synchronization for Writing AI Results
 * Allows users to backup, share, and synchronize AI writing outlines, model essays,
 * and examiner feedback across all community members in real-time.
 */

import { db, firebaseConfig } from './firebaseConfig.js';
import { collection, doc, setDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { saveWritingAiResultLocal } from '@/core/storage/db.js';

const COLLECTION_NAME = 'writing_ai_results';

/**
 * Check if Firebase is realistically configured
 */
export function isFirebaseConfigured() {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'your_api_key_here' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'your_project_id'
  );
}

export function isCloudSyncEnabled() {
  return isFirebaseConfigured() && import.meta.env.VITE_DISABLE_CLOUD_SYNC !== '1';
}

export function getSharedByLabel() {
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
 * Save a writing AI result to Firestore cloud (shared with all users)
 * @param {Object} result
 * @returns {Promise<{ success: boolean, message: string, id?: string }>}
 */
export async function saveWritingAiResultToCloud(result) {
  if (!isCloudSyncEnabled()) {
    return {
      success: false,
      message: 'Firebase chưa được kích hoạt API Key. Kết quả vẫn được lưu an toàn tại máy của bạn (Local Storage).'
    };
  }

  try {
    const id = result.id || `w_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const payload = {
      ...result,
      id,
      sharedBy: result.sharedBy || getSharedByLabel(),
      cloudSyncedAt: new Date().toISOString()
    };

    await setDoc(doc(db, COLLECTION_NAME, id), payload, { merge: true });

    return {
      success: true,
      id,
      message: 'Đã đồng bộ lên Firebase Cloud — tất cả thành viên có thể xem phiên bản này!'
    };
  } catch (err) {
    console.warn('[FirebaseWritingSync] Failed to push writing result to cloud:', err);
    return {
      success: false,
      message: `Lỗi kết nối Firebase: ${err.message}. Dữ liệu vẫn được lưu tại thiết bị của bạn.`
    };
  }
}

/**
 * Fetch all writing AI results for a given topicId from Firestore cloud
 * @param {string} topicId
 * @returns {Promise<{ success: boolean, results: Array<Object>, message?: string }>}
 */
export async function fetchWritingAiResultsFromCloud(topicId) {
  if (!isCloudSyncEnabled() || !topicId) {
    return { success: false, results: [] };
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('topicId', '==', topicId));
    const snapshot = await getDocs(q);

    const results = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      results.push(data);
      // Auto cache locally for offline access
      saveWritingAiResultLocal(data).catch(() => {});
    });

    results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return {
      success: true,
      results
    };
  } catch (err) {
    console.warn('[FirebaseWritingSync] Failed to fetch writing results from cloud:', err);
    return { success: false, results: [], message: err.message };
  }
}

/**
 * Real-time subscription to community writing AI results for a given topic
 * @param {string} topicId
 * @param {Function} onUpdate - callback(results)
 * @returns {Function} unsubscribe function
 */
export function subscribeWritingAiResults(topicId, onUpdate) {
  if (!isCloudSyncEnabled() || !topicId) {
    return () => {};
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('topicId', '==', topicId));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const results = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          results.push(data);
          saveWritingAiResultLocal(data).catch(() => {});
        });
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (typeof onUpdate === 'function') {
          onUpdate(results);
        }
      },
      err => {
        console.warn('[FirebaseWritingSync] Snapshot error:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[FirebaseWritingSync] Error setting up snapshot listener:', err);
    return () => {};
  }
}
