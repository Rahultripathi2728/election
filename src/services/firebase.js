import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  updateDoc 
} from "firebase/firestore";

// Storage key for user-configured Firebase credentials
const FIREBASE_CONFIG_KEY = "paperless_election_firebase_config";

// Default config pulling from Vite environment variables (.env) or active project election-live-8921a
export const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBLHp185MB1hqBWyakKrgWgRVEzJAUgHYg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "election-live-8921a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "election-live-8921a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "election-live-8921a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "171253767960",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:171253767960:web:3f7b0c179aaaaa2e16486d"
};

export const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Fallback to env vars if individual keys are empty in localStorage
      return {
        apiKey: parsed.apiKey || defaultFirebaseConfig.apiKey,
        authDomain: parsed.authDomain || defaultFirebaseConfig.authDomain,
        projectId: parsed.projectId || defaultFirebaseConfig.projectId,
        storageBucket: parsed.storageBucket || defaultFirebaseConfig.storageBucket,
        messagingSenderId: parsed.messagingSenderId || defaultFirebaseConfig.messagingSenderId,
        appId: parsed.appId || defaultFirebaseConfig.appId,
      };
    }
  } catch (e) {
    console.error("Failed to parse saved Firebase config", e);
  }
  return { ...defaultFirebaseConfig };
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

let firebaseApp = null;
let firestoreDb = null;

export const initFirebase = (customConfig = null) => {
  const config = customConfig || getSavedFirebaseConfig();
  
  if (!config || !config.apiKey || !config.projectId) {
    return {
      connected: false,
      message: "Firebase API Key / Project ID not set. Operating in high-speed local synchronized mode."
    };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }

    try {
      if (typeof window !== "undefined") {
        firestoreDb = initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
          })
        });
      } else {
        firestoreDb = getFirestore(firebaseApp);
      }
    } catch (cacheInitErr) {
      firestoreDb = getFirestore(firebaseApp);
    }

    return {
      connected: true,
      message: `Firebase connected to project: ${config.projectId}`
    };
  } catch (err) {
    console.warn("Firebase initialization notice:", err.message);
    return {
      connected: false,
      message: `Firebase error: ${err.message}`
    };
  }
};

export const getDb = () => firestoreDb;
export const isFirebaseConfigured = () => {
  const conf = getSavedFirebaseConfig();
  return Boolean(conf && conf.apiKey && conf.projectId);
};
