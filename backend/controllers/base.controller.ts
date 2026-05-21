import type { APIResponse } from "@/types";

export abstract class BaseController {
  protected success<T>(data: T): APIResponse<T> {
    return {
      success: true,
      data,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now().toString(36)}`,
      },
    };
  }
}
