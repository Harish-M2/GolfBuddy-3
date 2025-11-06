// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCejpebczyER3maXLPp2ECr4FJvPdWttQc",
  authDomain: "golfbuddy-app-c879a.firebaseapp.com",
  projectId: "golfbuddy-app-c879a",
  storageBucket: "golfbuddy-app-c879a.firebasestorage.app",
  messagingSenderId: "498349561201",
  appId: "1:498349561201:web:bf1421050404c6169892d0",
  measurementId: "G-MS029MH32L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
