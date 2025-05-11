
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// Replace these placeholders with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Check if configuration contains actual values
const isConfigValid = !Object.values(firebaseConfig).some(value => 
  value === undefined || 
  value.includes("YOUR_") ||
  value.includes("undefined")
);

// Initialize Firebase services
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  if (!isConfigValid) {
    console.warn("Firebase configuration is invalid. Using mock mode.");
    // Continue to initialize Firebase but log warning
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create mock implementations
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
  googleProvider = {} as any;
}

export { auth, db, storage, googleProvider };
