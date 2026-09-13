# Shortly — URL Shortener Frontend

A small, single-page frontend for a URL shortener: paste a long URL, get a
short link back. No accounts, no dashboards, no client-side routing — it's
one page that talks to one backend endpoint.

This is the frontend only. It's built against the API of a separate Go
backend (`local-url-shortener`), documented below.

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- No router, no state management library — plain React state is enough for
  one page.

## Running it locally

```bash
npm install
npm run dev
```

This starts the Vite dev server (default `http://localhost:5173`). By
default the app points at `http://localhost:8080` for its API calls — see
[API base URL configuration](#api-base-url-configuration) below for how to
change that.

### Running against the mock backend

The real backend needs a Postgres + Redis connection this repo doesn't have
credentials for. For local UI development and testing, a tiny **dev-only**
mock server lives in `mock/server.js` and mimics the real API contract
(including success, 400, 429, and 500 responses).

Run the frontend and the mock backend together:

```bash
npm run dev:mock
```

Or run them separately in two terminals:

```bash
npm run mock   # mock API on http://localhost:8080
npm run dev    # Vite dev server on http://localhost:5173
```

The mock recognizes a few magic substrings in the submitted URL so every
error state can be triggered on demand:

| Substring in the URL | Response                          |
| --------------------- | ---------------------------------- |
| `trigger-400`         | 400 — invalid/empty URL            |
| `trigger-429`         | 429 — rate limited                 |
| `trigger-500`         | 500 — server error                 |
| anything else         | 201 success (after a short delay)  |

`mock/` is never imported by, or bundled into, the production build —
`npm run build` only touches `src/`.

## API base URL configuration

The frontend calls a single backend, configured via the `VITE_API_BASE_URL`
environment variable (no trailing slash). It defaults to
`http://localhost:8080` if unset, so local dev works out of the box against
either the mock server or a locally-running instance of the real backend.

To point at a different backend (e.g. once it's deployed), copy `.env.example`
to `.env` (or `.env.local`) and set the value:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=https://your-deployed-backend.example.com
```

Vite only reads `VITE_`-prefixed variables at build time, so changing this
requires restarting `npm run dev` (or rebuilding for production).

## Backend API contract

- `POST /short` — body `{"url": "..."}` → `201 {"code": "abc123"}`, or
  `400/429/500 {"error": "..."}`.
- `GET /{code}` — 302-redirects to the original URL, or 404 if not found.
  The frontend never renders this route itself; it just builds and displays
  `<API base URL>/<code>` as the shareable short link after a successful
  `POST /short`.
- `GET /ping` — health check.

The frontend translates every error status into a plain-language message and
never shows raw backend error strings to the user.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Set `VITE_API_BASE_URL` in the build environment (or
in a `.env.production` file) before building if it needs to differ from the
default.

```bash
npm run preview   # serve the production build locally to sanity-check it
```
