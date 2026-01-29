# Progressive Web App (PWA) Implementation – GurukulamHub

This document describes how the Progressive Web App (PWA) is implemented in GurukulamHub. It does not cover push notifications; those are documented separately if needed.

---

## 1. What is a PWA?

A **Progressive Web App** is a web application that can be installed on a user’s device and offers app-like behavior:

- **Installable** – Users can add it to the home screen (mobile) or install it (desktop).
- **Offline support** – A service worker caches assets and can show an offline page when there is no network.
- **App shell** – The app can load from cache first, then fetch data when online.

In this project, the PWA is implemented using the **@ducanh2912/next-pwa** plugin with Workbox.

---

## 2. Implementation Overview

| Area | Implementation |
|------|----------------|
| **Package** | `@ducanh2912/next-pwa` (v10.2.9) |
| **Manifest** | `public/manifest.json` + auth-gated API `/api/manifest` |
| **Service worker** | Generated as `public/sw.js` by the plugin |
| **Offline page** | `public/offline.html` |
| **Install control** | Only logged-in users can install (via manifest API + `PWARegistration.jsx`) |
| **Icons** | `public/icons/icon-192x192.png`, `public/icons/icon-512x512.png` |

---

## 3. Flow Overview

The following flows show how the PWA works end-to-end. Use them to understand when the app becomes installable and how offline is handled.

### 3.1 High-Level PWA Flow (Page Load)

When a user opens the app, the browser loads the page, fetches the manifest, and may register the service worker. The sequence in steps:

1. User visits the site (e.g. `https://yoursite.com/en`).
2. Next.js serves the page; the layout includes `manifest: '/api/manifest'`.
3. The browser requests `GET /api/manifest` (with cookies/session).
4. The manifest API checks auth and returns either the full manifest (logged in) or a minimal, non-installable one (guest).
5. The PWA plugin registers the service worker (`sw.js`) in the background.
6. If the manifest was full, the browser may show “Install” or “Add to Home Screen”; if minimal, it does not.

---

### 3.2 Manifest & Install Decision Flow

This flow shows how we decide whether the app is installable. Only logged-in users get the real manifest and install option. In steps:

1. The browser calls `GET /api/manifest` (e.g. from the `<link rel="manifest" href="/api/manifest">` in the layout).
2. **Manifest API** (`src/app/api/manifest/route.js`):
   - If the user is **not** logged in → respond with `display: "browser"` and `icons: []` → **not installable**.
   - If the user **is** logged in → respond with the full `public/manifest.json` → **installable**.
3. **PWARegistration.jsx** (client-side):
   - If logged in: allow `beforeinstallprompt`, store it for a custom “Install” button, and set `apple-mobile-web-app-capable` to `yes` on iOS.
   - If not logged in: suppress the install prompt and set `apple-mobile-web-app-capable` to `no` when possible.

Result: **Only authenticated users see the app as installable and get the install UI.**

---

### 3.3 Offline & Service Worker Flow

When the user has no network and navigates or refreshes, the service worker decides between cache and the offline page. In steps:

1. User goes to a URL or refreshes.
2. The service worker (`sw.js`) handles the request (it was registered on first load).
3. **If online:**  
   - The worker uses NetworkFirst (or similar) for pages: try network, then cache.  
   - Static assets (JS, CSS, images) use CacheFirst when they match the configured patterns.
4. **If offline:**  
   - If the response is in the cache → the worker serves it.  
   - If it’s a document (page) and the network fails → the worker serves the **fallback document** `/offline.html`.  
5. The user sees either the cached page or the “You’re Offline” screen with a Retry button.

**Relevant config:** `fallbacks: { document: '/offline.html' }` in `next.config.mjs` sets this fallback.

---

### 3.4 Middleware & PWA Routes Flow

Requests to PWA assets (manifest, service worker, offline page, icons) must not be rewritten or redirected by auth/locale middleware. In steps:

