# TODO — BurattiniBO Site

## In progress

- 🔲 Verify Cloud Function deploy completed successfully (first deploy enables Google Cloud APIs,
  may take a few minutes)
- 🔲 Update Node.js runtime from 20 to 22 before 2026-04-30 deprecation deadline

## Notification page for Riccardo

- 🔲 Enable Firebase Authentication (email/password) in Firebase Console
- 🔲 Create Riccardo's Firebase Auth account (email + password)
- 🔲 Build `notify.html` — login form + notification form (title, message, url,
  eventDate yyyy-MM-dd, eventTime HH:mm, eventLocation); calls `sendNotification`
  Cloud Function via Firebase JS SDK
- 🔲 Add Firebase JS SDK to the page (Auth + Functions)
- 🔲 Test end-to-end: Riccardo logs in → sends notification → arrives on both test devices

## App

- 🔲 Release new APK/AAB with FCM topic subscription (`burattinibo_news`) added in
  `StartUpActivity.onCreate()` — existing users will subscribe on next app launch

## Site

- 🔲 Update Play Console Privacy Policy URL if needed (currently Google Sites)
- 🔲 Consider adding a simple index/landing page (optional)
