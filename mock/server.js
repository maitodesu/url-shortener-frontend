// DEV-ONLY MOCK SERVER
// ---------------------
// This is a throwaway stand-in for the real Go backend
// (https://github.com/.../local-url-shortener), used ONLY to exercise the
// frontend's UI states locally when the real backend/database isn't
// reachable. It is never imported by, or bundled into, the production
// frontend build — `npm run build` only touches `src/`.
//
// It mimics the documented API contract:
//   POST /short  { url } -> 201 { code }  |  400/429/500 { error }
//   GET  /:code           -> 302 redirect |  404 { error }
//   GET  /ping            -> 200 "Status healthy!"
//
// Since a real per-IP token-bucket rate limiter and a real DB failure are
// hard to trigger on demand, this mock recognizes a few magic substrings in
// the submitted URL so every UI state can be exercised deterministically:
//   contains "trigger-400" -> simulates the backend's 400 (invalid input)
//   contains "trigger-429" -> simulates the backend's 429 (rate limited)
//   contains "trigger-500" -> simulates the backend's 500 (server error)
//   anything else          -> succeeds, after a short artificial delay
//                             (so the loading state is actually visible)

import express from 'express'
import cors from 'cors'

const PORT = process.env.MOCK_PORT ?? 8080
const app = express()

app.use(cors())
app.use(express.json())

// Malformed JSON bodies hit express.json()'s parser before our handler runs;
// this mirrors the real backend's 400 "invalid JSON" response.
app.use((err, _req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON is invalid' })
  }
  next(err)
})

const links = new Map()
let nextId = 1

function randomCode(length = 6) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

app.post('/short', async (req, res) => {
  const url = req.body?.url

  if (typeof url !== 'string' || url.trim() === '' || url.includes('trigger-400')) {
    return res.status(400).json({ error: 'Empty JSON brother' })
  }

  if (url.includes('trigger-429')) {
    return res.status(429).json({ error: 'yamete kudasai' })
  }

  if (url.includes('trigger-500')) {
    return res.status(500).json({ error: 'DB issue' })
  }

  // Small artificial delay so the loading spinner is actually visible.
  await new Promise((resolve) => setTimeout(resolve, 600))

  const code = randomCode()
  links.set(code, url)
  nextId += 1

  return res.status(201).json({ code })
})

app.get('/ping', (_req, res) => {
  res.type('text/plain').send('Status healthy!')
})

app.get('/:code', (req, res) => {
  const longUrl = links.get(req.params.code)
  if (!longUrl) {
    return res.status(404).json({ error: 'Link not found' })
  }
  return res.redirect(302, longUrl)
})

app.listen(PORT, () => {
  console.log(`[mock backend] listening on http://localhost:${PORT}`)
  console.log('[mock backend] this server is dev-only — see mock/server.js')
})
