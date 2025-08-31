import { ensureAnonymous } from '../src/lib/firebaseAuth';

// Backward-compatible helper name that now uses REST auth
export async function signInAnon(): Promise<void> {
  await ensureAnonymous();
}
