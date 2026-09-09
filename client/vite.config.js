import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      // Admin uploads (images/videos) bhi server par hi rehte hain — inhe bhi proxy karo
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
