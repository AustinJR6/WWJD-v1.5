import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

const PROJECT_ID: string = process.env.PROJECT_ID ?? '';
const REGION: string = process.env.REGION ?? '';
const GEMINI_MODEL: string = process.env.GEMINI_MODEL ?? '';

export async function generateResponse(prompt: string): Promise<string> {
  if (!PROJECT_ID || !REGION || !GEMINI_MODEL) {
    throw new Error('PROJECT_ID, REGION, and GEMINI_MODEL must be set');
  }

  const vertexAi = new VertexAI({ project: PROJECT_ID, location: REGION });
  const model = vertexAi.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const reply = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply ?? '';
}

export default generateResponse;
