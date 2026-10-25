import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localApi from './dev/localApi.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApi()],
})
