import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../config/firebaseConfig';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Ensure React Native persistence is set by initializing Auth BEFORE getAuth
let auth;
try {
  // initializeAuth throws if already initialized (e.g., on fast refresh)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fallback to existing instance
  auth = getAuth(app);
}

export { app, auth };
