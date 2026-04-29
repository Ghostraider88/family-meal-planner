// Single fetch wrapper used by the rest of the app. Centralizes:
// - Same-origin /api base (works in dev via Vite proxy and in prod via Nginx)
// - Authorization header injection
// - JSON parsing with safe error reporting
// - 401 handling: triggers a single, debounced logout via the supplied handler
//
// Tokens are kept in localStorage today. This module is the single chokepoint
// where a future migration to httpOnly cookie auth would happen.

const BASE = import.meta.env.VITE_API_URL || '/api';

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const TOKEN_KEY = 'token';
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (value) => {
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
};

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api/')) return path; // already absolute
  if (path.startsWith('/')) return `${BASE}${path}`;
  return `${BASE}/${path}`;
};

const parse = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text.slice(0, 500) };
  }
};

/**
 * Core request wrapper.
 * @param {string} path  e.g. "/recipes" or "/api/recipes"
 * @param {RequestInit & { token?: string, json?: unknown, skipAuth?: boolean }} options
 */
export const request = async (path, options = {}) => {
  const { token, json, skipAuth, headers, ...rest } = options;
  const finalHeaders = new Headers(headers || {});

  if (json !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const authToken = token ?? getStoredToken();
  if (authToken && !skipAuth) {
    finalHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (res.status === 401 && !skipAuth && onUnauthorized) {
    // Best-effort signal — do not loop on a stale token
    try { onUnauthorized(); } catch { /* swallow */ }
  }

  const data = await parse(res);
  if (!res.ok) {
    const message = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
};

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', json: body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', json: body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
