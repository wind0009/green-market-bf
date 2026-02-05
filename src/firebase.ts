import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase - Remplacez avec vos configurations
const firebaseConfig = {
  apiKey: "AIzaSyB-IAFIEMJA9U29X10ItTLVfLrUdugKn9c",
  authDomain: "green-market-bf-ebdb2.firebaseapp.com",
  projectId: "green-market-bf-ebdb2",
  storageBucket: "green-market-bf-ebdb2.firebasestorage.app",
  messagingSenderId: "1004093672338",
  appId: "1:1004093672338:web:316ce1c06214e75c1d4f4b",
  measurementId: "G-92YHSM3BNN"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
