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
  try {
    console.log('Incoming request to /askJesus');

    const authHeader = req.headers.authorization || '';
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.warn('Missing token');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log('Verifying token');
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const message = req.body.message;

    console.log('User ID:', uid);
    console.log('Message:', message);

    if (!message) {
      console.warn('Missing message body');
      res.status(400).json({ error: 'Message required' });
      return;
    }

    console.log('Calling OpenAI');
    const reply = await getReply(message);
    console.log('AI Reply:', reply);

    console.log('Writing messages to Firestore');
    const db = admin.firestore();
    const ref = db.collection('users').doc(uid).collection('messages');
    await ref.add({ text: message, from: 'user', timestamp: Date.now() });
    await ref.add({ text: reply, from: 'ai', timestamp: Date.now() });

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Error in askJesus:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export const askJesus = functions.https.onRequest(app);
