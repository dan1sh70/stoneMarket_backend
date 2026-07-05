const admin = require('firebase-admin');
const fs = require('fs');

let fcmInitialized = false;

const initFCM = () => {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountPath) return false;

  try {
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn(`Firebase service account file not found at: ${serviceAccountPath}`);
      return false;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    fcmInitialized = true;
    return true;
  } catch (err) {
    console.error(`Firebase initialization failed: ${err.message}`);
    return false;
  }
};

const sendPushNotification = async (token, title, body, data = {}) => {
  if (!fcmInitialized) {
    const success = initFCM();
    if (!success) {
      console.log(`[MOCK FCM PUSH] To: ${token} | Title: ${title} | Body: ${body}`);
      return null;
    }
  }

  try {
    const message = {
      notification: { title, body },
      data: data,
      token: token
    };
    const response = await admin.messaging().send(message);
    return response;
  } catch (err) {
    console.error(`Firebase push send failed: ${err.message}`);
    console.log(`[FALLBACK FCM PUSH] To: ${token} | Title: ${title} | Body: ${body}`);
    return null;
  }
};

module.exports = { sendPushNotification };
