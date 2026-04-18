# Changelog — BurattiniBO Site

## [1.4] — 2026-04-18

### Fixed
- `functions/index.js` — `ttl` corrected from string `"604800s"` to number `604800000` (ms)
  as required by the Firebase Admin SDK
- `notify.html` — FCM token field now updates button label on `paste` as well as `input`
  (mobile browsers don't always fire `input` on paste)

## [1.3] — 2026-04-18

### Changed
- `notify.html` — added FCM token field (visible only to ilcosmico@gmail.com) to send
  targeted notifications to a single device; button label updates dynamically to
  "Invia a dispositivo specifico" when a token is entered
- `functions/index.js` — `sendNotification` accepts optional `fcmToken`; if provided,
  sends to that specific token instead of the `burattinibo_news` topic

## [1.2] — 2026-04-18

### Changed
- `notify.html` — message field limit raised from 500 to 1500 characters; character counters
  added to both title (0/50) and message (0/1500) fields, updated in real time while typing

## [1.1] — 2026-04-05

### Changed
- `index.html` — header overlay aligned left (same as privacy-policy); title changed to
  "BurattiniBO"; YouTube iframe replaced with thumbnail + play button link (embedding was
  disabled on the video); header left-aligned
- `privacy-policy.html` — header subtitle changed from "Burattini di Bologna" to "BurattiniBO"

## [1.0] — 2026-04-05

### Added
- `index.html` — landing page with video header, app description, YouTube presentation video
  (BurattiniBO - Presentazione App), Play Store button, feature cards grid, footer with
  privacy policy link
- `README.md` — repo description, page index, structure, deployment instructions
- `LICENSE` — all rights reserved, copyright 2026 ilCosmico
- `privacy-policy.html` — privacy policy page with video header (ilCosmicoApps.mp4),
  app logo, and card-style content sections; hosted on GitHub Pages
- `assets/ilCosmicoApps.mp4` — header background video
- `assets/logo_app.png` — app icon used in the header (renamed from ic_launcher.png)
- `notify.html` — notification sending page for Riccardo and ilCosmico:
  - Google Sign-in via Firebase Auth (authorized emails: ilcosmico@gmail.com,
    burattinidiriccardo@gmail.com)
  - Form fields: title, message, url, eventDate, eventTime, eventLocation
  - After send: form locks read-only, button changes to "Crea nuova notifica" (green)
  - "Crea nuova notifica" resets form and scrolls to top; does not re-send
  - Status banner shown as fixed top bar (green/red), always visible without scrolling
  - Responsive layout: date/time fields stack vertically on mobile (≤500px)
  - User bar: "Connesso come" + email on left, "Esci" button on right
- `functions/index.js` — Firebase Cloud Function `sendNotification` (Node.js 22,
  region europe-west1): verifies Firebase Auth, checks authorized email list, sends FCM
  notification to topic `burattinibo_news` with both notification and data payload
- `firebase.json` / `.firebaserc` — Firebase CLI config pointing to project `burattinibo-7ec06`
- `.gitignore` — excludes `functions/node_modules/`
