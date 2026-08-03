const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const TOKEN_STORAGE_KEY = 'worklink.ops.accessToken';

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(
  handler: () => void,
) {
  onUnauthorized = handler;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    setAccessToken(null);
    onUnauthorized?.();
  }

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data
        ? String(data.message)
        : `API request failed (${response.status})`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
