// One-off: list docs in the production custom_lessons collection.
// Run: node --env-file=.env tests/cloud-list-docs.mjs
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(config);
const db = getFirestore(app);
const snap = await getDocs(collection(db, 'custom_lessons'));
console.log(`Total docs: ${snap.size}`);
snap.docs.forEach(d => {
  const data = d.data();
  console.log(`${d.id} | day=${data.day} | theme="${data.theme}" | by=${data.sharedBy} | synced=${data.cloudSyncedAt}`);
});
process.exit(0);
