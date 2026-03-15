# Golden Hour AI — Project Knowledge (T=0)

## Overview
Golden Hour AI (goldenhourai.app) is a premium, AI-native filmmaking studio PWA. Users go from script to screen using integrated AI tools. Dark-mode-first Web3 aesthetic with gold/amber/deep-blue palette. Built with React 18 + TypeScript + Tailwind + shadcn/ui + Framer Motion. Backend powered by Lovable Cloud.

---

## Architecture

### Frontend Stack
- **Framework**: React 18, TypeScript, Vite, SWC
- **Styling**: Tailwind CSS with extensive custom CSS variables in `index.css` (Web3 Golden Hour tokens)
- **UI Library**: shadcn/ui components with custom glow/neon variants
- **Animation**: Framer Motion throughout (page transitions, orbs, parallax, shimmer states)
- **Fonts**: Cinzel (headings), Inter (body), JetBrains Mono (code)
- **Icons**: Lucide React (thin stroke)
- **State**: React Query (TanStack Query) for server state, React Context for auth
- **Routing**: React Router v6 with lazy-loaded pages and `<Suspense>` fallback

### PWA
- Configured via `vite-plugin-pwa` with autoUpdate service worker
- Manifest: standalone display, custom icons (192, 512, maskable)
- Offline fallback page (`public/offline.html`)
- Runtime caching for API calls (NetworkFirst, 5min TTL)
- Install prompt handled in Dashboard with dismissible banner

### Backend (Lovable Cloud)
- **Auth**: Email/password with email verification, password reset flow
- **Database**: PostgreSQL with RLS on all user-facing tables
- **Storage**: `storyboard-images` bucket (private, folder-based owner RLS, signed URLs)
- **Edge Functions**: 7 deployed functions (see Edge Functions section)

---

## Design System

### Color Palette (CSS Variables in `:root`)
- **Gold spectrum**: `--gold` (#d4940a), `--gold-light`, `--gold-bright`, `--gold-dark`, `--amber`
- **Blue spectrum**: `--deep-blue`, `--deep-blue-light`, `--deep-blue-bright`, `--electric-blue`, `--ice-blue`
- **Neon accents**: `--neon-green`, `--neon-yellow`, `--neon-orange`, plus pink/cyan/purple via HSL tokens
- **Web3 surfaces**: `--w3-void`, `--w3-deep`, `--w3-surface`, `--w3-card`, `--w3-border`
- **Glassmorphism**: `--glass-bg`, `--glass-border`, `--glass-blur`
- **Alpha channels**: 30/10/05 opacity variants for gold, amber, blue, purple

### Key Animations
- `glow-pulse-gold`: 2s infinite gold shadow pulsing on buttons
- `text-gold-shimmer`: Animated gradient text effect
- Floating orbs with parallax scrolling on Landing page
- Neon glow sidebar navigation with `layoutId` active indicator

### Themes
- **Default (dark)**: Deep blue backgrounds with gold/amber accents
- **Light theme**: Monochrome dark variant (grays), not a true light theme
- Theme toggle in Settings page via `useTheme` hook

---

## Database Schema

### Core Tables (with RLS)
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profile data | id (=auth.users.id), display_name, bio, avatar_url |
| `projects` | Film projects | user_id, title, description, status (draft/in-progress/completed), thumbnail_url |
| `scripts` | Screenplay content | project_id (FK), content, last_ai_suggestion |
| `scenes` | Script scene breakdown | script_id (FK), scene_number, slugline, summary |
| `shots` | Shot list entries | project_id (FK, nullable), scene_id (FK), shot_code, shot_type, description, prompt, video_url, thumbnail_url, status, motion_intensity, sort_order |
| `videos` | Rendered video assets | project_id (FK), title, url, duration, status, metadata |

### Contest/Festival Tables
| Table | Purpose |
|-------|---------|
| `contest_entries` | Links shot_id + user_id, tracks votes count. shot_id is unique (one entry per shot) |
| `contest_votes` | Tracks individual votes per entry_id + user_id |

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

### Key DB Functions
- `is_own_project(_project_id)` — ownership check for RLS
- `is_own_script(_script_id)` — ownership check for RLS
- `toggle_contest_vote(_entry_id)` — atomic vote toggle

---

## Pages & Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero with parallax logo, features grid, pricing (Starter/Pro/Studio), testimonials, floating orbs |
| `/auth` | Auth | Email/password login + signup, forgot password, redirects authenticated users to /dashboard |
| `/reset-password` | ResetPassword | Password reset completion |
| `/install` | Install | PWA installation guide |
| `/faq` | FAQ | Frequently asked questions |
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
| `/editor` | VideoEditor | Timeline-based video editor |
| `/veo3` | Veo3 | Prompt-to-video with style/aspect/duration controls |
| `/music` | AIMusic | AI music generation with mood/genre controls |
| `/settings` | Settings | Profile editing, password change, theme toggle |
| `/analytics-docs` | AnalyticsDocs | Analytics documentation |
| `/festival` | FestivalGallery | Contest entries grid with voting and badges |

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `helpdesk` | Streaming AI chat support with FAQ knowledge and ticket creation |
| `director-assist` | AI director with tools (update_script, generate_video_clip, set_music_mood) |
| `script-assist` | AI screenplay writing assistance |
| `storyboard-assist` | AI storyboard generation |
| `storyboard-image` | Image generation for storyboard frames |
| `firecrawl-scrape` | Web scraping utility |
| `auth-email-hook` | Custom branded email templates (signup, recovery, magic-link, invite) |
| `process-email-queue` | Background email queue processor with retry logic |

---

## Key Components

### Layout
- `AppLayout` — Main app shell for protected pages
- `AppSidebar` — Collapsible sidebar with neon nav, mobile hamburger, logo
- `ChatWidget` — Global floating helpdesk chat (streaming from helpdesk edge function)
- `ProtectedRoute` — Auth guard → /auth
- `ErrorBoundary` — React error boundary

### Production Components
- `ShotListTracker` — Database-backed shot management in Dashboard
- `VeoVideoEngine` — Video generation interface with clip management
- `DirectorsLog` — Event timeline for Director AI actions
- `UsageTracker` — Credit balance display (reads user_credits table)

---

## Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth context (session, user, signOut) |
| `useProjects` | CRUD for projects table |
| `useShots` | CRUD for shots + scenes |
| `useScript` | Script CRUD |
| `useCredits` | Read user credit balance (default 100) |
| `useTheme` | Dark/light theme toggle |
| `usePageTracking` | Analytics page view tracking |
| `useIsMobile` | Responsive breakpoint detection |

---

## Conventions
1. Uses `(supabase as any)` cast for tables not yet in generated types
2. Three neon accent colors (pink, cyan, purple) categorize nav items and status badges
3. Glass panel utilities: `.glass-panel-strong`, `.neo-card`
4. Gold shimmer: `.text-gold-shimmer` for animated gold gradient text
5. Shot status flow: null → "rendering" → "ready"
6. Credit system: Default 100 credits for new users
7. Analytics via GTM `dataLayer.push()` pattern
