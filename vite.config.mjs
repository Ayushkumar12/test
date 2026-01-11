import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'frontend',
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@emotion/react', '@emotion/styled', '@mui/material'],
  },
  server: {
    port: 3000,
    allowedHosts: ["https://test-fxv4.onrender.com", "https://test-tawny-delta-89.vercel.app"],
    proxy: {
      '/api': {
        target: 'https://test-tawny-delta-89.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
