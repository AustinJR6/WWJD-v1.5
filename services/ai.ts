import { auth } from '../utils/auth';

export async function askJesus(message: string): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const idToken = await user.getIdToken();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('Missing Firebase project ID');
  }
  const res = await fetch(
    `https://us-central1-${projectId}.cloudfunctions.net/askJesus`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  const data = await res.json();
  return data.reply as string;
}
