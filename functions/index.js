const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated }   = require("firebase-functions/v2/firestore");
const { defineSecret }        = require("firebase-functions/params");
const { initializeApp }       = require("firebase-admin/app");
const { getMessaging }        = require("firebase-admin/messaging");
const nodemailer              = require("nodemailer");
const crypto                  = require("crypto");

initializeApp();

const gmailUser    = defineSecret("GMAIL_USER");
const gmailPass    = defineSecret("GMAIL_APP_PASSWORD");
const notifyApiKey = defineSecret("NOTIFY_API_KEY");

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
 * Builds and sends the FCM message shared by sendNotification and sendNotificationApi.
 * Data payload ensures onMessageReceived() is always called on the device,
 * regardless of app state.
 */
async function sendFcmNotification({ title = "", message = "", url = "", eventDate = "", eventTime = "", eventLocation = "", phone = "", fcmToken = "" }) {
    if (!title && !message) {
        throw new Error("Title or message required.");
    }

    const fcmMessage = {
        ...(fcmToken ? { token: fcmToken } : { topic: FCM_TOPIC }),
        notification: { title, body: message },
        data: { title, message, url, eventDate, eventTime, eventLocation, phone },
        android: {
            priority: "high",
            ttl:      604800000,
        },
    };

    await getMessaging().send(fcmMessage);
}

/** Constant-time string comparison, used for the sendNotificationApi secret check. */
function timingSafeEqualStr(a, b) {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

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

    try {
        await sendFcmNotification(request.data);
    } catch (e) {
        throw new HttpsError("invalid-argument", e.message);
    }
    return { success: true };
});

/**
 * HTTP function: sendNotificationApi
 *
 * Dedicated entry point for sending notifications without interactive Google
 * login (e.g. from an automated assistant). Authorized via a shared secret
 * instead of Firebase Auth — set with:
 *   firebase functions:secrets:set NOTIFY_API_KEY
 * and sent as the "X-Notify-Key" header. Same payload/behavior as sendNotification.
 */
exports.sendNotificationApi = onRequest(
    { region: "europe-west1", secrets: [notifyApiKey] },
    async (req, res) => {
        if (req.method !== "POST") {
            res.status(405).json({ success: false, error: "Method not allowed." });
            return;
        }

        const providedKey = req.get("X-Notify-Key") || "";
        if (!timingSafeEqualStr(providedKey, notifyApiKey.value())) {
            res.status(401).json({ success: false, error: "Unauthorized." });
            return;
        }

        try {
            await sendFcmNotification(req.body || {});
            res.status(200).json({ success: true });
        } catch (e) {
            res.status(400).json({ success: false, error: e.message });
        }
    }
);

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
