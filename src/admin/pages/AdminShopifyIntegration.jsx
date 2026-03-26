import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import {
  connectShopifyStore,
  listIntegrations,
  saveIntegrationConfig,
  syncShopifyNow,
} from '../modules/shopify/shopifyIntegrationApi';

const DEFAULT_MAPPING = {
  '123456789': 'STORE-LIS',
  '223456789': 'STORE-OPO',
  '323456789': 'STORE-FAR',
};

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export default function AdminShopifyIntegration() {
  const { adminKey, tenantSlug } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null);

  const [integrationKey, setIntegrationKey] = useState('shopify');
  const [shopDomain, setShopDomain] = useState('');
  const [adminAccessToken, setAdminAccessToken] = useState('');
  const [webhookBaseUrl, setWebhookBaseUrl] = useState('');
  const [autoRegister, setAutoRegister] = useState(true);
  const [locationMappingJson, setLocationMappingJson] = useState(
    JSON.stringify(DEFAULT_MAPPING, null, 2)
  );

  const webhookEndpoint = useMemo(() => {
    const base = webhookBaseUrl.trim().replace(/\/+$/, '');
    if (!base) return `/api/v1/webhooks/shopify/${tenantSlug}/${integrationKey}`;
    return `${base}/api/v1/webhooks/shopify/${tenantSlug}/${integrationKey}`;
  }, [webhookBaseUrl, integrationKey, tenantSlug]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listIntegrations(adminKey);
      const rows = data.items || [];
      setItems(rows);

      const current =
        rows.find((r) => r.integration_key === integrationKey) || rows.find((r) => r.integration_key === 'shopify');
      if (current?.integration_key) setIntegrationKey(current.integration_key);

      const shop = current?.config?.shopify || {};
      if (shop.shopDomain) setShopDomain(shop.shopDomain);
      if (shop.locationStoreMap) setLocationMappingJson(JSON.stringify(shop.locationStoreMap, null, 2));
    } catch (e) {
      setError(e.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveMapping() {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const parsedMap = safeJsonParse(locationMappingJson, null);
      if (!parsedMap || typeof parsedMap !== 'object' || Array.isArray(parsedMap)) {
        throw new Error('location mapping must be a valid JSON object');
      }
      await saveIntegrationConfig(adminKey, integrationKey, {
        enabled: true,
        config: {
          shopify: {
            locationStoreMap: parsedMap,
          },
        },
      });
      setSaved('Location mapping saved.');
      await load();
    } catch (e) {
      setError(e.message || 'Could not save mapping');
    } finally {
      setBusy(false);
    }
  }

  async function handleConnect() {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      await connectShopifyStore(adminKey, integrationKey, {
        shop_domain: shopDomain,
        admin_access_token: adminAccessToken,
        auto_register_webhooks: autoRegister,
        webhook_base_url: webhookBaseUrl || undefined,
      });
      setSaved('Shopify store connected.');
      await load();
    } catch (e) {
      setError(e.message || 'Could not connect store');
    } finally {
      setBusy(false);
    }
  }

  async function handleSync() {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const out = await syncShopifyNow(adminKey, integrationKey, { limit: 100, max_pages: 3 });
      setSaved(`Sync done: ${out.syncedProducts || 0} products, ${out.syncedVariants || 0} variants.`);
      await load();
    } catch (e) {
      setError(e.message || 'Could not sync');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Shopify Connector Module</h1>
      <p className="admin-lead">
        Connect one Shopify store per integration key. Your custom frontend reads products from this platform; Shopify
        updates flow in through webhooks + sync.
      </p>

      <section className="admin-card admin-shopify-field-map">
        <h2 className="admin-subtitle">Shopify product fields → this platform</h2>
        <p className="admin-help">
          Rough mapping for Admin / REST payloads. Sync and webhooks populate these tables for your React storefront.
        </p>
        <div className="admin-field-map-wrap">
          <table className="admin-field-map">
            <thead>
              <tr>
                <th>Shopify (admin)</th>
                <th>Dynamic Marketplace</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Title</td>
                <td>
                  <code>product_translations.name</code> (locales e.g. pt, es)
                </td>
              </tr>
              <tr>
                <td>Description</td>
                <td>
                  <code>product_translations.description</code>
                </td>
              </tr>
              <tr>
                <td>Media</td>
                <td>
                  <code>product_images</code> (URLs; alt in <code>product_image_translations</code>)
                </td>
              </tr>
              <tr>
                <td>Product category / collections</td>
                <td>
                  <code>categories</code> + <code>product_categories</code> (your taxonomy; link manually or extend sync)
                </td>
              </tr>
              <tr>
                <td>Price</td>
                <td>
                  <code>product_variants.price</code> (per variant); <code>products.base_price</code> as summary
                </td>
              </tr>
              <tr>
                <td>Inventory</td>
                <td>
                  <code>variant_inventory</code> by location → mapped stores; <code>inventory</code> for non-variant SKUs
                </td>
              </tr>
              <tr>
                <td>Variants (options)</td>
                <td>
                  <code>product_variants</code> with <code>option1_*</code> … <code>option3_*</code> (Shopify options)
                </td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td>
                  Checkout / CTT module (not copied from Shopify product — configure in platform + shipping rules)
                </td>
              </tr>
              <tr>
                <td>Status</td>
                <td>
                  <code>products.status</code> (<code>draft</code> / <code>published</code>)
                </td>
              </tr>
              <tr>
                <td>Metafields</td>
                <td>
                  <code>products.metadata</code> JSON (extend sync to map namespace/key as needed)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="store-muted">{saved}</p>}

      <section className="admin-card admin-shopify-grid">
        <label className="admin-field">
          <span className="store-field-label">Integration key</span>
          <input
            className="admin-input"
            value={integrationKey}
            onChange={(e) => setIntegrationKey(e.target.value.trim())}
            placeholder="e.g. shoes"
          />
        </label>

        <label className="admin-field">
          <span className="store-field-label">Shopify store URL (shop domain)</span>
          <input
            className="admin-input"
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder="client-store.myshopify.com"
          />
        </label>

        <label className="admin-field">
          <span className="store-field-label">Shopify admin access token</span>
          <input
            className="admin-input"
            value={adminAccessToken}
            onChange={(e) => setAdminAccessToken(e.target.value)}
            type="password"
            placeholder="shpat_..."
          />
        </label>

        <label className="admin-field">
          <span className="store-field-label">Backend public base URL</span>
          <input
            className="admin-input"
            value={webhookBaseUrl}
            onChange={(e) => setWebhookBaseUrl(e.target.value)}
            placeholder="https://api.yourdomain.com"
          />
        </label>

        <label className="admin-check">
          <input type="checkbox" checked={autoRegister} onChange={(e) => setAutoRegister(e.target.checked)} />
          <span>Auto-register Shopify webhooks on connect</span>
        </label>

        <label className="admin-field admin-field--full">
          <span className="store-field-label">Webhook endpoint (set in Shopify)</span>
          <input className="admin-input" value={webhookEndpoint} readOnly />
        </label>

        <label className="admin-field admin-field--full">
          <span className="store-field-label">Location mapping JSON (shopify location_id -&gt; store code)</span>
          <textarea
            className="admin-textarea"
            rows={8}
            value={locationMappingJson}
            onChange={(e) => setLocationMappingJson(e.target.value)}
          />
        </label>
      </section>

      <div className="admin-actions-row">
        <button className="btn-primary" type="button" onClick={handleConnect} disabled={busy}>
          {busy ? 'Working…' : 'Connect Store'}
        </button>
        <button className="admin-btn" type="button" onClick={handleSync} disabled={busy}>
          Sync Now
        </button>
        <button className="admin-btn" type="button" onClick={handleSaveMapping} disabled={busy}>
          Save Mapping
        </button>
        <button className="admin-btn" type="button" onClick={load} disabled={loading || busy}>
          Refresh
        </button>
      </div>

      <section className="admin-card">
        <h2 className="admin-subtitle">Integration Records</h2>
        {items.length === 0 ? (
          <p className="store-muted">No integrations yet.</p>
        ) : (
          <ul className="admin-list">
            {items.map((row) => (
              <li key={row.integration_key}>
                <strong>{row.integration_key}</strong> - {row.enabled ? 'enabled' : 'disabled'}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

