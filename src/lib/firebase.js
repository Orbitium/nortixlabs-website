import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

import firebaseConfig from '../../google-services.json';

const config = {
    apiKey: firebaseConfig.client[0].api_key[0].current_key,
    authDomain: `${firebaseConfig.project_info.project_id}.firebaseapp.com`,
    projectId: firebaseConfig.project_info.project_id,
    storageBucket: firebaseConfig.project_info.storage_bucket,
    messagingSenderId: firebaseConfig.project_info.project_number,
    appId: firebaseConfig.client[0].client_info.mobilesdk_app_id
};

const app = initializeApp(config);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
