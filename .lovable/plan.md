

# Plan: Push Notification Support for PWA

## Overview

Add Web Push Notifications so users get alerts when video renders complete or scripts are updated — even when the app is in the background. This involves a custom service worker, a backend function to send notifications, a database table to store subscriptions, and a UI toggle in Settings.

## Architecture

```text
┌─────────────┐   subscribe    ┌──────────────────┐
│  Browser SW  │──────────────▶│ push_subscriptions│ (DB table)
└─────────────┘                └──────────────────┘
                                        │
       ┌────────────────────────────────┘
       ▼
┌──────────────────┐   web-push    ┌─────────────┐
│ send-notification│──────────────▶│  Browser SW  │
│ (edge function)  │               │  (shows notif)│
└──────────────────┘               └─────────────┘
```

## Implementation Steps

### 1. Generate VAPID keys
Web Push requires a VAPID key pair. I will generate these and store the private key as a backend secret. The public key will be used client-side.

### 2. Create `push_subscriptions` database table
Stores each user's push subscription endpoint, keys, and auth token. RLS scoped to authenticated users for their own rows.

| Column | Type |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| endpoint | text |
| p256dh | text |
| auth | text |
| created_at | timestamptz |

### 3. Create custom service worker (`public/custom-sw.js`)
Handles `push` events to display notifications and `notificationclick` events to open the app. The VitePWA plugin will be configured to inject this alongside the generated workbox SW via `importScripts`.

### 4. Create `send-notification` edge function
Accepts a user ID + title/body, looks up their push subscriptions, and sends Web Push messages using the VAPID private key. Called internally when video renders complete or scripts update.

### 5. Add notification hook (`src/hooks/useNotifications.ts`)
- Checks `Notification.permission`
- Requests permission and subscribes via `serviceWorkerRegistration.pushManager.subscribe()`
- Saves subscription to `push_subscriptions` table
- Provides `isSubscribed`, `subscribe()`, `unsubscribe()` state

### 6. Add "Notifications" tab to Settings page
A new tab with a toggle to enable/disable push notifications, showing permission state and a test notification button.

### 7. Wire notifications into existing flows
- In `VeoVideoEngine.tsx`: after a shot status changes to `ready`, call the edge function to notify the user
- In script-assist edge function: optionally notify on AI suggestion completion

## Files Changed

- `public/custom-sw.js` — new, push event handler
- `vite.config.ts` — add `importScripts` for custom SW
- `src/hooks/useNotifications.ts` — new, subscription logic
- `src/pages/Settings.tsx` — add Notifications tab
- `supabase/functions/send-notification/index.ts` — new edge function
- Database migration — `push_subscriptions` table + RLS
- `src/components/production/VeoVideoEngine.tsx` — trigger notification on render complete

