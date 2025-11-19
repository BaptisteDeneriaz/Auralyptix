import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-htaccess',
      closeBundle() {
        // Copier .htaccess dans dist après le build
        try {
          copyFileSync(
            path.resolve(__dirname, 'public/.htaccess'),
            path.resolve(__dirname, 'dist/.htaccess')
          );
        } catch (err) {
          // Ignore si le fichier n'existe pas
        }
      }
    }
  ],
  server: {
    host: '127.0.0.1',
    port: 4173,
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 