1. Every request hits `src/middleware.js` first (according to the matcher).
2. If the path is one of **PWA/static** (`/api/*`, `/manifest.json`, `/sw.js`, `/offline.html`, `/icons/*`, `/workbox-*`, `/fallback-*`, `/_next/static/*`, etc.) → middleware returns `NextResponse.next()` and does **no** auth or locale redirect.
3. For other app routes (e.g. `/en/home`), middleware runs auth and locale logic, then redirects or continues.

That way, **manifest, service worker, and offline page always load correctly**, even for guests.

---

### 3.5 One-Page Summary

| What happens        | Who is involved                         | Result                          |
|---------------------|------------------------------------------|---------------------------------|
| User opens site     | Layout, browser, `/api/manifest`, SW     | Page loads; manifest fetched    |
| Guest vs logged-in   | `/api/manifest` + `PWARegistration.jsx`  | Install only when logged in     |
| User goes offline    | Service worker, Workbox, cache           | Cached content or offline page  |
| Request to SW/manifest | Middleware                              | Skipped; no auth redirect       |

---

## 4. Step-by-Step Implementation

### 4.1 Package and Next.js config

**File:** `package.json`  
- Dependency: `"@ducanh2912/next-pwa": "^10.2.9"`

**File:** `next.config.mjs`  
- Import: `import withPWA from '@ducanh2912/next-pwa'`
- The final export is `pwaConfig(nextConfig)`, i.e. the Next.js config is wrapped with `withPWA()`.

**PWA options used:**

```javascript
const pwaConfig = withPWA({
  dest: 'public',              // Service worker and Workbox files go to public/
  disable: false,              // PWA is enabled
  register: true,               // Plugin registers the service worker
  skipWaiting: true,           // New SW takes over as soon as it’s ready
  sw: 'sw.js',                 // Service worker file name
  publicExcludes: ['!noprecache/**/*', '**/*.map'],
  buildExcludes: [/middleware-manifest\.json$/, /\.map$/],
  fallbacks: {
    document: '/offline.html'  // Shown when user is offline and navigates
  },
  workboxOptions: { ... }      // Caching and runtime behavior (see below)
})

export default pwaConfig(nextConfig)
```

---

### 4.2 Web App Manifest

**File:** `public/manifest.json`

Defines install metadata:

- **name** / **short_name** – “GurukulamHub - Indian Knowledge Systems” / “GurukulamHub”
- **description** – Same as name
- **start_url** – `"/"`
- **display** – `"standalone"`
- **background_color** – `"#ffffff"`
- **theme_color** – `"#000000"`
- **orientation** – `"portrait-primary"`
- **icons** – 192×192 and 512×512 PNGs under `/icons/`
- **categories** – `["education", "learning"]`
- **screenshots** – Optional, for store-like listings
- **id** – `"/"`

**Auth-gated manifest API:**  
The app does not serve ` manifest.json` directly for install checks. It uses:

**File:** `src/app/api/manifest/route.js`

- **GET /api/manifest**
  - If the user is **not** logged in: returns a minimal JSON with `display: "browser"` and `icons: []`, so the app is not considered installable.
  - If the user **is** logged in: reads `public/manifest.json` and returns it with:
    - `Content-Type: application/manifest+json`
    - `Cache-Control: no-store, no-cache, must-revalidate`

This makes “Add to Home Screen” / “Install app” only available for authenticated users.

---

### 4.3 Layout and Metadata (Manifest Link)

**File:** `src/app/[lang]/layout.jsx`

Metadata used for PWA and install:

```javascript
export const metadata = {
  title: 'GurukulamHub - Indian Knowledge Systems',
  description: 'GurukulamHub - Indian Knowledge Systems',
  manifest: '/api/manifest',   // Auth-gated manifest URL
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GurukulamHub'
  },
  formatDetection: { telephone: false },
  // ... openGraph etc.
}
```

So the root layout points the manifest link to `/api/manifest`, and sets theme color and Apple web app behavior. No push-related config is in this file.

---

### 4.4 Service Worker and Workbox

The plugin generates:

- **public/sw.js** – Main service worker
- **public/workbox-*.js** – Workbox runtime (name can include a hash)

These are produced at build time; they are in `.gitignore` because they are build artifacts.

