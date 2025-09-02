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
    host: true, // Você já tinha esta linha, o que é ótimo!
    // Adicione a linha abaixo para permitir qualquer endereço do ngrok
    allowedHosts: ['.ngrok-free.app']
  },
  preview: {
    host: true
  }
})
