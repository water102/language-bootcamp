import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import obfuscator from 'rollup-plugin-obfuscator';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico'],
        manifest: {
          name: 'English C1 Bootcamp — 120 Days / 12 Hours Master Learning Station',
          short_name: 'C1 Bootcamp',
          description: 'Lộ trình 120 ngày master C1 Cambridge, luyện nói, viết, phát âm IPA và flashcards SRS offline.',
          theme_color: '#0b0f19',
          background_color: '#0b0f19',
          display: 'standalone',
          icons: [
            {
              src: 'favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        }
      })
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    base: '/language-bootcamp/',
    server: { host: '0.0.0.0', port: 8080, strictPort: true },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: id => /node_modules[\\/](chart.js|react-chartjs-2)/.test(id) ? 'charts' : id.includes('node_modules') ? 'vendor' : undefined
        },
        plugins: isProd ? [
          obfuscator({
            global: true,
            options: {
              compact: true,
              controlFlowFlattening: false,
              deadCodeInjection: false,
              debugProtection: false,
              disableConsoleOutput: false,
              identifierNamesGenerator: 'hexadecimal',
              log: false,
              numbersToExpressions: true,
              renameGlobals: false,
              selfDefending: false,
              simplify: true,
              splitStrings: true,
              splitStringsChunkLength: 8,
              stringArray: true,
              stringArrayCallsTransform: true,
              stringArrayEncoding: ['base64'],
              stringArrayIndexShift: true,
              stringArrayRotate: true,
              stringArrayShuffle: true,
              stringArrayWrappersCount: 1,
              stringArrayThreshold: 0.75,
              transformObjectKeys: false,
              unicodeEscapeSequence: false
            }
          })
        ] : []
      }
    }
  };
});
