import admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey && !projectId.startsWith('dummy')) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('Firebase credentials not set or set to dummy. Initializing Firebase Admin in mock mode.');
    }
  }

  if (admin.apps.length) {
    adminAuth = admin.auth();
    adminDb = admin.firestore();
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

export { adminAuth, adminDb };
export default admin;
