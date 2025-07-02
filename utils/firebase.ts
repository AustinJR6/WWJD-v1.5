// utils/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase config — safe to store directly for client-side use
const firebaseConfig = {
  apiKey: 'AIzaSyDHT55zZ4X3XnbNcqjfFdlHrkc-TUbZXME',
  authDomain: 'wwjd-app-188fe.firebaseapp.com',
  projectId: 'wwjd-app-188fe',
  storageBucket: 'wwjd-app-188fe.appspot.com', // fixed typo (.app → .appspot.com)
  messagingSenderId: '721094138400',
  appId: '1:721094138400:web:3e5e1a69e92e26668cba45',
  measurementId: 'G-ZVH0W24T2G', // Safe to leave in, unused by mobile
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Auth (anonymous for now)
const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);

export { app, auth };
