import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../config/firebaseConfig';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth = getAuth(app);
try {
  // @ts-ignore initializeAuth throws if already initialized
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {}

export { app, auth };
