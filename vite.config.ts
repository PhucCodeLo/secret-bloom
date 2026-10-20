import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vendor libraries (react, framer-motion, html-to-image) are loaded from CDN
// via the importmap in index.html — this keeps the deployable bundle small
// enough for the Vercel file-upload path (same pattern as Night Camp).
const VENDOR_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  'framer-motion',
  'html-to-image',
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      external: VENDOR_EXTERNALS,
    },
  },
})
