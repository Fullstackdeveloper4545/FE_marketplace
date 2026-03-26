import { apiAdminFetch } from '../../adminClient';

export async function listIntegrations(adminKey) {
  return apiAdminFetch('/admin/integrations', adminKey);
}

export async function saveIntegrationConfig(adminKey, integrationKey, payload) {
  return apiAdminFetch(`/admin/integrations/${encodeURIComponent(integrationKey)}`, adminKey, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function connectShopifyStore(adminKey, integrationKey, payload) {
  return apiAdminFetch(
    `/admin/integrations/${encodeURIComponent(integrationKey)}/shopify/connect`,
    adminKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    }
  );
}

export async function syncShopifyNow(adminKey, integrationKey, payload = {}) {
  return apiAdminFetch(`/admin/integrations/${encodeURIComponent(integrationKey)}/shopify/sync`, adminKey, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

