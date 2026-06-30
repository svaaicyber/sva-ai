import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl() 
  ],
  server: {
    host: '0.0.0.0', 
    port: 5173,
    strictPort: true,
    allowedHosts: true
    // 🚨 YAHAN SE JADOO (PROXY) HATA DIYA HAI! 
    // Ab request sidha live server pe jayegi.
  }
})