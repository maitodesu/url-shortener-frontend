import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Configurable at build time (VITE_BASE_PATH) so the same source can build
  // for different mount points -- e.g. '/shortlink/' behind Tailscale Funnel's
  // path-based routing, vs '/' when served at a domain's root (like a
  // Cloudflare quick tunnel).
  base: process.env.VITE_BASE_PATH ?? '/shortlink/',
  plugins: [react(), tailwindcss()],
})
