

# Pre-Launch Bug Fix Plan

After reviewing the codebase, here are the bugs and issues to fix:

## Bugs Found

### 1. Chat Widget overlaps Scroll-to-Top button on Learn page
Both the chat widget FAB and the scroll-to-top button are positioned at `fixed bottom-6 right-6`. They will overlap each other when both are visible. The scroll-to-top button should be positioned to avoid the chat widget.

**Fix**: Move the scroll-to-top button to `bottom-6 right-24` (or `bottom-20 right-6`) so it doesn't collide with the chat FAB.

### 2. "Open" button on project cards does nothing
The "Open" button on each project card in the Dashboard has no `onClick` handler or navigation — it's a dead button. Users will click it expecting to open their project.

**Fix**: Either link it to a relevant page (e.g., `/script`) or add an `onClick` with a toast saying "Coming soon" to set expectations.

### 3. Sidebar not responsive on mobile
The sidebar is a fixed-width sticky element with no mobile handling. On small screens it takes significant space and has no hamburger/drawer behavior. The `use-mobile.tsx` hook exists but isn't used by the sidebar.

**Fix**: Hide the sidebar on mobile and show a hamburger menu, or use a sheet/drawer pattern for mobile navigation.

### 4. NotFound page uses `<a href="/">` instead of React Router `<Link>`
This causes a full page reload instead of client-side navigation.

**Fix**: Replace with `<Link to="/">` from react-router-dom.

### 5. Missing `manifest.json` / `manifest.webmanifest` for PWA
The app has PWA icons, an install page, and `beforeinstallprompt` handling, but there's no web manifest file referenced in `index.html`. Without it, the PWA install prompt will never fire.

**Fix**: Add a `manifest.webmanifest` with the app name, icons, theme color, and display mode, then link it in `index.html`.

### 6. `firecrawl-scrape` edge function missing from `config.toml`
The function exists and is used by the Learn page, but it's not listed in `supabase/config.toml`, meaning it uses the default `verify_jwt = true`. This is fine for authenticated users, but it's inconsistent with the other functions. No action needed unless you want public access.

## Implementation Order

1. Fix chat/scroll-to-top button overlap (Learn.tsx)
2. Fix dead "Open" button on project cards (Dashboard.tsx)
3. Fix NotFound page navigation (NotFound.tsx)
4. Add PWA manifest and link in index.html
5. Add basic mobile sidebar responsiveness (AppSidebar.tsx + AppLayout.tsx)

## Technical Details

- **File changes**: `src/pages/Learn.tsx`, `src/pages/Dashboard.tsx`, `src/pages/NotFound.tsx`, `index.html`, `public/manifest.webmanifest`, `src/components/AppSidebar.tsx`, `src/components/AppLayout.tsx`
- No database changes needed
- No new dependencies needed

