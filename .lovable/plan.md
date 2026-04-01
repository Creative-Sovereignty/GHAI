

# Golden Hour AI — Project Knowledge (T=0)

## Overview
Golden Hour AI (goldenhourai.app) is a premium, AI-native filmmaking studio PWA. Users go from script to screen using integrated AI tools. Dark-mode-first Web3 aesthetic with gold/amber/deep-blue palette. Built with React 18 + TypeScript + Tailwind + shadcn/ui + Framer Motion. Backend powered by Lovable Cloud.

---

## Architecture

### Frontend Stack
- **Framework**: React 18, TypeScript, Vite, SWC
- **Styling**: Tailwind CSS with extensive custom CSS variables (Web3 Golden Hour tokens)
- **UI Library**: shadcn/ui components with custom glow/neon variants
- **Animation**: Framer Motion (page transitions, orbs, parallax, shimmer states)
- **Fonts**: Cinzel (headings), Inter (body), JetBrains Mono (code)
- **Icons**: Lucide React (thin stroke)
- **State**: React Query (TanStack Query) for server state, React Context for auth
- **Routing**: React Router v6 with lazy-loaded pages and `<Suspense>` fallback

### PWA
- `vite-plugin-pwa` with autoUpdate service worker
- Manifest: standalone display, custom icons (192, 512, maskable)
- Offline fallback page (`public/offline.html`)
- Runtime caching for API calls (NetworkFirst, 5min TTL)
- Install prompt handled in Dashboard with dismissible banner

### Backend (Lovable Cloud)
- **Auth**: Email/password with email verification, password reset flow
- **Database**: PostgreSQL with RLS on all user-facing tables
- **Storage**: `storyboard-images` (private, signed URLs), `avatars` (public), `thumbnails` (public)
- **Edge Functions**: 17 deployed functions (see Edge Functions section)

---

## Design System

