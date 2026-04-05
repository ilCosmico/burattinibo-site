# Changelog — BurattiniBO Site

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
