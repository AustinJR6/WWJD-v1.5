import AsyncStorage from '@react-native-async-storage/async-storage';

const WEB_API_KEY = 'AIzaSyDHT55zZ4X3XnbNcqjfFdlHrkc-TUbZXME';

type TokenBundle = {
  idToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  userId?: string;
};

const STORAGE_KEY = 'firebase_rest_auth';
const EXPIRY_SAFETY_MS = 60_000; // refresh 60s early

async function saveTokens(bundle: TokenBundle): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
}

async function loadTokens(): Promise<TokenBundle | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenBundle;
  } catch {
    return null;
  }
}

function isExpired(expiresAt: number): boolean {
  return Date.now() + EXPIRY_SAFETY_MS >= expiresAt;
}

async function anonymousSignUp(): Promise<TokenBundle> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${WEB_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anon signUp failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    idToken: string;
    refreshToken: string;
    expiresIn: string; // seconds string
    localId?: string;
  };
  const expiresAt = Date.now() + Number(data.expiresIn) * 1000;
  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt,
    userId: data.localId,
  };
}

async function refreshIdToken(refreshToken: string): Promise<TokenBundle> {
  const url = `https://securetoken.googleapis.com/v1/token?key=${WEB_API_KEY}`;
  const params = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    id_token: string;
    refresh_token: string;
    expires_in: string; // seconds string
    user_id?: string;
  };
  const expiresAt = Date.now() + Number(data.expires_in) * 1000;
  return {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt,
    userId: data.user_id,
  };
}

export async function signInWithEmailPassword(email: string, password: string): Promise<string> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${WEB_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Email sign-in failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    idToken: string;
    refreshToken: string;
    expiresIn: string; // seconds string
    localId?: string;
  };
  const bundle: TokenBundle = {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn) * 1000,
    userId: data.localId,
  };
  await saveTokens(bundle);
  return bundle.idToken;
}

export async function ensureAnonymous(): Promise<string> {
  const existing = await loadTokens();
  if (!existing) {
    const fresh = await anonymousSignUp();
    await saveTokens(fresh);
    return fresh.idToken;
  }
  if (isExpired(existing.expiresAt)) {
    try {
      const refreshed = await refreshIdToken(existing.refreshToken);
      await saveTokens(refreshed);
      return refreshed.idToken;
    } catch {
      const fresh = await anonymousSignUp();
      await saveTokens(fresh);
      return fresh.idToken;
    }
  }
  return existing.idToken;
}

export async function getIdToken(forceRefresh = false): Promise<string> {
  let bundle = await loadTokens();
  if (!bundle) {
    return ensureAnonymous();
  }
  if (forceRefresh || isExpired(bundle.expiresAt)) {
    try {
      bundle = await refreshIdToken(bundle.refreshToken);
      await saveTokens(bundle);
    } catch {
      bundle = await anonymousSignUp();
      await saveTokens(bundle);
    }
  }
  return bundle.idToken;
}

// Utility to clear cached tokens (optional, for logout/debug)
export async function clearCachedAuth(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

