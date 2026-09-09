/**
 * Firebase Firestore Cloud Synchronization for Custom AI Lessons
 * Allows users to backup, share, and synchronize custom curriculum lessons across devices.
 */

import { db, firebaseConfig } from './firebaseConfig.js';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

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
 * Save a custom AI lesson to Firestore cloud
 * @param {Object} lesson
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function saveCustomLessonToCloud(lesson) {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      message: 'Firebase chưa được cấu hình API Key thực trong .env. Dữ liệu vẫn được lưu an toàn tại máy của bạn (Local Storage).'
    };
  }

  try {
    const day = Number(lesson.day);
    const docRef = doc(db, COLLECTION_NAME, `day_${day}`);
    const payload = {
      ...lesson,
      cloudSyncedAt: new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
    return {
      success: true,
      message: `Đã đồng bộ thành công bài học Ngày ${day} lên Firebase Cloud!`
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
  if (!isFirebaseConfigured()) {
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
 * Fetch all available custom lessons stored on Firestore cloud
 * @returns {Promise<{ success: boolean, lessons: Object, message: string }>}
 */
export async function fetchAllCustomLessonsFromCloud() {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      lessons: {},
      message: 'Firebase chưa được cấu hình.'
    };
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const map = {};
    snapshot.forEach(d => {
      const data = d.data();
      if (data && data.day) {
        map[data.day] = data;
      }
    });
    return {
      success: true,
      lessons: map,
      message: `Đã tải ${Object.keys(map).length} bài học từ Firebase Cloud.`
    };
  } catch (err) {
    console.warn('[FirebaseSync] Failed to fetch all cloud lessons:', err);
    return {
      success: false,
      lessons: {},
      message: `Lỗi tải danh mục từ Firebase: ${err.message}`
    };
  }
}
