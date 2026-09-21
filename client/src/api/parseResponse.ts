import type { ApiErrorResponse } from "../types/auth";
import { clearToken } from "./authToken";

export async function parseResponse<T>(res: Response): Promise<T> {
  // 204 No Content (an unsave) has no body to read.
  if (res.status === 204) {
    return undefined as T;
  }

  // A crashed server or a proxy can answer with HTML, so never assume JSON.
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // leave data as null
  }

  if (res.ok) {
    return data as T;
  }

  // An expired or invalid token must not linger in localStorage.
  if (res.status === 401) {
    clearToken();
  }

  const message = (data as ApiErrorResponse | null)?.message;
  throw new Error(message || `Request failed (${res.status})`);
}
