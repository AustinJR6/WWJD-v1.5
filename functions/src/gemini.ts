import * as functions from 'firebase-functions';
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

const PROJECT_ID = process.env.GCLOUD_PROJECT!;
const LOCATION = 'us-central1'; // or your preferred region
const MODEL = 'gemini-1.5-pro-preview-0409';

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

const generativeModel = new GenerativeModel({
  model: MODEL,
  project: PROJECT_ID,
  location: LOCATION,
});

export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await generativeModel.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  return result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// Optional callable function for Firebase if you need it
export const generateGemini = functions.https.onCall(async (data) => {
  const prompt = data.prompt || '';
  const response = await generateWithGemini(prompt);
  return { result: response };
});
