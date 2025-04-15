import { buildProductPrompt } from "@/lib/productPromptBuilder";

export async function POST(req) {
  const { prompt } = await req.json();

  const systemPrompt = await buildProductPrompt(5);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    }),
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

  return new Response(answer);
}