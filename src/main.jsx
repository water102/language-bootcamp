import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router';
import { Provider } from 'react-redux';
import { store } from '@/store';
import App from './App';
import './tailwind.css';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

// The media/tool runtime is mounted once for the application lifetime.
createRoot(document.getElementById('root')).render(<Provider store={store}><HashRouter><App /></HashRouter></Provider>);
// Runtime listeners and active media are reset together on development updates.
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());
