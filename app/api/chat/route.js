import { OpenAIStream, StreamingTextResponse } from 'ai';

// Replace this with your actual OpenAI API key from Vercel env
const apiKey = process.env.OPENAI_API_KEY;

export async function POST(req) {
  const { prompt } = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      stream: true,
      messages: [{ role: 'system', content: 'You are a helpful sales assistant for Microminimus.' }, { role: 'user', content: prompt }],
    }),
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
