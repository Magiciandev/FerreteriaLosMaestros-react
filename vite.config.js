import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    // Direcciones de los servicios durante las pruebas (las pruebas usan un servidor simulado).
    env: {
      VITE_AUTH_API_URL: 'http://auth.test/api/v1',
      VITE_API_URL: 'http://api.test/api/v1'
    },
    // Las pruebas de la aplicación completa dibujan muchas páginas: se deja más margen que los 5 s
    // por defecto para que no fallen en equipos lentos.
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'node_modules/',
        'src/test/'
      ]
    }
  }
});