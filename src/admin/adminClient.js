import { apiFetch } from '../api/client';

/** Synced from AdminAuthProvider — sent as X-Tenant-Slug on admin API calls. */
let tenantSlugState = 'default';

export function setAdminTenantSlug(slug) {
  tenantSlugState = String(slug || 'default').trim() || 'default';
}

export function getAdminTenantSlug() {
  return tenantSlugState;
}

/**
 * Calls that must not send a tenant header (e.g. GET /admin/tenants).
 */
export function apiAdminFetchNoTenant(path, adminKey, init) {
  if (!adminKey) throw new Error('Missing admin key');
  return apiFetch(path, {
    ...(init || {}),
    headers: {
      'X-Admin-Key': adminKey,
      ...(init?.headers || {}),
    },
  });
}

export function apiAdminFetch(path, adminKey, init) {
  if (!adminKey) throw new Error('Missing admin key');
  return apiFetch(path, {
    ...(init || {}),
    headers: {
      'X-Admin-Key': adminKey,
      'X-Tenant-Slug': tenantSlugState,
      ...(init?.headers || {}),
    },
  });
}
