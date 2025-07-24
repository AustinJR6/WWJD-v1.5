import * as functions from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

dotenv.config();

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.PROJECT_ID || 'your-fallback-project-id';
const LOCATION = process.env.REGION || 'us-central1';
const MODEL = process.env.MODEL || 'gemini-1.5-pro-preview-0409';

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

// 🔮 Core generation logic
export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    return (
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    );
  } catch (err) {
    console.error('[Gemini] Generation error:', err);
    return '[Error generating response]';
  }
}

// 🔄 Optional callable wrapper (for direct client-side calls)
type GeminiInput = { prompt?: string };

export const generateGemini = onCall<GeminiInput>(async (request) => {
  const prompt = request.data.prompt ?? '';
  const result = await generateWithGemini(prompt);
  return { result };
});
