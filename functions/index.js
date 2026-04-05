const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp }      = require("firebase-admin/app");
const { getMessaging }       = require("firebase-admin/messaging");

initializeApp();

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

    const { title = "", message = "", url = "", eventDate = "", eventTime = "", eventLocation = "" } = request.data;

    if (!title && !message) {
        throw new HttpsError("invalid-argument", "Title or message required.");
    }

    // Build the FCM message. Data payload ensures onMessageReceived() is
    // always called on the device, regardless of app state.
    const fcmMessage = {
        topic: FCM_TOPIC,
        notification: { title, body: message },
        data: { title, message, url, eventDate, eventTime, eventLocation },
        android: {
            priority: "high",
        },
    };

    await getMessaging().send(fcmMessage);
    return { success: true };
});
