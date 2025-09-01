import { ensureAnon } from '../src/lib/anonAuth';

// Backward-compatible helper name that now uses REST auth
export async function signInAnon(): Promise<void> {
  await ensureAnon();
}
