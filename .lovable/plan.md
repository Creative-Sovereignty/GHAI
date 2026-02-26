

## Plan: Ship Golden Hour AI as a PWA

### Overview
Turn the existing Golden Hour AI web app into a fully installable Progressive Web App (PWA) so users can add it to their home screen on any device.

### Steps

**1. Install `vite-plugin-pwa`**
- Add `vite-plugin-pwa` as a dev dependency.

**2. Configure PWA plugin in `vite.config.ts`**
- Import and add `VitePWA()` to the plugins array with:
  - `registerType: 'autoUpdate'` for seamless service worker updates
  - A `manifest` object containing app name ("Golden Hour AI"), short name, description, theme color (dark/gold), background color, display mode (`standalone`), start URL `/`, and icon definitions
  - `navigateFallbackDenylist: [/^\/~oauth/]` to prevent caching OAuth redirects
  - Workbox runtime caching strategies for API calls and assets

**3. Create PWA icons in `public/`**
- Generate and place the following icon files:
  - `pwa-192x192.png` (192×192)
  - `pwa-512x512.png` (512×512)
  - `pwa-maskable-512x512.png` (512×512, maskable, with safe-zone padding)
- Use the Golden Hour AI branding (gold on dark background).

**4. Update `index.html` with mobile meta tags**
- Add `<meta name="theme-color" content="#1a1a2e">` (or matching dark brand color)
- Add `<link rel="apple-touch-icon" href="/pwa-192x192.png">`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

**5. Create an `/install` page**
- New page at `src/pages/Install.tsx` with:
  - Instructions for installing on iOS (Share → Add to Home Screen) and Android (browser menu)
  - A "Install App" button that triggers the native `beforeinstallprompt` event on supported browsers
  - Fallback guidance when the prompt isn't available
- Add route in `App.tsx` (public, no auth required)

**6. Add install prompt / banner to Dashboard**
- Optionally show a dismissible banner on the Dashboard prompting users to install the app, linking to `/install`.

### File Changes Summary

| File | Action |
|------|--------|
| `package.json` | Add `vite-plugin-pwa` dev dependency |
| `vite.config.ts` | Configure `VitePWA` plugin with manifest and workbox settings |
| `public/pwa-192x192.png` | Create branded icon |
| `public/pwa-512x512.png` | Create branded icon |
| `public/pwa-maskable-512x512.png` | Create maskable icon |
| `index.html` | Add mobile/PWA meta tags |
| `src/pages/Install.tsx` | New install instructions page |
| `src/App.tsx` | Add `/install` route |

