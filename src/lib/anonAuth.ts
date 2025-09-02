import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export async function ensureAnon(): Promise<void> {
  // Fast path if already signed in
  if (auth.currentUser) return;

  return new Promise((resolve, reject) => {
    // Allow more time on first boot or slow networks
    const timeout = setTimeout(() => {
      try { unsub(); } catch {}
      reject(new Error('Auth init timeout'));
    }, 30000);

    const finish = (err?: any) => {
      clearTimeout(timeout);
      try { unsub(); } catch {}
      if (err) return reject(err);
      resolve();
    };

    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          // If no user yet, kick off anonymous sign-in immediately
          if (!user) {
            await signInAnonymously(auth);
            return; // wait for next auth state change
          }
          finish();
        } catch (e) {
          finish(e);
        }
      },
      (err) => finish(err)
    );

    // Also proactively trigger anon sign-in in case the listener is slow
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(() => {
        // Errors surface via the listener error handler
      });
    }
  });
}
