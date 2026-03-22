import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@br/qlm': path.resolve(__dirname, 'src/lib/qlm/index.ts'),
    },
  },
  server: { port: 5173, host: true },
  preview: { port: 5173 },
})