**Workbox options in `next.config.mjs`:**

- **dest** – `'public'`
- **fallbacks.document** – `'/offline.html'`
- **mode** – `'development'` or `'production'` based on `NODE_ENV`
- **additionalManifestEntries** – Adds `/offline.html` with a revision hash (e.g. from file content) so cache updates when the offline page changes.
- **runtimeCaching** (conceptually):
  - Google Fonts – CacheFirst, long-lived
  - Static images (png, jpg, jpeg, svg, gif, webp, ico) – CacheFirst
  - `/_next/static/*` – CacheFirst
  - `/_next/image*` – CacheFirst
  - Document requests – NetworkFirst with short timeout
  - Other URLs – NetworkFirst with short timeout

Exact patterns and cache names are in `next.config.mjs` under `workboxOptions.runtimeCaching`.

**Source maps:**  
`publicExcludes` and `buildExcludes` keep `*.map` out of the PWA build so source map changes don’t trigger unnecessary service worker updates. A script under `scripts/` can remove source maps from generated SW files if needed (e.g. `scripts/remove-sourcemap.js`).

---

### 4.5 Offline Page

**File:** `public/offline.html`

- Shown when the user is offline and the service worker uses the document fallback.
- Contains a short “You’re Offline” message and a “Retry” button that calls `window.location.reload()`.
- Includes inline CSS and a small script to respect theme (e.g. `data-theme` / `prefers-color-scheme`).

This file is referenced in `fallbacks.document` and in `additionalManifestEntries` in the PWA config.

---

### 4.6 Install Prompt and iOS Behavior (PWARegistration)

**File:** `src/components/PWARegistration.jsx`  
**Usage:** Rendered inside `src/components/Providers.jsx` (no UI; runs logic only).

**Behavior:**

- Uses session (e.g. NextAuth) to know if the user is logged in.
- **If authenticated:**
  - Listens for `beforeinstallprompt`, calls `preventDefault()`, stores the event (e.g. in state and on `window.deferredInstallPrompt`) so a custom “Install” button can call `prompt()` later.
  - Ensures the page has `<meta name="apple-mobile-web-app-capable" content="yes">` for iOS.
  - Listens for `controllerchange` to detect service worker updates.
- **If not authenticated:**
  - Prevents the install prompt from showing and does not store it.
  - Sets `apple-mobile-web-app-capable` to `"no"` when the meta tag exists, to reduce install affordances on iOS.

So install is intentionally limited to logged-in users, in line with the manifest API.

---

### 4.7 Middleware and PWA Routes

**File:** `src/middleware.js`

To avoid redirecting or breaking PWA assets, the middleware skips handling for:

- `/api/*` (includes `/api/manifest`)
- `/manifest.json`
- `/sw.js`
- `/offline.html`
- `/icons/*`
- `/workbox-*`, `/fallback-*`
- `/_next/static/*`, `/_next/image/*`, etc.
- Static extensions (e.g. `.ico`, `.png`, `.js`, `.css`, …)

The matcher is set so these paths are excluded from the main auth/locale middleware. That keeps the manifest, service worker, and offline page serving correctly.

---

### 4.8 Icons and Static Assets

**Directory:** `public/icons/`

- **icon-192x192.png** – 192×192 px  
- **icon-512x512.png** – 512×512 px  

These paths are specified in `public/manifest.json`. The manifest may also reference screenshots under `public/images/`; those files must exist if you use them.

---

## 5. Files Involved (PWA Only)

| File or path | Role |
|--------------|------|
| `package.json` | Depends on `@ducanh2912/next-pwa` |
| `next.config.mjs` | `withPWA()`, Workbox options, fallbacks, runtime caching |
| `public/manifest.json` | Canonical manifest (used by `/api/manifest` when user is logged in) |
| `src/app/api/manifest/route.js` | Auth-gated manifest API |
| `src/app/[lang]/layout.jsx` | Metadata: `manifest`, `themeColor`, `appleWebApp` |
| `src/components/PWARegistration.jsx` | Install prompt and iOS meta tag based on auth |
| `src/components/Providers.jsx` | Renders `PWARegistration` |
| `src/middleware.js` | Skips PWA/static routes so they are not rewritten or redirected |
| `public/offline.html` | Offline fallback page |
| `public/icons/icon-192x192.png`, `icon-512x512.png` | PWA icons |
| `public/sw.js`, `public/workbox-*.js` | Generated at build (not in repo) |
| `scripts/remove-sourcemap.js` | Optional; removes source maps from generated SW files |

