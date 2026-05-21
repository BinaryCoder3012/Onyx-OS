import { apiError } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";

type AuthenticatedHandler = (
  request: Request,
  context: { userId: string | null }
) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler, required = false) {
  return async (request: Request): Promise<Response> => {
    const userId = request.headers.get("x-user-id");

    if (required && !userId) {
      return apiError(ERROR_CODES.UNAUTHORIZED, "Authentication required", 401);
    }

    return handler(request, { userId });
  };
}
