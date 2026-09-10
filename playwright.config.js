import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', channel: 'msedge' },
  webServer: {
    command: 'npm run dev -- --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    // Isolate e2e runs from the production Firestore collection: without this,
    // fresh test contexts pull real shared lessons (breaking clean-state
    // expectations) and test imports pollute the team's shared library.
    env: { ...process.env, VITE_DISABLE_CLOUD_SYNC: '1' },
  },
});
