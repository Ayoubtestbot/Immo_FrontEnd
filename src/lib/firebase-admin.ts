import * as admin from 'firebase-admin';

const serviceAccount = require('../../leadimmo-9a856-firebase-adminsdk-fbsvc-4f5b5fa5db.json');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.log('Firebase admin initialization error', error.stack);
  }
}

export default admin;
