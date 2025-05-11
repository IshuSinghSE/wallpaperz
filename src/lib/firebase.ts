
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcsvlpW-8Zqv21Kj8nXZNgyLGbEjsCxyY",
  authDomain: "roomdesign-7.firebaseapp.com",
  projectId: "roomdesign-7",
  storageBucket: "roomdesign-7.appspot.com",
  messagingSenderId: "1035240251094",
  appId: "1:1035240251094:web:fb54507aeff3568699b377",
  measurementId: "G-1H75QFL3Y5"
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
