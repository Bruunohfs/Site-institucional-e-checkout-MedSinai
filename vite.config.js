import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.app'],
    
    // --- ADICIONE APENAS ESTA LINHA ---
    origin: process.env.VERCEL_ENV === 'development' ? 'http://localhost:3000' : undefined,
    // ----------------------------------
  },
  preview: {
    host: true
  }
} )
