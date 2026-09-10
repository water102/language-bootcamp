import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import App from './App';
import './tailwind.css';
import { registerSW } from 'virtual:pwa-register';

// PWA auto-update: users who opened the app before this build keep running the
// old precached bundle until a new service worker takes over. When that
// happens on a page that was already controlled, reload once so everyone gets
// the latest code (including cloud lesson sync) on their next visit.
registerSW({ immediate: true });

if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

// The media/tool runtime is mounted once for the application lifetime.
createRoot(document.getElementById('root')).render(<Provider store={store}><HashRouter><App /></HashRouter></Provider>);
// Runtime listeners and active media are reset together on development updates.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
