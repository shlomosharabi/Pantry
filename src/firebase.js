import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project config from Firebase Console
// Go to https://console.firebase.google.com/ > Project Settings > General > Your apps > Web app config
const firebaseConfig = {
  apiKey: "AIzaSyBd91n3U5TBhHe4L39yB6itkRgxrIrSP5Q",
  authDomain: "pantry-f830f.firebaseapp.com",
  projectId: "pantry-f830f",
  storageBucket: "pantry-f830f.firebasestorage.app",
  messagingSenderId: "1009303517315",
  appId: "1:1009303517315:web:2d02d256db16acb22083b6",
  measurementId: "G-RNX6G1JQH4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (err) {
  if (err.code === "failed-precondition") {
    console.warn(
      "Multiple tabs open, persistence can only be enabled in one tab at a time.",
    );
  } else if (err.code === "unimplemented") {
    console.warn(
      "The current browser does not support all of the features required to enable persistence",
    );
  }
}

// Initialize Auth
export const auth = getAuth(app);
