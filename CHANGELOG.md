# Changelog — BurattiniBO Site

## [Unreleased]

### Added
- `privacy-policy.html` — privacy policy page with video header (ilCosmicoApps.mp4),
  app logo, and card-style content sections; hosted on GitHub Pages
- `assets/ilCosmicoApps.mp4` — header background video
- `assets/logo_app.png` — app icon used in the header
- `functions/index.js` — Firebase Cloud Function `sendNotification` (Node.js 20,
  region europe-west1): verifies Firebase Auth, checks authorized email, sends FCM
  notification to topic `burattinibo_news` with both notification and data payload
- `firebase.json` / `.firebaserc` — Firebase CLI config pointing to project `burattinibo-7ec06`
