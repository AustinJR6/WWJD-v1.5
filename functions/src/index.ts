import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { generateOpenAI, generateWithOpenAI } from './openai';

const FIREBASE_API_KEY = functions.config().firebase?.api_key;

admin.initializeApp(); // Let Firebase inject project info

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

async function getReply(message: string): Promise<string> {
  return generateWithOpenAI(message);
}

async function signInWithCustomToken(customToken: string): Promise<string> {
  if (!FIREBASE_API_KEY) {
    throw new Error('Firebase API key not configured');
  }
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error?.message || 'Authentication failed');
  }
  return data.idToken as string;
}

app.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const user = await admin.auth().createUser({ email, password });
    const customToken = await admin.auth().createCustomToken(user.uid);
    const idToken = await signInWithCustomToken(customToken);
    res.json({ token: idToken });
  } catch (err: any) {
    console.error('signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    if (!FIREBASE_API_KEY) {
      res.status(500).json({ error: 'Firebase API key not configured' });
      return;
    }
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      res.status(400).json({ error: data.error?.message || 'Login failed' });
      return;
    }
    res.json({ token: data.idToken });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/askJesus', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const { message } = req.body as { message?: string };

    if (!message) {
      res.status(400).json({ error: 'Message required' });
      return;
    }

    const reply = await getReply(message);

    const db = admin.firestore();
    const ref = db.collection('users').doc(uid).collection('messages');
    await ref.add({ text: message, from: 'user', timestamp: Date.now() });
    await ref.add({ text: reply, from: 'ai', timestamp: Date.now() });

    res.json({ reply });
  } catch (err) {
    console.error('askJesus error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the Express server when running on Cloud Run. PORT defaults to 8080.
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export { generateOpenAI };
