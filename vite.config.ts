import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['@zip.js/zip.js', 'three'],
  },
  assetsInclude: ['**/*.wasm'],
});
