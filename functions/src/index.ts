import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { generateWithGemini } from './gemini';

admin.initializeApp(); // Project/credentials auto in Gen 2

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Verify Firebase ID token from Authorization: Bearer <token>
async function verifyToken(req: Request): Promise<string> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) throw new Error('Missing Authorization header');
  const idToken = authHeader.split('Bearer ')[1];
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded.uid;
}

// Support both hitting root (Cloud Run base) and '/askJesus' (Functions alias)
app.post(['/', '/askJesus'], async (req: Request, res: Response) => {
  try {
    const uid = await verifyToken(req);
    const { message } = req.body as { message?: string };
    if (!message) return res.status(400).json({ error: 'Message required' });

    const reply = await generateWithGemini(message);

    const db = admin.firestore();
    const ref = db.collection('users').doc(uid).collection('messages');
    await ref.add({ text: message, from: 'user', timestamp: Date.now() });
    await ref.add({ text: reply, from: 'ai', timestamp: Date.now() });

    return res.json({ reply });
  } catch (err: any) {
    const code = err?.message?.includes('Authorization') ? 401 : 500;
    return res.status(code).json({ error: err?.message || 'Internal server error' });
  }
});

// Export the Express app as an HTTPS function (Gen 2)
export const askJesus = functions.https.onRequest(
  { memory: '512MiB', timeoutSeconds: 60 },
  app
);
