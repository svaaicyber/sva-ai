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
    allowedHosts: true,
    // 🚨 YEH JADOO HAI: Frontend ki /api calls ko chupke se backend pe bhej dega
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false // Yeh Mixed Content error ko bypass kar dega
      }
    }
  }
})