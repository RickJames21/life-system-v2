# External Integrations

**Analysis Date:** 2026-03-08

## APIs & External Services

**None.** This application makes no outbound API calls at runtime. All computation is local.

The "AI timeline generator" feature in `src/components/dashboard/ImportExport.tsx` is a static prompt template that the user manually copies to an external AI assistant — no API key, no HTTP request, no SDK.

## Data Storage

**Databases:**
- None. No server-side database.

**Browser Storage:**
- `localStorage` — sole persistence layer
  - Key: `ls_v3`
  - Contents: `birthDate`, `lifespan`, `mission`, `missionStartWeek`, `missionLog`, `timeItems`, `notes`, `moods`
  - Managed by: Zustand `persist` middleware in `src/store/useStore.ts`
  - Partialize: only config + data fields are persisted; UI state is ephemeral

**File Storage:**
- Local filesystem only (user's device), via browser File API
- Export: `Blob` + `URL.createObjectURL` → anchor download trigger in `src/components/dashboard/ImportExport.tsx`
- Import: `<input type="file">` + `FileReader.readAsText` in `src/components/dashboard/ImportExport.tsx`
- Supported formats: CSV, JSON (export and import), full backup JSON (export and restore)

**Caching:**
- None beyond browser's default HTTP cache for static assets

## Authentication & Identity

**Auth Provider:** None

There is no authentication, user accounts, or sessions. The app is a local-only personal tool — user identity is implicitly defined by the `birthDate` and `lifespan` values entered during onboarding.

## Monitoring & Observability

**Error Tracking:** None

**Logs:** None (no structured logging; development errors surface via browser DevTools console only)

**Analytics:** None

## CI/CD & Deployment

**Hosting:** Netlify (static site)

**Deploy Config:** `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
The redirect rule enables SPA routing — all paths serve `index.html`.

**CI Pipeline:** Not explicitly configured. Netlify auto-builds on git push to connected branch.

## External CDN Resources

**Google Fonts** — loaded via CDN link tag in `index.html`:
- URL: `https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500&family=JetBrains+Mono:wght@300;400&display=swap`
- This is the only outbound network request the app makes (aside from fetching its own static assets)
- No API key required; fonts are loaded in the browser at page load

## Environment Configuration

**Required env vars:** None. The application has no environment variables.

**`.env` files:** Not present and not needed.

**Secrets:** None. No credentials, API keys, or tokens exist anywhere in the codebase.

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## Clipboard API

`navigator.clipboard.writeText()` is used in `src/components/dashboard/ImportExport.tsx` to copy the AI prompt template to the user's clipboard. This is a browser permission-gated API — no external service involved.

---

*Integration audit: 2026-03-08*
