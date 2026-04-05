# BurattiniBO Site

Public website for the **Burattini di Bologna** Android app by ilCosmico.

Hosted on GitHub Pages at: https://ilcosmico.github.io/burattinibo-site/

## Pages

| Page | URL |
|------|-----|
| Landing page | `/index.html` |
| Privacy Policy | `/privacy-policy.html` |
| Send notification (authorized only) | `/notify.html` |

## Structure

```
burattinibo-site/
├── index.html              # Landing page
├── privacy-policy.html     # Privacy policy (linked from Play Store)
├── notify.html             # Notification sending page (Google login required)
├── assets/
│   ├── logo_app.png        # App icon
│   └── ilCosmicoApps.mp4  # Header background video
├── functions/
│   └── index.js            # Firebase Cloud Function: sendNotification
├── firebase.json           # Firebase CLI config
├── .firebaserc             # Firebase project: burattinibo-7ec06
└── .gitignore
```

## notify.html

Accessible only to authorized Google accounts. After login, sends a push notification
to all app users subscribed to the `burattinibo_news` FCM topic via the `sendNotification`
Cloud Function.

## Deployment

### GitHub Pages (static files)
Push to `main` branch — GitHub Pages auto-deploys from the repo root.

### Firebase Cloud Function
```bash
cd burattinibo-site
firebase deploy --only functions
```
Requires Firebase CLI installed and logged in (`firebase login`).
