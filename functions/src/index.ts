import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const systemPrompt =
  "You are responding as Jesus would—calm, loving, and wise. Reference scripture, speak with compassion, and guide users with biblical truths. Do not use slang or modern language. Stay rooted in Christ's teachings without claiming to be God directly.";

async function verifyToken(req: Request): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  const idToken = authHeader.split(' ')[1];
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded.uid;
}

async function getReply(message: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || functions.config().openai?.key;
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  const reply = response.data.choices?.[0]?.message?.content;
  if (!reply) throw new Error('No response from OpenAI');
  return reply.trim();
}

app.post('/askJesus', async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  let uid: string;
  try {
    uid = await verifyToken(req);
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const reply = await getReply(message);
    const userMessages = admin
      .firestore()
      .collection('users')
      .doc(uid)
      .collection('messages');

    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    await userMessages.add({ text: message, from: 'user', timestamp });
    await userMessages.add({ text: reply, from: 'ai', timestamp });

    res.json({ reply });
  } catch (err) {
    console.error('askJesus error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export const askJesus = functions.https.onRequest(app);
