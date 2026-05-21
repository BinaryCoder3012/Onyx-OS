import { getEnv } from "@/config/env";
import { ERROR_CODES } from "@/lib/errors";
import type { AIError, AIResponse } from "@/types";
import { z, type ZodSchema } from "zod";
import {
  createAnthropicAdapter,
  createGeminiAdapter,
  createOpenAIAdapter,
  createStubAdapter,
  type ProviderAdapter,
} from "./ai/providers";

export type AIProvider = "gemini" | "openai" | "claude";

export interface AIPromptConfig<T> {
  system: string;
  user: string;
  schema: ZodSchema<T>;
  model?: string;
  maxRetries?: number;
}

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 500;

function createError(code: string, message: string, retryable: boolean): AIError {
  return { code, message, retryable };
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveProvider(): ProviderAdapter {
  const env = getEnv();
  const provider = env.AI_PROVIDER ?? "gemini";

  if (provider === "gemini" && env.GEMINI_API_KEY) {
    return createGeminiAdapter(env.GEMINI_API_KEY);
  }
  if (provider === "openai" && env.OPENAI_API_KEY) {
    return createOpenAIAdapter(env.OPENAI_API_KEY);
  }
  if (provider === "claude" && env.ANTHROPIC_API_KEY) {
    return createAnthropicAdapter(env.ANTHROPIC_API_KEY);
  }

  return createStubAdapter(provider);
}

export function buildPrompt<T>(
  system: string,
  user: string,
  schema: ZodSchema<T>
): AIPromptConfig<T> {
  return { system, user, schema };
}

export async function executeAI<T>(config: AIPromptConfig<T>): Promise<AIResponse<T>> {
  const adapter = resolveProvider();
  const maxRetries = config.maxRetries ?? DEFAULT_RETRIES;
  let lastError: AIError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { raw, usage } = await adapter.complete(
        config.system,
        config.user,
        config.model
      );
      const parsed = JSON.parse(raw) as unknown;
      const validated = config.schema.parse(parsed);

      return { success: true, data: validated, error: null, usage };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown AI error";
      lastError = createError(
        ERROR_CODES.AI_EXECUTION_FAILED,
        message,
        attempt < maxRetries - 1
      );
      if (attempt < maxRetries - 1) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  return {
    success: false,
    data: null,
    error:
      lastError ??
      createError(ERROR_CODES.AI_EXECUTION_FAILED, "Execution failed", false),
    usage: { promptTokens: 0, completionTokens: 0, model: "unknown" },
  };
}

export const aiSchemas = {
  textResponse: z.object({ content: z.string() }),
  structuredAnalysis: z.object({
    score: z.number().min(0).max(100),
    insights: z.array(z.string()),
  }),
};
