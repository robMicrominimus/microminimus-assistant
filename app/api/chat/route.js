// /app/api/chat/route.js
import { buildProductPrompt } from "../../../lib/productPromptBuilder";

export const runtime = "edge";

export async function POST(req) {
  const { prompt } = await req.json();
  const systemPrompt = await buildProductPrompt(5);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partial += decoder.decode(value, { stream: true });

        const lines = partial.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const json = line.replace("data:", "").trim();
            if (json === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const { choices } = JSON.parse(json);
              const text = choices?.[0]?.delta?.content || "";
              controller.enqueue(encoder.encode(text));
            } catch (e) {
              console.error("Stream parsing error", e);
            }
          }
        }

        partial = lines.at(-1) || "";
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
