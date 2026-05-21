import type { AIUsage } from "@/types";

export type AIProvider = "gemini" | "openai" | "claude";

export interface ProviderCompletionResult {
  raw: string;
  usage: AIUsage;
}

export interface ProviderAdapter {
  readonly name: AIProvider;
  complete(system: string, user: string, model?: string): Promise<ProviderCompletionResult>;
}

// ── Gemini ────────────────────────────────────────────────────────────

const GEMINI_DEFAULT_MODEL = "gemini-1.5-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function createGeminiAdapter(apiKey: string): ProviderAdapter {
  return {
    name: "gemini",
    async complete(system, user, model = GEMINI_DEFAULT_MODEL) {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        candidates: { content: { parts: { text: string }[] } }[];
        usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
      };

      const raw = json.candidates[0]?.content?.parts[0]?.text ?? "{}";
      const meta = json.usageMetadata;

      return {
        raw,
        usage: {
          promptTokens: meta?.promptTokenCount ?? 0,
          completionTokens: meta?.candidatesTokenCount ?? 0,
          model,
        },
      };
    },
  };
}

// ── OpenAI ────────────────────────────────────────────────────────────

const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_BASE = "https://api.openai.com/v1";

export function createOpenAIAdapter(apiKey: string): ProviderAdapter {
  return {
    name: "openai",
    async complete(system, user, model = OPENAI_DEFAULT_MODEL) {
      const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        choices: { message: { content: string } }[];
        usage?: { prompt_tokens: number; completion_tokens: number };
        model: string;
      };

      const raw = json.choices[0]?.message?.content ?? "{}";

      return {
        raw,
        usage: {
          promptTokens: json.usage?.prompt_tokens ?? 0,
          completionTokens: json.usage?.completion_tokens ?? 0,
          model: json.model,
        },
      };
    },
  };
}

// ── Anthropic ─────────────────────────────────────────────────────────

const ANTHROPIC_DEFAULT_MODEL = "claude-3-haiku-20240307";
const ANTHROPIC_BASE = "https://api.anthropic.com/v1";

export function createAnthropicAdapter(apiKey: string): ProviderAdapter {
  return {
    name: "claude",
    async complete(system, user, model = ANTHROPIC_DEFAULT_MODEL) {
      const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Anthropic ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        content: { type: string; text: string }[];
        usage?: { input_tokens: number; output_tokens: number };
        model: string;
      };

      const raw = json.content.find((b) => b.type === "text")?.text ?? "{}";

      return {
        raw,
        usage: {
          promptTokens: json.usage?.input_tokens ?? 0,
          completionTokens: json.usage?.output_tokens ?? 0,
          model: json.model,
        },
      };
    },
  };
}

// ── Stub fallback ─────────────────────────────────────────────────────

export function createStubAdapter(name: AIProvider): ProviderAdapter {
  return {
    name,
    async complete() {
      return {
        raw: "{}",
        usage: { promptTokens: 0, completionTokens: 0, model: `${name}-stub` },
      };
    },
  };
}
