const { onCall, HttpsError }  = require("firebase-functions/v2/https");
const { onDocumentCreated }   = require("firebase-functions/v2/firestore");
const { defineSecret }        = require("firebase-functions/params");
const { initializeApp }       = require("firebase-admin/app");
const { getMessaging }        = require("firebase-admin/messaging");
const nodemailer              = require("nodemailer");

initializeApp();

const gmailUser = defineSecret("GMAIL_USER");
const gmailPass = defineSecret("GMAIL_APP_PASSWORD");

// Recipient of suggestion notification emails.
const ADMIN_EMAIL = "ilcosmico@gmail.com";

// Email addresses authorized to send notifications.
const AUTHORIZED_EMAILS = [
    "ilcosmico@gmail.com",
    "burattinidiriccardo@gmail.com",
];

// FCM topic all app devices subscribe to.
const FCM_TOPIC = "burattinibo_news";

/**
 * Callable function: sendNotification
 *
 * Called by the notify.html page after Riccardo authenticates.
 * Verifies the caller's email, then sends an FCM notification to all
 * subscribed devices via the burattinibo_news topic.
 *
 * Expected payload fields (all strings, all optional except title+message):
 *   title, message, url, eventDate, eventTime, eventLocation
 */
exports.sendNotification = onCall({ region: "europe-west1" }, async (request) => {

    // Verify the caller is authenticated.
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "Authentication required.");
    }

    // Verify the caller is one of the authorized users.
    if (!AUTHORIZED_EMAILS.includes(request.auth.token.email)) {
        throw new HttpsError("permission-denied", "Not authorized.");
    }

    const { title = "", message = "", url = "", eventDate = "", eventTime = "", eventLocation = "", fcmToken = "" } = request.data;

    if (!title && !message) {
        throw new HttpsError("invalid-argument", "Title or message required.");
    }

    // Build the FCM message. Data payload ensures onMessageReceived() is
    // always called on the device, regardless of app state.
    const fcmMessage = {
        ...(fcmToken ? { token: fcmToken } : { topic: FCM_TOPIC }),
        notification: { title, body: message },
        data: { title, message, url, eventDate, eventTime, eventLocation },
        android: {
            priority: "high",
            ttl:      604800000,
        },
    };

    await getMessaging().send(fcmMessage);
    return { success: true };
});

/**
 * Callable function: sendEmail
 *
 * Called by EmailActivity when the user submits the in-app contact form.
 * No authentication required — anyone with the app can send an email.
 * Sends the message to the puppet theater address (BCC to admin).
 *
 * Expected payload fields (all strings):
 *   name, replyTo, subject, message
 */
exports.sendEmail = onCall(
    {
        region:  "europe-west1",
        secrets: [gmailUser, gmailPass],
    },
    async (request) => {
        const { name = "", replyTo = "", subject = "", message = "" } = request.data;

        if (!name || !replyTo || !subject || !message) {
            throw new HttpsError("invalid-argument", "All fields are required.");
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser.value(),
                pass: gmailPass.value(),
            },
        });

        await transporter.sendMail({
            from:     `"BurattiniBO App" <${gmailUser.value()}>`,
            to:       "burattinibo@gmail.com",
            bcc:      "ilcosmico@gmail.com",
            replyTo:  `"${escapeHtml(name)}" <${replyTo}>`,
            subject:  escapeHtml(subject),
            html: `
                <h2 style="color:#c0392b;">Messaggio dall\'app BurattiniBO</h2>
                <p><strong>Da:</strong> ${escapeHtml(name)} &lt;${escapeHtml(replyTo)}&gt;</p>
                <hr style="margin:16px 0;">
                <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
            `,
        });

        return { success: true };
    }
);

/**
 * Firestore trigger: onSuggestionCreated
 *
 * Fires whenever a new document is written to the "suggestions" collection
 * (i.e. when a user submits a suggestion from the app).
 * Sends an email notification to the admin via Gmail + Nodemailer.
 *
 * Required secrets (set via Firebase CLI before deploying):
 *   firebase functions:secrets:set GMAIL_USER        (e.g. ilcosmico@gmail.com)
 *   firebase functions:secrets:set GMAIL_APP_PASSWORD (Gmail App Password)
 */
exports.onSuggestionCreated = onDocumentCreated(
    {
        document:  "suggestions/{docId}",
        region:    "europe-west1",
        secrets:   [gmailUser, gmailPass],
    },
    async (event) => {
        const data       = event.data.data();
        const name       = data.name       || "";
        const email      = data.email      || "";
        const text       = data.text       || "";
        const appVersion = data.appVersion || "n/d";

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser.value(),
                pass: gmailPass.value(),
            },
        });

        await transporter.sendMail({
            from:    `"BurattiniBO App" <${gmailUser.value()}>`,
            to:      ADMIN_EMAIL,
            subject: `Nuovo suggerimento da ${escapeHtml(name)}`,
            html: `
                <h2 style="color:#c0392b;">Nuovo suggerimento — BurattiniBO</h2>
                <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Versione app:</strong> ${escapeHtml(appVersion)}</p>
                <hr style="margin:16px 0;">
                <p style="white-space:pre-wrap;">${escapeHtml(text)}</p>
            `,
        });
    }
);

function escapeHtml(str) {
    return String(str)
        .replace(/&/g,  "&amp;")
        .replace(/</g,  "&lt;")
        .replace(/>/g,  "&gt;")
        .replace(/"/g,  "&quot;");
}