### Color Palette (CSS Variables in `:root`)
- **Gold spectrum**: `--gold` (#d4940a), `--gold-light`, `--gold-bright`, `--gold-dark`, `--amber`
- **Blue spectrum**: `--deep-blue`, `--deep-blue-light`, `--deep-blue-bright`, `--electric-blue`, `--ice-blue`
- **Neon accents**: `--neon-green`, `--neon-yellow`, `--neon-orange`, plus pink/cyan/purple via HSL tokens
- **Web3 surfaces**: `--w3-void`, `--w3-deep`, `--w3-surface`, `--w3-card`, `--w3-border`
- **Glassmorphism**: `--glass-bg`, `--glass-border`, `--glass-blur`

### Key Animations
- `glow-pulse-gold`: 2s infinite gold shadow pulsing on buttons
- `text-gold-shimmer`: Animated gradient text effect
- Floating orbs with parallax scrolling on Landing page
- Neon glow sidebar navigation with `layoutId` active indicator

### Themes
- **Default (dark)**: Deep blue backgrounds with gold/amber accents
- **Light theme**: Monochrome dark variant (grays)
- Theme toggle in Settings page via `useTheme` hook

---

## Database Schema

### Core Tables (with RLS)
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profile data | id (=auth.users.id), display_name, bio, avatar_url, free_fest_used, trial_started_at |
| `projects` | Film projects | user_id, title, description, status (draft/in-progress/completed), thumbnail_url |
| `scripts` | Screenplay content | project_id (FK), content, last_ai_suggestion |
| `scenes` | Script scene breakdown | script_id (FK), scene_number, slugline, summary |
| `shots` | Shot list entries | project_id (FK, nullable), scene_id (FK), shot_code, shot_type, description, prompt, video_url, thumbnail_url, status, motion_intensity, sort_order |
| `videos` | Rendered video assets | project_id (FK), title, url, duration, status, metadata |

### Contest/Festival Tables
| Table | Purpose |
|-------|---------|
| `contest_entries` | Links shot_id + user_id + category, tracks votes count. shot_id is unique (one entry per shot). Categories: best_overall, best_cinematography, best_vfx, best_short, best_editing, best_art_direction |
| `contest_entries_public` | View exposing entry + shot + director info for public gallery display (no RLS) |
| `contest_votes` | Tracks individual votes per entry_id + user_id |
| `festival_votes` | Additional vote tracking with timestamp index for rate-limiting queries |

### Credits System
| Table | Purpose |
|-------|---------|
| `user_credits` | Balance per user_id (default 100) |
| `credit_transactions` | Audit log: action_type, amount, shot_id reference |

### Email System
| Table | Purpose |
|-------|---------|
| `email_send_log` | Delivery tracking |
| `email_send_state` | Queue configuration |
| `email_unsubscribe_tokens` | Unsubscribe management |
| `suppressed_emails` | Bounce/complaint suppression |
| `support_tickets` | Help desk tickets |

### Other Tables
| Table | Purpose |
|-------|---------|
| `notification_preferences` | Per-user notification settings (contest_votes, script_updates, render_complete) |
| `push_subscriptions` | Web push subscription storage (endpoint, p256dh, auth) |

### Key DB Functions
- `is_own_project(_project_id)` — ownership check for RLS
- `is_own_script(_script_id)` — ownership check for RLS
- `toggle_contest_vote(_entry_id)` — atomic vote toggle with count update
- `handle_new_user()` — creates profile with trial_started_at = now()
- `handle_new_user_credits()` — seeds 100 credits for new users
- `enqueue_email()` / `read_email_batch()` / `delete_email()` / `move_to_dlq()` — PGMQ email queue helpers

---

## Monetization Model

### Subscription Tiers (Stripe)
| Tier | Price | Product ID | Price ID |
|------|-------|------------|----------|
| Free | $0 | — | — |
| Pro | $29/mo | prod_UCioB4YN7q42vp | price_1TEJMZ7pm1sWSXu2cMZxcH3J |
| Studio | $79/mo | prod_UCio296kndLNzb | price_1TEJN07pm1sWSXu2GWmTPF5r |

### Festival Entry Fee
| Item | Price | Product ID | Price ID |
|------|-------|------------|----------|
| Festival Entry | $75 one-time | prod_UFlR9r5kPeww33 | price_1THFux7pm1sWSXu2v9gtVmIH |

### Flow
1. **Signup** starts a **30-day free trial** (all paywalls lifted via `trial_started_at`)
2. **First festival submission is free** (per user, lifetime — tracked by `free_fest_used` on profiles)
3. Subsequent festival entries cost **$75** (Stripe Checkout, one-time payment)
4. After trial ends, **paywalls return** — user stays on Free tier or upgrades to Pro/Studio
5. Winner prize: **10,000 tokens**
6. Canceling before the award ceremony = **forfeiture**

### Paywall Gating
- `PaywallGate` component checks subscription tier + trial status
- Trial users bypass all paywalls
- AI Scene Generator & AI Music: Pro or Studio
- Director AI: Studio only

---

## Pages & Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero with parallax logo, 7 AI tools grid, pricing (Starter/Pro/Studio), testimonials, floating orbs |
| `/auth` | Auth | Email/password login + signup, forgot password |
| `/reset-password` | ResetPassword | Password reset completion |
| `/install` | Install | PWA installation guide |
| `/faq` | FAQ | Frequently asked questions (includes festival categories docs) |
| `/help` | Help | Support/help center |
| `/learn` | Learn | Comprehensive searchable wiki covering all features |
| `/director` | DirectorAI | AI director chat with tool-use capabilities |

### Protected Routes (require auth)
| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | Dashboard | Hero banner, project CRUD, stats, Production Studio (ShotListTracker + VeoVideoEngine + UsageTracker) |
| `/script` | ScriptEditor | Three-panel screenplay editor with AI ghostwriter |
| `/storyboard` | Storyboard | Draggable visual scene grid |
| `/shots` | ShotList | Shot management with drag-and-drop reordering |
| `/editor` | VideoEditor | Timeline-based video editor with MP4 export |
| `/veo3` (also `/ai-studio`) | Veo3 | Dual-tab prompt-to-image (Gemini) and prompt-to-video (Luma) with style/aspect/duration controls |
| `/music` | AIMusic | AI music generation with mood/genre controls (ElevenLabs) |
| `/settings` | Settings | Profile editing, password change, theme toggle |
| `/analytics-docs` | AnalyticsDocs | Analytics documentation |
| `/festival` | FestivalGallery | Contest entries grid with voting, category filters, leaderboard, countdown, video lightbox |

---

## Edge Functions (17 deployed)

| Function | Purpose |
|----------|---------|
| `auth-email-hook` | Custom branded email templates (signup, recovery, magic-link, invite, email-change, reauthentication) |
| `check-subscription` | Verifies active Stripe subscription, returns tier + end date |
| `create-checkout` | Creates Stripe Checkout session for Pro/Studio subscriptions |
| `create-festival-entry` | Handles festival submissions: free first entry or $75 Stripe payment |
| `customer-portal` | Creates Stripe Customer Portal session for subscription management |
| `director-assist` | AI director with tools (update_script, generate_video_clip, set_music_mood) |
| `elevenlabs-music` | AI music generation via ElevenLabs API |
| `firecrawl-scrape` | Web scraping utility via Firecrawl |
| `helpdesk` | Streaming AI chat support with FAQ knowledge and ticket creation |
| `luma-video` | Video generation via Luma Dream Machine API |
| `process-email-queue` | Background email queue processor with retry logic (PGMQ) |
| `scene-generate` | AI scene image generation |
| `script-assist` | AI screenplay writing assistance |
| `send-notification` | Web push notification delivery |
| `storyboard-assist` | AI storyboard generation |
| `storyboard-image` | Image generation for storyboard frames |

---

## Key Components

### Layout
- `AppLayout` — Main app shell for protected pages
- `AppSidebar` — Collapsible sidebar with neon nav, mobile hamburger, logo
- `ChatWidget` — Global floating helpdesk chat (streaming)
- `ProtectedRoute` — Auth guard → /auth
- `ErrorBoundary` — React error boundary
- `ScrollToTop` — Scroll restoration on route change
- `PWAInstallBanner` — Dismissible PWA install prompt

### Production Components
- `ShotListTracker` — Database-backed shot management in Dashboard
- `VeoVideoEngine` — Video generation interface with clip management
- `DirectorsLog` — Event timeline for Director AI actions
- `UsageTracker` — Credit balance display
- `ExportModal` — Shot export with festival submission toggle, category picker, free/$75 badge
- `VideoLightbox` — Fullscreen cinematic video player with voting, sharing, keyboard nav (arrow keys)

### Script Components
- `GhostwriterPromptBuilder` — Structured AI prompt builder for screenplay writing
- `ContinuityTracker` — Narrative consistency checker

### Editor Components
- `TimelineClipItem`, `TimelineRuler`, `Playhead` — Timeline editor pieces
- `ClipToolbar`, `TransportControls`, `TrackHeader` — Editor controls
- `MusicLibraryPanel` — Music asset browser
- `ExportProgressModal` — Export progress tracking

### Paywall
- `PaywallGate` — Subscription + trial gate wrapper component

---

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth context (session, user, signOut) |
| `useProjects` | CRUD for projects table |
| `useShots` | CRUD for shots + scenes |
| `useScript` | Script CRUD |
| `useCredits` | Read user credit balance (default 100) |
| `useSubscription` | Stripe subscription state (tier, subscribed, startCheckout, openPortal) |
| `useFestivalEntry` | Festival entry state (freeEntryAvailable, isInTrial, submitEntry) |
| `useTheme` | Dark/light theme toggle |
| `usePageTracking` | Analytics page view tracking (GTM dataLayer) |
| `useIsMobile` | Responsive breakpoint detection |
| `useNotifications` | Push notification management |
| `useNotificationPreferences` | Notification preference CRUD |
| `useMusicLibrary` | Music asset management |
| `useTimelineExport` | Timeline MP4 export logic |

---

## Festival Gallery Feature

### Categories (defined in `src/lib/festivalCategories.ts`)
- Best Overall, Best Cinematography, Best VFX, Best Short, Best Editing, Best Art Direction

### Gallery Features
- Category filter pills with icons
- Sort modes: Trending, Recent, Top
- Search by director name or description
- Live countdown timer to ceremony
- Stats strip (Entries, Directors, Total Votes)
- Top 10 leaderboard sidebar
- Fullscreen video lightbox with:
  - Transport controls (play/pause, mute, fullscreen)
  - Integrated voting and sharing
  - Keyboard navigation (← → arrow keys) between entries
- 5 votes/day limit per user

### Submission Flow (via ExportModal)
1. User selects a shot and toggles "Submit to Festival"
2. Picks a category from dropdown
3. First submission is free (badge shown); subsequent ones cost $75
4. `create-festival-entry` edge function handles payment or free insertion
5. Entry appears in `contest_entries_public` view for gallery display

---

## Conventions
1. Uses `(supabase as any)` cast for tables not yet in generated types
2. Three neon accent colors (pink, cyan, purple) categorize nav items and status badges
3. Glass panel utilities: `.glass-panel-strong`, `.neo-card`
4. Gold shimmer: `.text-gold-shimmer` for animated gold gradient text
5. Shot status flow: null → "rendering" → "ready"
6. Credit system: Default 100 credits for new users
7. Analytics via GTM `dataLayer.push()` pattern
8. Stripe API version: `2025-08-27.basil`
9. Edge functions use `npm:@supabase/supabase-js@2.57.2` and `https://esm.sh/stripe@18.5.0`

