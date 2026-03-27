/**
 * Default API when the storefront is on Vercel `*.vercel.app` but `vercel.json` rewrites
 * are missing (e.g. monorepo root deploy without root vercel.json). Override anytime with
 * VITE_API_BASE_URL; use that env for a custom production domain on Vercel too.
 */
const DEFAULT_VERCEL_API_ORIGIN = 'https://marketplace-erp-bruno.onrender.com';

/**
 * Backend API prefix. Use empty VITE_API_BASE_URL in dev so requests stay same-origin
 * and Vite's /api proxy forwards to the Node server.
 * If you set VITE_API_BASE_URL, use the API origin only — either `http://localhost:4000`
 * or `http://localhost:4000/api/v1` (both are accepted; we never double-append /api/v1).
 */
function apiBase() {
  const raw = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (raw) {
    let root = raw.replace(/\/+$/, '');
    if (/\/api\/v1$/i.test(root)) return root;
    return `${root}/api/v1`;
  }
  if (typeof window !== 'undefined' && /\.vercel\.app$/i.test(window.location.hostname)) {
    return `${DEFAULT_VERCEL_API_ORIGIN.replace(/\/+$/, '')}/api/v1`;
  }
  return '/api/v1';
}

function defaultTenantSlug() {
  return import.meta.env.VITE_DEFAULT_TENANT_SLUG || 'default';
}

/**
 * @param {string} path - e.g. "/products" or "?locale=pt"
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init) {
  const base = apiBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'X-Tenant-Slug': defaultTenantSlug(),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path, body, init = {}) {
  return apiFetch(path, {
    ...init,
    method: 'POST',
    body: JSON.stringify(body ?? {}),
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export async function apiPatch(path, body, init = {}) {
  return apiFetch(path, {
    ...init,
    method: 'PATCH',
    body: JSON.stringify(body ?? {}),
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export async function apiDelete(path, init = {}) {
  return apiFetch(path, { ...init, method: 'DELETE' });
}
