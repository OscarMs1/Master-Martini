import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: { '/api': 'http://127.0.0.1:3001' }
  },
  // Configuración de Vitest (reemplaza a Karma + Jasmine)
  test: {
    environment: 'jsdom', // simula el navegador para poder probar componentes React
    globals: true,        // permite usar describe, it y expect sin importarlos
    include: ['src/**/*.test.jsx'] // solo busca tests dentro de src
  }
});
