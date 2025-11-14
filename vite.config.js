import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/n8n-frontend/', 
  plugins: [react()],
})
