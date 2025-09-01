import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export async function ensureAnon(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsub();
      reject(new Error('Auth init timeout'));
    }, 15000);

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (!user) {
            await signInAnonymously(auth);
          }
          clearTimeout(timeout);
          unsub();
          resolve();
        } catch (e) {
          clearTimeout(timeout);
          unsub();
          reject(e);
        }
      },
      (err) => {
        clearTimeout(timeout);
        unsub();
        reject(err);
      }
    );
  });
}

