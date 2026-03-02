// SÁLVAME — Firebase Cloud Functions
// Backend: Twilio SMS, alert management, location updates, auto-expiry
// Deploy: firebase deploy --only functions

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

admin.initializeApp();
const db = admin.firestore();

// ─── Twilio Configuration ─────────────────────────────────────────────────────
// Set via: firebase functions:config:set twilio.account_sid="ACxxx" twilio.auth_token="xxx" twilio.phone_number="+1xxx"

const getTwilioClient = () => {
  const accountSid = functions.config().twilio?.account_sid || process.env.TWILIO_ACCOUNT_SID;
  const authToken = functions.config().twilio?.auth_token || process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) throw new Error('Twilio credentials not configured');
  return twilio(accountSid, authToken);
};

const getTwilioPhone = () =>
  functions.config().twilio?.phone_number || process.env.TWILIO_PHONE_NUMBER || '';

// ─── Send SOS Alert ───────────────────────────────────────────────────────────

export const sendSOSAlert = functions
  .region('us-central1')
  .https.onCall(async (data) => {
    const { sessionId, userName, phoneNumbers, trackingUrl } = data;

    if (!sessionId || !userName || !phoneNumbers || !Array.isArray(phoneNumbers)) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    const time = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Lima',
    });

    const message = `🆘 ${userName} necesita ayuda urgente (${time}). Ver ubicación en vivo: ${trackingUrl}`;
    const client = getTwilioClient();
    const fromPhone = getTwilioPhone();

    const results = await Promise.allSettled(
      phoneNumbers.map((to: string) => client.messages.create({ body: message, from: fromPhone, to }))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.filter((r) => r.status === 'rejected').length;

    await db.collection('alerts').doc(sessionId).update({
      smsSentCount: successCount,
      smsFailCount: failCount,
      smsSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`[sendSOSAlert] Session ${sessionId}: ${successCount} sent, ${failCount} failed`);

    if (successCount === 0) {
      throw new functions.https.HttpsError('internal', 'All SMS failed to send');
    }

    return { success: true, sent: successCount, failed: failCount };
  });

// ─── Send Test Alert ──────────────────────────────────────────────────────────

export const sendTestAlert = functions
  .region('us-central1')
  .https.onCall(async (data) => {
    const { userName, phoneNumbers } = data;

    if (!userName || !phoneNumbers || !Array.isArray(phoneNumbers)) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    const message = `✅ Hola, ${userName} te ha agregado como contacto de emergencia en SÁLVAME. Si recibes un mensaje de SOS de esta app, significa que ${userName} necesita ayuda urgente. No necesitas instalar nada. (salvame.app)`;

    const client = getTwilioClient();
    const fromPhone = getTwilioPhone();

    const results = await Promise.allSettled(
      phoneNumbers.map((to: string) => client.messages.create({ body: message, from: fromPhone, to }))
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    functions.logger.info(`[sendTestAlert] ${successCount}/${phoneNumbers.length} test messages sent`);

    return { success: successCount > 0, sent: successCount };
  });

// ─── Update Alert Location ────────────────────────────────────────────────────

export const updateAlertLocation = functions
  .region('us-central1')
  .https.onCall(async (data) => {
    const { sessionId, location } = data;

    if (!sessionId || !location) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing sessionId or location');
    }

    await db.collection('alerts').doc(sessionId).update({
      lastLocation: location,
      locationHistory: admin.firestore.FieldValue.arrayUnion(location),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  });

// ─── Auto-expire alerts (runs every hour) ────────────────────────────────────

export const expireAlerts = functions
  .region('us-central1')
  .pubsub.schedule('every 60 minutes')
  .onRun(async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const expiredAlerts = await db
      .collection('alerts')
      .where('status', '==', 'active')
      .where('triggeredAt', '<', twoHoursAgo)
      .get();

    const batch = db.batch();
    expiredAlerts.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    functions.logger.info(`[expireAlerts] Expired ${expiredAlerts.size} alerts`);
    return null;
  });

// ─── Get Alert for Web Tracker (public CORS endpoint) ────────────────────────

export const getAlertForTracker = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }

    const sessionId = req.query.id as string;
    if (!sessionId) { res.status(400).json({ error: 'Missing session ID' }); return; }

    const alertDoc = await db.collection('alerts').doc(sessionId).get();
    if (!alertDoc.exists) { res.status(404).json({ error: 'Alert not found' }); return; }

    const alert = alertDoc.data()!;

    // Return only public-safe fields
    res.json({
      id: sessionId,
      status: alert.status,
      userName: alert.userName,
      lastLocation: alert.lastLocation,
      triggeredAt: alert.triggeredAt,
      updatedAt: alert.updatedAt,
    });
  });
