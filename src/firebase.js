import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBd91n3U5TBhHe4L39yB6itkRgxrIrSP5Q",
  authDomain: "pantry-f830f.firebaseapp.com",
  projectId: "pantry-f830f",
  storageBucket: "pantry-f830f.firebasestorage.app",
  messagingSenderId: "1009303517315",
  appId: "1:1009303517315:web:2d02d256db16acb22083b6",
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export const auth = getAuth(app);
