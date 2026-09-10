// One-off cleanup: remove e2e test artifacts that were uploaded to the live
// custom_lessons collection during Playwright runs (they match the exact test
// lesson themes and the test execution window). Run:
//   node --env-file=.env tests/cloud-cleanup-test-docs.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Themes injected exclusively by tests/ai-lesson-import-flow.spec.js
const TEST_THEMES = new Set([
  'Bản 1: Lãnh Đạo & Hiện Diện',
  'Bản 2: Đàm Phán Chiến Lược',
  'Bản 9 Khối Toàn Diện',
  'Day 1 Comprehensive AI Masterclass'
]);

const app = initializeApp(config);
const db = getFirestore(app);
const snap = await getDocs(collection(db, 'custom_lessons'));

let deleted = 0;
for (const d of snap.docs) {
  const data = d.data();
  const isTestDoc = TEST_THEMES.has(data.theme) && String(d.id).startsWith('v_');
  if (isTestDoc) {
    await deleteDoc(doc(db, 'custom_lessons', d.id));
    console.log(`Deleted test doc: ${d.id} ("${data.theme}")`);
    deleted++;
  } else {
    console.log(`Kept: ${d.id} ("${data.theme}")`);
  }
}
console.log(`\nDone. Deleted ${deleted} test artifact doc(s).`);
process.exit(0);