Push notification components, APIs, and handlers are not part of this list and are not described in this document.

---

## 6. Configuration Summary

- **Plugin:** `@ducanh2912/next-pwa` in `next.config.mjs`
- **Manifest URL in HTML:** `/api/manifest` (dynamic; depends on auth)
- **Service worker:** Generated as `public/sw.js`, scope is the app origin (and basePath if set).
- **Offline:** `fallbacks.document: '/offline.html'`
- **Install:** Only when the user is logged in (enforced by `/api/manifest` and `PWARegistration.jsx`).

---

## 7. Things to Watch When Maintaining the PWA

1. **Manifest URL**  
   Browsers and audits often expect a “manifest” URL. Ours is `/api/manifest`, not `/manifest.json`. In DevTools (e.g. Application → Manifest), the reported URL should be the one that returns the full manifest when the user is logged in.

2. **Caching of /api/manifest**  
   The route sends `Cache-Control: no-store, no-cache, must-revalidate`. If you put a CDN or proxy in front, ensure it does not cache `/api/manifest`.

3. **basePath**  
   If `basePath` (e.g. `process.env.BASEPATH`) is set in `next.config.mjs`, all PWA URLs (manifest, SW, icons, offline) are under that path. Verify install and offline behavior when the app is served from a subpath.

4. **Service worker scope**  
   The SW is at `public/sw.js`. Its scope is the origin (and basePath). Avoid changing the SW URL or scope without updating the plugin config and any docs.

5. **iOS “Add to Home Screen”**  
   iOS does not support `beforeinstallprompt`. Install is offered via “Add to Home Screen” and depends on manifest and meta tags. Restricting install for guests is done via the non-installable manifest and `apple-mobile-web-app-capable`; the latter only mitigates how “app-like” the experience is for guests.

6. **skipWaiting**  
   With `skipWaiting: true`, a new service worker can replace the current one as soon as it’s installed, which might affect open tabs. If you see odd behavior after deployments, consider prompting the user to reload or controlling when the waiting worker calls `skipWaiting()`.

7. **Development vs production**  
   Workbox is run in `development` or `production` mode based on `NODE_ENV`. Caching behavior can differ; if something works in one environment but not the other, check Workbox logs and cache names.

8. **Offline page and basePath**  
   If you use basePath, any links or assets in `offline.html` should use paths that account for it (or relative URLs that still resolve correctly).

---

## 8. Verification Checklist (PWA Only)

- [ ] `@ducanh2912/next-pwa` is installed and the Next.js config is wrapped with `withPWA()`.
- [ ] `public/manifest.json` exists and has correct `name`, `short_name`, `start_url`, `display`, and `icons`.
- [ ] `/api/manifest` returns the full manifest when logged in and a non-installable one when not.
- [ ] Root layout sets `manifest: '/api/manifest'`, `themeColor`, and `appleWebApp`.
- [ ] `public/sw.js` (and workbox file) are generated on build.
- [ ] `public/offline.html` exists and is set in `fallbacks.document`.
- [ ] `public/icons/icon-192x192.png` and `icon-512x512.png` exist and match the manifest.
- [ ] `PWARegistration` is rendered (e.g. inside `Providers`) and gates install on auth.
- [ ] Middleware does not apply auth/redirect logic to `/api/`, `/sw.js`, `/offline.html`, `/icons/`, `/workbox-*`, `/fallback-*`, or static assets.
- [ ] In a supported browser, when logged in, the app is installable and shows the correct name/icons; when logged out, it does not meet install criteria (or behaves as intended for guests).

---

*This document describes only the PWA implementation (install, manifest, service worker, offline). Push notifications are out of scope and are not included here.*
