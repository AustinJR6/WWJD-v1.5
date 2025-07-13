import * as functions from 'firebase-functions'
import { VertexAI } from '@google-cloud/vertexai'
import * as dotenv from 'dotenv'

dotenv.config()

const PROJECT_ID = process.env.PROJECT_ID || process.env.GCLOUD_PROJECT
const REGION = process.env.REGION || 'us-central1'
const MODEL = process.env.MODEL || 'gemini-pro'

const vertexAI = new VertexAI({ project: PROJECT_ID, location: REGION })
const generativeModel = vertexAI.getGenerativeModel({ model: MODEL })

export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  })

  return (
    result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
  )
}

export const generateGemini = functions.https.onCall(async (data) => {
  const prompt = data.prompt
  if (!prompt) {
    throw new functions.https.HttpsError('invalid-argument', 'Prompt is required.')
  }
  const text = await generateWithGemini(prompt)
  return { text }
})
