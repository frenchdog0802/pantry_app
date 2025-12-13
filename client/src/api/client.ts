/// <reference types="vite/client" />
import type { ApiResponse } from './types';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';  // Uses proxy to /api

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const stored = localStorage.getItem('jwt');
    let token = '';
    if (stored) {
        try {
            token = JSON.parse(stored);
        } catch {
            token = stored;
        }
    }

    const headers = new Headers(options.headers);
    if (options.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        headers,
        ...options,
    });
    let responseBody: ApiResponse<T>;
    try {
        responseBody = (await res.json()) as ApiResponse<T>;
    } catch {
        // Fallback for non-JSON responses
        const text = await res.text().catch(() => '');
        throw new Error(`API ${options.method ?? 'GET'} ${path} failed: ${res.status} ${text}`);
    }
    return responseBody;
}
export default request;

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
