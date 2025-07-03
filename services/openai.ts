import 'dotenv/config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const SYSTEM_PROMPT =
  'You are responding as Jesus would—calm, loving, and wise. Reference scripture, speak with compassion, and guide users with biblical truths. Do not use slang or modern language. Stay rooted in Christ\u2019s teachings without claiming to be God directly.';

export async function askJesus(message: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`OpenAI request failed: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
