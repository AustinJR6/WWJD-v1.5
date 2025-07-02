// Firebase initialization for the WWJD app
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Safe to expose in client code
const firebaseConfig = {
  apiKey: 'AIzaSyDHT55zZ4X3XnbNcqjfFdlHrkc-TUbZXME',
  authDomain: 'wwjd-app-188fe.firebaseapp.com',
  projectId: 'wwjd-app-188fe',
  storageBucket: 'wwjd-app-188fe.appspot.com',
  messagingSenderId: '721094138400',
  appId: '1:721094138400:web:3e5e1a69e92e26668cba45',
};

// Create the Firebase app instance
const app = initializeApp(firebaseConfig);

// Sign in anonymously so every soul can chat without friction
const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);

export { app, auth };
