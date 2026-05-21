import type { APIResponse } from "@/types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = (await res.json()) as APIResponse<T>;

  if (!json.success || json.data === null) {
    throw new ApiClientError(
      json.error?.message ?? "Request failed",
      json.error?.code ?? "UNKNOWN",
      res.status
    );
  }

  return json.data;
}
