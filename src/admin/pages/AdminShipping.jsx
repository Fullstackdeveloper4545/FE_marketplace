import { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { apiAdminFetch } from '../adminClient';

export default function AdminShipping() {
  const { adminKey } = useAdminAuth();
  const [orderId, setOrderId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [configJson, setConfigJson] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState('');
  const [shipment, setShipment] = useState(null);

  async function loadModule() {
    setError(null);
    const data = await apiAdminFetch('/admin/modules', adminKey);
    const row = (data.items || []).find((m) => m.module_key === 'shipping_ctt');
    setEnabled(Boolean(row?.enabled));
    setConfigJson(JSON.stringify(row?.config || {}, null, 2));
  }

  useEffect(() => {
    loadModule().catch((e) => setError(e.message || 'Failed to load shipping module'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveModuleSettings() {
    setLoading(true);
    setError(null);
    setSaved('');
    try {
      const cfg = JSON.parse(configJson);
      await apiAdminFetch('/admin/modules/shipping_ctt', adminKey, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, config: cfg }),
      });
      setSaved('CTT module settings saved.');
      await loadModule();
    } catch (e) {
      setError(e.message || 'Failed to save module');
    } finally {
      setLoading(false);
    }
  }

  async function createLabel() {
    setLoading(true);
    setError(null);
    setSaved('');
    setShipment(null);
    try {
      const out = await apiAdminFetch(`/admin/shipments/${encodeURIComponent(orderId)}/create-label`, adminKey, {
        method: 'POST',
      });
      setShipment(out.shipment || null);
    } catch (e) {
      setError(e.message || 'Failed to create label');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Shipping (CTT Module)</h1>
      <p className="admin-lead">
        Configure CTT module settings and create shipment labels for orders (stub integration until live CTT API is
        wired).
      </p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="store-muted">{saved}</p>}

      <section className="admin-card">
        <div className="admin-filters">
          <label className="admin-check">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span>Enable shipping_ctt module</span>
          </label>
          <button type="button" className="admin-btn" disabled={loading} onClick={saveModuleSettings}>
            Save Module Settings
          </button>
        </div>

        <label className="admin-field">
          <span className="store-field-label">CTT config JSON</span>
          <textarea
            className="admin-textarea"
            rows={6}
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            placeholder='{"apiBase":"https://...","apiKey":"..."}'
          />
        </label>
      </section>

      <section className="admin-card">
        <div className="admin-filters">
          <label className="admin-field">
            <span className="store-field-label">Order ID</span>
            <input
              className="admin-input"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Order UUID"
            />
          </label>
          <button type="button" className="btn-primary" disabled={loading || !orderId} onClick={createLabel}>
            {loading ? 'Creating…' : 'Create Label'}
          </button>
        </div>

        {shipment && (
          <div className="admin-report">
            <p>
              <strong>Status:</strong> {shipment.status}
            </p>
            <p>
              <strong>Tracking:</strong> {shipment.tracking_number}
            </p>
            <p>
              <strong>Label URL:</strong> {shipment.label_url}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

