import { getIdToken, ensureAnonymous } from '../lib/firebaseAuth';

// Prefer Cloud Run/Functions base URL from env; fallback to Functions alias
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const FALLBACK_FN_URL = `https://us-central1-${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net`;
const API_URL = `${API_BASE || FALLBACK_FN_URL}/askJesus`;

export async function askJesus(message: string): Promise<string> {
  await ensureAnonymous();
  const token = await getIdToken();

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Server error: ${res.status} ${text || ''}`.trim());
  }

  const data = (await res.json()) as { reply: string };
  return data.reply;
}
