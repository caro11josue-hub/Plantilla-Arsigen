import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDJbJF1vme8cxnxwc_O2ud0rac2GFBLMTM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'plantilla-de-prueba-bd5a1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'plantilla-de-prueba-bd5a1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'plantilla-de-prueba-bd5a1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1045881568729',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1045881568729:web:0eb33c06a65fd9e1c06dc8',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

try {
  setLogLevel('silent');
} catch {
  // Ignorar en entornos que no admitan setLogLevel
}

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    ignoreUndefinedProperties: true,
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch {
  try {
    firestoreDb = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: memoryLocalCache(),
    });
  } catch {
    firestoreDb = getFirestore(app);
  }
}

export const db = firestoreDb;
export const auth = getAuth(app);
export const storage = getStorage(app);
