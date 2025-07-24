import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { generateGemini, generateWithGemini } from './gemini';

dotenv.config();

admin.initializeApp(); // Let Firebase inject project info

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

async function getReply(message: string): Promise<string> {
  return generateWithGemini(message);
}

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

export const askJesus = functions.https.onRequest(
  {
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  app
);

export { generateGemini };
