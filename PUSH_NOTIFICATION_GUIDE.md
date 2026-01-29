# Push Notification Implementation – Easy Guide

This document explains how push notifications work in GurukulamHub: PWA, database, helpers, and how they connect.

---

## Quick Overview

```
User logs in → SubscribeToPush saves subscription to DB
     ↓
Something happens (quiz approved, game created, etc.)
     ↓
Helper creates notification → Service saves to DB + sends push
     ↓
Push service sends to user's browser via web-push
     ↓
Service worker (push-handler.js) shows notification
     ↓
User clicks → PushNotificationHandler marks as read in DB
```

---

## Part 1: PWA / Service Worker (Where push is shown)

### What you did

1. **Next.js PWA config** (`next.config.mjs`)
   - The PWA plugin is told to load your push logic:
   - `workboxOptions.importScripts: ['/push-handler.js']`

2. **Push handler** (`public/push-handler.js`)
   - Runs inside the service worker.
   - **On `push`:** reads title, body, icon, url, `notificationId` from the payload → shows a notification (with “Open” / “Close”).
   - **On `notificationclick`:** closes the notification, then either:
     - Opens/focuses the app and adds `?notificationId=...` to the URL, or
     - Sends a message to an already open tab: `{ type: 'NOTIFICATION_CLICKED', notificationId }`.

So: **PWA gives you the service worker; `push-handler.js` is what actually shows and handles push.**

---

## Part 2: Database (Where data is stored)

### 2.1 Notifications

- **File:** `src/app/api/notifications/notification.model.js`
- **Collection:** `notifications`
- **Main fields:**
  - `userId` – who gets it  
  - `type` – e.g. QUIZ_APPROVED, GAME_CREATED, GROUP_JOINED, ROLE_ASSIGNED  
  - `title`, `message`  
  - `isRead`, `readAt`, `isFavorite`  
  - `relatedEntity` – type + id (quiz, game, group, etc.)  
  - `metadata`, `actionUrl`, `actionLabel`, `expiresAt`  
- **Indexes:** for fast queries by user, read status, time; TTL 90 days on `createdAt`.

All “in-app” notifications live here.

### 2.2 Push subscriptions (per user)

- **File:** `src/app/models/user.model.js`
- **Field:** `pushSubscriptions` (array on each user)
- **Each item:** `endpoint`, `keys.p256dh`, `keys.auth`, optional `deviceInfo`.

This is what the backend uses to send web-push to the user’s browser.

---

## Part 3: Helper Functions (Creating the right notification when something happens)

- **File:** `src/app/api/notifications/notification.helpers.js`

Helpers prepare one or many notification objects and call the notification service to save them.

### Quiz

- `createQuizApprovedNotification(userId, quizData)`
- `createQuizRejectedNotification(userId, quizData)`
- `createQuizPendingApprovalNotification(adminUserIds, quizData)`
- `createQuizPublishedNotification(userIds, quizData)`

### Game

- `createGameCreatedNotification(userIds, gameData)`
- `createGameRegisteredNotification(userId, gameData)`
- `createGameStartedNotificationsForRegisteredUsers(gameId, gameData)`
- `createGameCompletedNotificationsForParticipatedUsers(gameId, gameData)`
- `createGameMissedNotificationsForRegisteredUsers(gameId, gameData)`
- `createGameCancelledNotificationsForRegisteredUsers(gameId, gameData)`
- `createGameAccessRemovedNotification(userIds, gameData)`
- `createGameDeletedNotification(userIds, gameData)`

### Group

- `createGroupJoinedNotification(userId, groupData)`
- `createGroupRemovedNotification(userId, groupData)`
- `createGroupRequestReceivedNotification(adminUserId, requestData)`
- `createGroupRequestApprovedNotification(userId, requestData)`
- `createGroupRequestRejectedNotification(userId, requestData)`

### Role / Profile / Sponsorship

- `createRoleAssignedNotification(userId, roleData)`
- `createRoleRemovedNotification(userId, roleData)`
- `createProfileCompletionNotification(userId, profileData)`
- `createPhysicalGiftSponsorshipPendingNotification(adminUserIds, sponsorshipData)`
- `createSponsorshipApprovedNotification(sponsorUserId, sponsorshipData)`
- `createSponsorshipRejectedNotification(sponsorUserId, sponsorshipData)`

Helpers also:
- Normalize IDs and titles from your domain objects.
- Avoid duplicates (e.g. “already sent today” or “in last 24h” for games).
- Use an in-memory lock for “game started” to avoid races.

**In short:** helpers = “when X happens, create these notification documents.”

---

## Part 4: Services (Save + broadcast + push)

### 4.1 Notification service

- **File:** `src/app/api/notifications/notification.service.js`

**Read:** `getOne`, `getAll`, `getUnread`, `getFavorite`, `getCount`, `getByType`.

**Write:** `addOne`, `addMany`, `markAsRead`, `markAllAsRead`, `updateOne`, `deleteOne`, `toggleFavorite`, `deleteExpired`.

**When creating notifications (`addOne` / `addMany`):**

1. Saves to the **notifications** collection.
2. Sends **WebSocket** events so the UI updates in real time.
3. Calls **push service** `sendPushNotification(userId, { title, body, icon, url, tag, data })` so the user gets a browser push. It keeps payload small (e.g. no big base64 images) and puts `notificationId` in `data` for click handling.

