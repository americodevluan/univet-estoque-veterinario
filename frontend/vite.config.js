import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { copyFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      closeBundle() {
        // Copia index.html como 404.html para o host estático (Render)
        // servir o app em qualquer rota (ex.: /login, /produtos no refresh).
        const dist = path.resolve(__dirname, 'dist')
        copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'))
      },
    },
  ],
})
