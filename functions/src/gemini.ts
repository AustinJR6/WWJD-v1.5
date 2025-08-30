import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.PROJECT_ID;
const LOCATION = process.env.REGION || 'us-central1';
const MODEL = process.env.MODEL || 'gemini-1.5-pro';

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

const generativeModel = vertexAI.getGenerativeModel({
  model: MODEL,
  generationConfig: {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 2048,
  },
});

export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  return result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}
