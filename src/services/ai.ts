import { getIdToken, ensureAnon } from '../lib/firebase';

const REGION = 'us-central1'; // change if you deployed to a different region
const PROJECT_ID = '<YOUR_FIREBASE_PROJECT_ID>'; // e.g. wwjd-app-188fe
const API_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/askJesus`;

export async function askJesus(message: string): Promise<string> {
  await ensureAnon();
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
