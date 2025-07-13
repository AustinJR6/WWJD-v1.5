import * as functions from 'firebase-functions';
import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.REGION || 'us-central1';
const GEMINI_MODEL = process.env.MODEL || 'gemini-pro';

const vertexAi = new VertexAI({ region: REGION } as any);

export const generateGemini = functions.https.onCall(async (data, context) => {
  const prompt = data.prompt;
  if (!prompt) {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt is required.');
  }

  const model = (vertexAi as any).getModel
    ? (vertexAi as any).getModel({ model: GEMINI_MODEL })
    : (vertexAi as any).getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return { text: result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '' };
});
