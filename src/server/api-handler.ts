import { apiError } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import type { ZodSchema } from "zod";

type RouteContext = { params: Promise<Record<string, string>> };

type RouteHandler<TBody = unknown> = (
  request: Request,
  context: { body: TBody; params: Record<string, string> }
) => Promise<Response>;

interface HandlerConfig<TBody> {
  schema?: ZodSchema<TBody>;
  handler: RouteHandler<TBody>;
}

export function createApiHandler<TBody = unknown>(config: HandlerConfig<TBody>) {
  return async (
    request: Request,
    segmentData: RouteContext
  ): Promise<Response> => {
    try {
      const params = await segmentData.params;
      let body = undefined as TBody;

      if (config.schema && request.method !== "GET") {
        const raw = await request.json();
        const parsed = config.schema.safeParse(raw);
        if (!parsed.success) {
          return apiError(ERROR_CODES.VALIDATION_ERROR, parsed.error.message, 422);
        }
        body = parsed.data;
      }

      return await config.handler(request, { body: body as TBody, params });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      return apiError(ERROR_CODES.INTERNAL_ERROR, message, 500);
    }
  };
}