So: **notification service = save to DB + WebSocket + trigger push.**

### 4.2 Push service

- **File:** `src/app/api/notifications/push.service.js`
- **Uses:** VAPID keys from env + `web-push` library.

**`sendPushNotification(userId, { title, body, icon, url, tag, sound, data })`:**

1. Loads the user and `user.pushSubscriptions`.
2. Builds a small JSON payload (title, body, icon, url, tag, sound, data).
3. Sends it to **every** subscription via `webpush.sendNotification(...)`.
4. If a subscription returns 410/404/403/401, it removes that subscription from the user in the DB.

**`sendPushNotificationToMultipleUsers(userIds, notificationData)`**  
Calls `sendPushNotification` for each `userId`.

So: **push service = send web-push to all of the user’s stored subscriptions and clean up broken ones.**

---

## Part 5: API Routes

### Subscribe – save browser’s push subscription

- **Route:** `POST /api/notifications/push/subscribe`
- **File:** `src/app/api/notifications/push/subscribe/route.js`
- **Auth:** Session required.
- **Body:** `{ endpoint, keys: { p256dh, auth }, userAgent? }`
- **Logic:**
  - Find user by `session.user.email`.
  - Add or update this `endpoint` in `user.pushSubscriptions` (dedupe by endpoint).
  - Save user.

So: **this route is how the browser’s push subscription gets stored in the database.**

---

## Part 6: Client Components

### SubscribeToPush

- **File:** `src/components/push/SubscribeToPush.jsx`
- **Used in:** `src/components/Providers.jsx` (no visible UI).

**When the user is logged in and the browser supports push:**

1. Waits for the service worker to be ready.
2. Checks if there is already a push subscription.
3. If **yes:** sends it to `POST /api/notifications/push/subscribe` (sync with backend).
4. If **no:** asks `Notification.requestPermission()`, then subscribes with the VAPID public key and sends the new subscription to `POST /api/notifications/push/subscribe`.

So: **SubscribeToPush = “when user is logged in, ensure we have a push subscription and save it in the DB.”**

### PushNotificationHandler

- **File:** `src/components/push/PushNotificationHandler.jsx`
- **Used in:** `src/components/Providers.jsx` (no visible UI).

**When the app is open and the user is logged in:**

1. **From URL:** If the URL has `?notificationId=...`, it calls your notifications API to **mark that notification as read**, then removes `notificationId` from the URL.
2. **From service worker:** Listens for `message` events. If `event.data.type === 'NOTIFICATION_CLICKED'` and `event.data.notificationId` is set, it marks that notification as read via the API.

So: **PushNotificationHandler = “if the user opened the app by clicking a push (via URL or existing tab), mark that notification as read in the DB.”**

---

## Part 7: Full Flow (Step by step)

| Step | Where | What happens |
|------|--------|--------------|
| 1 | PWA + SW | App has a service worker that loads `push-handler.js`. |
| 2 | Client | User is logged in → `SubscribeToPush` gets/creates a push subscription and sends it to `POST /api/notifications/push/subscribe`. |
| 3 | API | Subscribe route saves/updates `user.pushSubscriptions` in MongoDB. |
| 4 | Your app | Something happens (e.g. quiz approved, game created) → your code calls a **notification helper** (e.g. `createGameCreatedNotification(userIds, gameData)`). |
| 5 | Helper | Helper builds notification payloads and calls **notification service** `addOne` or `addMany`. |
| 6 | Notification service | Saves to **notifications** collection, sends **WebSocket** events, and calls **push service** `sendPushNotification(userId, {...})`. |
| 7 | Push service | Loads `user.pushSubscriptions` and uses **web-push** + VAPID to send the payload to each endpoint. |
| 8 | Browser | Push reaches the service worker; **push-handler.js** handles `push` and calls `showNotification(...)`. |
| 9 | User | User clicks the notification. **push-handler.js** handles `notificationclick`: opens/focuses app with `?notificationId=...` or sends `NOTIFICATION_CLICKED` + `notificationId` to the open tab. |
| 10 | Client | **PushNotificationHandler** sees `notificationId` (from URL or message) and calls the API to **mark that notification as read** in the database. |

---

## Part 8: File Reference

| Purpose | File(s) |
|--------|---------|
| PWA loads push logic | `next.config.mjs` → `importScripts: ['/push-handler.js']` |
| Show and handle push in SW | `public/push-handler.js` |
| Notification documents | `src/app/api/notifications/notification.model.js` |
| Push subscriptions per user | `src/app/models/user.model.js` → `pushSubscriptions` |
| Create notifications for events | `src/app/api/notifications/notification.helpers.js` |
| Save notifications + trigger push | `src/app/api/notifications/notification.service.js` |
| Send web-push | `src/app/api/notifications/push.service.js` |
| Save subscription from browser | `src/app/api/notifications/push/subscribe/route.js` |
| Subscribe and sync with backend | `src/components/push/SubscribeToPush.jsx` |
| Mark as read when user clicks push | `src/components/push/PushNotificationHandler.jsx` |
| Where components run | `src/components/Providers.jsx` |

---

## Summary in one sentence

**PWA service worker + `push-handler.js` show and handle push; the database stores notifications and push subscriptions; helper functions create the right notifications when things happen; services save them, send web-push, and the client components subscribe the user and mark notifications as read when they open the app from a push.**

---

*Last updated for GurukulamHub push notification implementation.*
