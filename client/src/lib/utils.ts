import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a given timestamp has expired based on a time duration
 * @param storedTime - timestamp in milliseconds (e.g. from Date.now())
 * @param duration - duration string like "1h", "30m", "2d"
 * @returns true if expired, false if still valid
 */
export function isExpired(storedTime: number, duration: string): boolean {
  const now = Date.now();
  const match = duration.match(/^(\d+)([hmd])$/);

  if (!match) {
    throw new Error(
      `Invalid duration format: ${duration}. Use formats like "1h", "30m", or "2d".`
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  let durationMs = 0;

  switch (unit) {
    case 'h':
      durationMs = value * 60 * 60 * 1000;
      break;
    case 'm':
      durationMs = value * 60 * 1000;
      break;
    case 'd':
      durationMs = value * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }

  return storedTime + durationMs < now;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions<TBody = unknown> {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: TBody;
  queryParams?: Record<string, string | number | boolean>;
  signal?: AbortSignal;
}

export async function fetchUtil<TResponse = unknown, TBody = unknown>(
  url: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const { method = 'GET', headers = {}, body, queryParams, signal } = options;

  // Build query string
  const queryString = queryParams
    ? '?' +
      new URLSearchParams(
        Object.entries(queryParams).reduce<Record<string, string>>(
          (acc, [key, val]) => {
            acc[key] = String(val);
            return acc;
          },
          {}
        )
      ).toString()
    : '';

  const fullUrl = url + queryString;

  const isJSON = !(
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  );

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...(isJSON && body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...(method !== 'GET'
      ? { body: isJSON ? JSON.stringify(body) : (body as BodyInit) }
      : {}),
    signal,
  };

  const res = await fetch(fullUrl, fetchOptions);

  if (!res.ok) {
    const errorText = await res.json();
    throw new Error(
      errorText.message
    );
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<TResponse>;
  }

  return res.text() as Promise<TResponse>;
}
