

# Launch Plan for Golden Hour AI

## Current State
Your app is already in good shape: PWA configured, authentication working, landing page with pricing tiers, protected routes for core features (Script Editor, Storyboard, Shot List, Video Editor, AI Music, Veo3), settings with profile management, FAQ, and Help pages. It's published at **gldhourai.lovable.app**.

## Pre-Launch Checklist

### 1. Connect a Custom Domain
- Go to **Project Settings → Domains** and connect your custom domain (e.g., `goldenhourai.com`)
- Requires a paid Lovable plan

### 2. Hide the Lovable Badge
- Go to **Project Settings** and toggle on **"Hide 'Lovable' Badge"**

### 3. Dark/Light Mode Toggle (pending from earlier)
- Add a theme toggle to the Settings page with CSS variable swapping between the current dark theme and a new light theme
- Store preference in `localStorage` and respect `prefers-color-scheme`

### 4. Final Polish Items
- **SEO**: Verify `robots.txt` allows crawling, add a `sitemap.xml`
- **Analytics**: Add a lightweight analytics solution (e.g., Plausible or Google Analytics via a script tag)
- **Error boundaries**: Wrap the app in a React error boundary for graceful crash handling
- **404 page**: Already exists — verify it matches branding
- **Favicon**: Already set — verify it renders correctly in browser tabs

### 5. Pre-Launch Testing
- Test the full auth flow: sign up → email verification → login → dashboard
- Test PWA install on iOS Safari and Android Chrome
- Test all protected routes load correctly when logged in
- Verify the landing page loads fast and looks good on mobile

### 6. Publish
- Click **Publish** and hit **Update** to push the latest frontend changes live

## Implementation Work (Code Changes)

The only code change needed before launch is the **Dark/Light mode toggle** you previously requested:

| File | Change |
|------|--------|
| `src/index.css` | Add `.light` theme CSS variables (light backgrounds, dark text, adjusted gold tones) |
| `src/hooks/useTheme.ts` | New hook: read/write theme preference to `localStorage`, toggle `.light` class on `<html>` |
| `src/pages/Settings.tsx` | Add a "Theme" section with a Dark/Light toggle switch |
| `src/components/AppLayout.tsx` | Initialize theme on mount via the hook |

Everything else is configuration in the Lovable UI (domain, badge, publish).

