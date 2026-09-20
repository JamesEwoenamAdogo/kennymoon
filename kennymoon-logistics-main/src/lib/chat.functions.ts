import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .max(24),
});

export const askKennymoonBot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return {
        reply:
          "Our assistant is offline for a moment. Please message us on WhatsApp at https://wa.me/2348074345865 and a human will answer right away.",
      };
    }

    const { KNOWLEDGE } = await import("./chat-knowledge.server");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "system", content: KNOWLEDGE }, ...data.messages],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      return {
        reply:
          "I couldn't reach our system just now. Send your question to us on WhatsApp at https://wa.me/2348074345865 and one of our people will reply.",
      };
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return {
      reply:
        json.choices?.[0]?.message?.content?.trim() ??
        "Sorry, I didn't catch that. Could you say it another way?",
    };
  });
