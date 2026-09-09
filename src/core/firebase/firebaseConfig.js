/**
 * Firebase App, Firestore & Analytics Initialization
 * Configured according to user specifications.
 * Spec reference: docs/cefr-learning-planner-spec/08_P2P_CHAT_SIGNALING.md
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore for WebRTC Signaling & Room Discovery
export const db = getFirestore(app);

// Initialize Analytics if supported in browser environment
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('[Firebase] Analytics initialized successfully');
    }
  }).catch(e => {
    console.warn('[Firebase] Analytics check failed:', e);
  });
}
