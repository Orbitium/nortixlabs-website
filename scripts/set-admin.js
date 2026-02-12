const admin = require('firebase-admin');
const serviceAccount = require('../google-services.json');

// Use the details from your google-services.json
// Note: Admin SDK usually needs a Service Account Key (JSON), 
// but we can initialize with the project ID if you have GOOGLE_APPLICATION_CREDENTIALS set.
// For a quick script, it's best to use a Service Account Key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key

const uid = process.argv[2];

if (!uid) {
    console.error('Please provide a UID: node set-admin.js <UID>');
    process.exit(1);
}

console.log(`Attempting to set admin claim for UID: ${uid}`);

/* 
   INSTRUCTIONS:
   1. Go to Firebase Console > Project Settings > Service Accounts
   2. Click "Generate new private key"
   3. Save it as 'firebase-admin-key.json' in the root of this project
   4. Run: node scripts/set-admin.js <UID>
*/

try {
    const cert = require('../firebase-admin-key.json');
    admin.initializeApp({
        credential: admin.credential.cert(cert)
    });

    admin.auth().setCustomUserClaims(uid, { admin: true })
        .then(() => {
            console.log('Successfully set admin claim.');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error setting custom claims:', error);
            process.exit(1);
        });
} catch (e) {
    console.error('Error: firebase-admin-key.json not found.');
    console.log('\nTo fix this:');
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save the file exactly as "firebase-admin-key.json" in this folder.');
}
