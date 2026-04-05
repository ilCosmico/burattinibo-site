# Changelog — BurattiniBO Site

## [1.0] — 2026-04-05

### Added
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
  - User bar wraps gracefully on small screens
- `functions/index.js` — Firebase Cloud Function `sendNotification` (Node.js 22,
  region europe-west1): verifies Firebase Auth, checks authorized email list, sends FCM
  notification to topic `burattinibo_news` with both notification and data payload
- `firebase.json` / `.firebaserc` — Firebase CLI config pointing to project `burattinibo-7ec06`
- `.gitignore` — excludes `functions/node_modules/`

### Changed
- `privacy-policy.html` — app icon position moved to left of title in header
- `functions/index.js` — upgraded runtime from Node.js 20 to Node.js 22;
  changed single authorized email to array (ilcosmico + burattinidiriccardo)
