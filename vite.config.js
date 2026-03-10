import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // 生产默认挂载在 /panel/，可通过 VITE_PUBLIC_BASE 覆盖
  const base = env.VITE_PUBLIC_BASE || (mode === 'production' ? '/panel/' : '/')

  return {
    base,
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        },
        '/healthz': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    }
  }
})
