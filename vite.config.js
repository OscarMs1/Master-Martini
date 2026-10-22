import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: { '/api': 'http://127.0.0.1:3001' }
  },
  // Configuración de las pruebas de componentes con Vitest
  test: {
    environment: 'jsdom', // simula el navegador para poder probar componentes React
    globals: true,        // permite usar describe, it y expect sin importarlos
    setupFiles: ['src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/tests/**', 'src/main.jsx'],
      reporter: ['text', 'json-summary', 'html'],
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 }
    },
    include: ['src/**/*.test.jsx'] // solo busca tests dentro de src
  }
});
