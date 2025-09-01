declare module 'expo-linear-gradient' {
  export const LinearGradient: any;
}

declare module 'expo-blur' {
  export const BlurView: any;
}

declare module 'firebase/auth/react-native' {
  export function getReactNativePersistence(storage: any): any;
}

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: any): any;
  export const initializeAuth: any;
  export const getAuth: any;
  export const signInAnonymously: any;
  export const onAuthStateChanged: any;
}
