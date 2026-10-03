/**
 * api.js — Centralized API and Backend Configuration
 *
 * Configurable via Vite environment variable `VITE_API_BASE_URL`.
 * In local dev without the variable, it defaults to '' so requests use
 * the Vite dev proxy (/api -> http://localhost:3001 and /data -> http://localhost:3001).
 * When deployed to production pointing to a standalone backend, set:
 *   VITE_API_BASE_URL=https://your-backend-api.com
 */

export const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const API_BASE = `${BACKEND_URL}/api`;
export const DATA_BASE = `${BACKEND_URL}/data`;

/**
 * Resolves an API path (e.g., '/api/generate' or '/orders') to the full or relative URL.
 */
export function getApiUrl(path = '') {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/api/')) {
    return `${BACKEND_URL}${clean}`;
  }
  if (clean === '/api') {
    return API_BASE;
  }
  return `${API_BASE}${clean}`;
}

/**
 * Resolves static uploaded order assets (original photos, previews, sequence files).
 */
export function getDataUrl(filePath = '') {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  const clean = filePath.replace(/^\/+/, '');
  if (clean.startsWith('data/')) {
    return `${BACKEND_URL}/${clean}`;
  }
  return `${DATA_BASE}/${clean}`;
}
