import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Al Firebase-opsætning samlet ét sted, ligesom i INNT-øvelse 5 og 6.
// Web-konfigurationen er ikke hemmelig: den identificerer kun projektet.
// Sikkerheden ligger i database.rules.json og i Cloud Function'en.
// (OpenAI-nøglen ligger ALDRIG her, men som secret i Firebase.)
const firebaseConfig = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_PROJECT_ID.firebaseapp.com',
  databaseURL: 'https://FIREBASE_PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'FIREBASE_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
};

// Jeg initialiserer kun appen én gang (vigtigt ved hot reload).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// På mobilen gemmer jeg login-sessionen med AsyncStorage, så brugeren
// forbliver logget ind efter genstart. På web klarer Firebase det selv.
function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    // initializeAuth fejler, hvis auth allerede er oprettet (fx ved hot reload).
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getDatabase(app);

// Cloud Functions ligger i Belgien (europe-west1) ligesom databasen.
export const functions = getFunctions(app, 'europe-west1');
