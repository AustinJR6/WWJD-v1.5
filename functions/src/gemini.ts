import * as functions from 'firebase-functions';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const vertexAi = new VertexAI({
  project: process.env.PROJECT_ID,
  location: 'us-central1',
});

const model = vertexAi.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    maxOutputTokens: 500,
    temperature: 0.7,
    topP: 0.8,
  },
});

app.post('/gemini', async (req: Request, res: Response) => {
  const message: string = req.body.message;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });
    const reply =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export const geminiReply = functions.https.onRequest(app);
