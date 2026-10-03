/**
 * api.js — Centralized API and Backend Configuration
 *
 * Resolves the backend URL from either:
 *   1. Runtime window.__ENV__.VITE_API_BASE_URL (if injected in Cloud Run / container)
 *   2. Build-time import.meta.env.VITE_API_BASE_URL (Vite env variable)
 *   3. Empty string '' (falls back to relative path for Vite dev proxy)
 */

const runtimeBase = typeof window !== 'undefined' && window.__ENV__?.VITE_API_BASE_URL;
const buildBase = import.meta.env.VITE_API_BASE_URL;

export const BACKEND_URL = (runtimeBase || buildBase || '').replace(/\/+$/, '');
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';
export const DATA_BASE = BACKEND_URL ? `${BACKEND_URL}/data` : '/data';

/**
 * Resolves an API path (e.g., '/api/generate' or '/orders') to the full or relative URL.
 */
export function getApiUrl(path = '') {
  if (!path) return API_BASE;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean.startsWith('/api/')) {
    return BACKEND_URL ? `${BACKEND_URL}${clean}` : clean;
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
    return BACKEND_URL ? `${BACKEND_URL}/${clean}` : `/${clean}`;
  }
  return `${DATA_BASE}/${clean}`;
}
