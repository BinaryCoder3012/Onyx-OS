import "server-only";
import type { z } from "zod";

/**
 * Thin client for the Ollama chat API (Ollama Cloud by default).
 * The key never leaves the server; route handlers are the only callers.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const HOST = (process.env.OLLAMA_HOST || "https://ollama.com").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b";

export class AIUnavailableError extends Error {
  constructor(message = "OLLAMA_API_KEY is not set on the server.") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

function headers(): HeadersInit {
  const key = process.env.OLLAMA_API_KEY;
  const isCloud = HOST.includes("ollama.com");
  if (isCloud && !key) throw new AIUnavailableError();
  return {
    "Content-Type": "application/json",
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}

async function post(body: Record<string, unknown>, signal?: AbortSignal) {
  const res = await fetch(`${HOST}/api/chat`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: MODEL, ...body }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}: ${text.slice(0, 300)}`);
  }
  return res;
}

/** Streams only the answer text (thinking tokens are dropped). */
export async function streamChat(messages: ChatMessage[], signal?: AbortSignal) {
  const res = await post({ messages, stream: true, think: "low" }, signal);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    // Keep reading until there is answer text to hand on: chunks that carry only thinking
    // tokens enqueue nothing, and a pull that enqueues nothing is not called again.
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        let sent = false;
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as { message?: { content?: string }; error?: string };
            if (chunk.error) throw new Error(chunk.error);
            const text = chunk.message?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
              sent = true;
            }
          } catch (err) {
            controller.error(err);
            return;
          }
        }
        if (sent) return;
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

/** Pulls the first JSON object out of a reply, tolerating code fences and stray prose. */
function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The model did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

/**
 * Asks for JSON matching `schema`. The cloud models ignore Ollama's schema-constrained
 * `format`, so the shape is described in the prompt, validated with zod, and retried once
 * with the validation error fed back.
 */
export async function chatJson<T>(
  schema: z.ZodType<T>,
  system: string,
  user: string,
  shape: string,
): Promise<T> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${system}\n\nReply with one JSON object only, no prose and no code fences. Shape:\n${shape}`,
    },
    { role: "user", content: user },
  ];

  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await post({ messages, stream: false, format: "json", think: "low" });
    const data = (await res.json()) as { message?: { content?: string } };
    const raw = data.message?.content ?? "";
    try {
      return schema.parse(extractJson(raw));
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      messages.push(
        { role: "assistant", content: raw },
        { role: "user", content: `That reply did not match the shape (${lastError.slice(0, 400)}). Send the corrected JSON only.` },
      );
    }
  }
  throw new Error(`The model returned an unusable answer: ${lastError.slice(0, 200)}`);
}

export const aiModelName = MODEL;
