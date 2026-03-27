import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Vercel serves 404.html for unknown paths on static deployments — same shell as index.html boots the SPA. */
function spaFallback404Plugin() {
  return {
    name: 'spa-fallback-404',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const indexHtml = path.join(dist, 'index.html')
      const notFound = path.join(dist, '404.html')
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFound)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000'

  return {
    plugins: [
      react(),
      spaFallback404Plugin(),
      /** Embeds SPA + API rewrites into `.vercel/output` so Vercel applies routes (plain `dist` + vercel.json is often ignored). */
      vercel({
        cleanUrls: false,
        trailingSlash: false,
        rewrites: [
          {
            source: '/api/(.*)',
            destination: 'https://marketplace-erp-bruno.onrender.com/api/$1',
          },
          // One catch-all after filesystem (see generated config); avoid per-route splats — plugin may add ?path= and break the router.
          { source: '/(.*)', destination: '/index.html' },
        ],
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
