import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/utils/productos.js',
        'src/utils/validaciones.js',
        'src/services/productos.js',
        'src/services/autenticacion.js',
        'src/data/coleccion.js',
        'src/hooks/useFormulario.js',
        'src/components/TarjetaProducto.jsx',
        'src/components/GrillaProductos.jsx',
        'src/components/Header.jsx',
        'src/components/CampoFormulario.jsx',
        'src/components/RutaProtegida.jsx',
        'src/pages/Login.jsx',
        'src/pages/Productos.jsx',
        'src/App.jsx'
      ],
      exclude: [
        'node_modules/',
        'src/test/'
      ]
    }
  }
});