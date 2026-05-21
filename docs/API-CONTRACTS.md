# Onyx OS — API & Type Contracts

## Standard API response

```typescript
interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: APIError | null;
  meta: APIMeta;
}

interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface APIMeta {
  timestamp: string;  // ISO 8601
  requestId: string;  // e.g. req_lxyz_abc123
}
```

### Success example

```json
{
  "success": true,
  "data": { "status": "profile_module_ready" },
  "error": null,
  "meta": {
    "timestamp": "2026-05-18T13:00:00.000Z",
    "requestId": "req_m3k9x2a_7f4b2c1"
  }
}
```

### Error example

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_IMPLEMENTED",
    "message": "Authentication not yet implemented"
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

## Error codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 422 | Zod validation failed |
| `UNAUTHORIZED` | 401 | Missing auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource missing |
| `NOT_IMPLEMENTED` | 501 | Stub route |
| `INTERNAL_ERROR` | 500 | Unhandled exception |
| `AI_EXECUTION_FAILED` | — | AI service error (in AIResponse) |

Defined in: `src/lib/errors.ts`

---

## AI response

```typescript
interface AIResponse<T> {
  success: boolean;
  data: T | null;
  error: AIError | null;
  usage: AIUsage;
}

interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}

interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  model: string;
}
```

### AI schemas (built-in)

```typescript
aiSchemas.textResponse        // { content: string }
aiSchemas.structuredAnalysis  // { score: 0-100, insights: string[] }
```

---

## Domain types (summary)

See `src/types/index.ts` for full definitions.

| Type | Key fields |
|------|------------|
| `User` | id, email, displayName, avatarUrl, isDeleted |
| `OnyxContext` | userId, activeModule, preferences, onboardingComplete |
| `DSAVault` | problemsSolved, topicsMastered[], streakDays, metadata |
| `PlatformProfile` | leetcode/codeforces/github handles, ratings JSON |
| `StudySession` | moduleId, durationMinutes, focusScore, startedAt/endedAt |
| `OnyxModuleId` | union of 9 module string literals |

All domain entities include: `createdAt`, `updatedAt`, `isDeleted`

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | For DB ops | PostgreSQL connection string |
| `NODE_ENV` | No | development \| production \| test |
| `AI_PROVIDER` | No | gemini \| openai \| claude |
| `GEMINI_API_KEY` | No | Gemini API key |
| `OPENAI_API_KEY` | No | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | Claude API key |

Validated via `getEnv()` in `src/config/env.ts`

---

## Route handler pattern

```typescript
import { createApiHandler } from "@/server/api-handler";
import { apiSuccess } from "@/lib/api-response";
import { z } from "zod";

const bodySchema = z.object({ name: z.string() });

export const POST = createApiHandler({
  schema: bodySchema,
  handler: async (_req, { body, params }) => {
    return apiSuccess({ received: body.name });
  },
});
```

---

## Auth placeholder

`withAuth(handler, required?)` checks header `x-user-id`.
Real auth should replace this with session validation.
