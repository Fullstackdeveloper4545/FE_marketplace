import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Same shell as index.html; Vercel static often ignores vercel.json rewrites — real files make /admin/* resolve. */
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

/**
 * Writes copies of the built index.html under paths that match React routes so static hosts
 * (Vercel with Output Directory = dist and no working rewrites) return 200 + the SPA shell.
 */
function spaShadowRoutesPlugin() {
  const routes = [
    ['admin'],
    ['admin', 'login'],
    ['admin', 'dashboard'],
    ['admin', 'orders'],
    ['admin', 'invoices'],
    ['admin', 'schedules'],
    ['admin', 'routing'],
    ['admin', 'products'],
    ['admin', 'categories'],
    ['admin', 'attributes'],
    ['admin', 'shopify'],
    ['admin', 'modules'],
    ['admin', 'shipping'],
    ['admin', 'reports', 'pending-orders'],
    ['cart'],
    ['checkout'],
    ['order', 'confirmation'],
  ]

  return {
    name: 'spa-shadow-routes',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const indexPath = path.join(dist, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const html = fs.readFileSync(indexPath)
      for (const segments of routes) {
        const dir = path.join(dist, ...segments)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), html)
      }
      // Extra root-level alias: some hosts map /admin → admin.html when cleanUrls is on.
      fs.writeFileSync(path.join(dist, 'admin.html'), html)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000'

  return {
    plugins: [react(), spaFallback404Plugin(), spaShadowRoutesPlugin()],
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
