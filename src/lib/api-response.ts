import { ERROR_CODES, type ErrorCode } from "@/lib/errors";
import type { APIError, APIMeta, APIResponse } from "@/types";
import { generateId } from "@/utils/id";

function buildMeta(): APIMeta {
  return {
    timestamp: new Date().toISOString(),
    requestId: generateId("req"),
  };
}

export function apiSuccess<T>(data: T, status = 200): Response {
  const body: APIResponse<T> = {
    success: true,
    data,
    error: null,
    meta: buildMeta(),
  };
  return Response.json(body, { status });
}

export function apiError(
  code: ErrorCode | string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): Response {
  const error: APIError = { code, message, details };
  const body: APIResponse<null> = {
    success: false,
    data: null,
    error,
    meta: buildMeta(),
  };
  return Response.json(body, { status });
}

export { ERROR_CODES };
