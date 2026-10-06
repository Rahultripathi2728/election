import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  updateDoc 
} from "firebase/firestore";

// Storage key for user-configured Firebase credentials
const FIREBASE_CONFIG_KEY = "paperless_election_firebase_config";

// Default placeholder config
export const defaultFirebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "paperless-election-system",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse saved Firebase config", e);
  }
  return defaultFirebaseConfig;
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
    firestoreDb = getFirestore(firebaseApp);
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
