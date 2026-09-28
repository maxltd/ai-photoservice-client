import { ApiError, type ApiErrorCode, type ApiErrorResponse } from '@/lib/api/contract';

interface RequestOptions {
  headers?: HeadersInit;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) {
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  if (API_BASE_URL) {
    return url.toString();
  }

  return `${url.pathname}${url.search}`;
}

function getErrorFromResponse(status: number, payload: unknown): ApiError {
  const fallbackCode: ApiErrorCode = status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR';

  if (payload && typeof payload === 'object' && 'error' in payload) {
    const errorPayload = payload as ApiErrorResponse;
    return new ApiError(
      errorPayload.error.code ?? fallbackCode,
      errorPayload.error.message ?? 'Request failed',
      status,
      errorPayload.error.details,
    );
  }

  return new ApiError(fallbackCode, 'Request failed', status);
}

async function request<TResponse>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options?: RequestOptions,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<TResponse> {
  const headers = new Headers(options?.headers);

  if (!(body instanceof FormData) && body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.idempotencyKey) {
    headers.set('Idempotency-Key', options.idempotencyKey);
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    credentials: 'include',
    headers,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    signal: options?.signal,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const hasJson = contentType.includes('application/json');
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    throw getErrorFromResponse(response.status, payload);
  }

  return payload as TResponse;
}

export async function apiGet<TResponse>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>('GET', path, options, undefined, params);
}

export async function apiPost<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>('POST', path, options, body);
}

export async function apiPatch<TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>('PATCH', path, options, body);
}

export async function apiDelete<TResponse = void>(path: string, options?: RequestOptions): Promise<TResponse> {
  return request<TResponse>('DELETE', path, options);
}

export async function apiUpload<TResponse>(
  path: string,
  formData: FormData,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>('POST', path, options, formData);
}
