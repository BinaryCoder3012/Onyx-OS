export interface BackendError {
  code: string;
  message: string;
  status: number;
}

export function createBackendError(
  code: string,
  message: string,
  status: number
): BackendError {
  return { code, message, status };
}
