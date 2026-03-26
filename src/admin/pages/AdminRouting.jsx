import { useEffect, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminRouting() {
  const { adminKey } = useAdminAuth();
  const [mode, setMode] = useState('region');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    setError(null);
    const data = await apiAdminFetch('/admin/platform-settings/order_routing', adminKey);
    setMode(data.mode || 'region');
  }

  useEffect(() => {
    load().catch((e) => setError(e.message || 'Failed to load'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      await apiAdminFetch('/admin/platform-settings/order_routing', adminKey, {
        method: 'PATCH',
        body: JSON.stringify({ mode }),
        headers: { 'Content-Type': 'application/json' },
      });
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Order routing (physical stores)</h1>
      <p className="admin-lead">
        Products belong to the <strong>catalog</strong> (tenant-wide). <strong>Stock</strong> lives per physical store.
        When a customer checks out, one store is chosen to fulfil the order.
      </p>
      <p className="admin-help">
        <strong>Region</strong>: send the order to the store mapped to the customer&apos;s district (see district–store
        assignments in the database). <strong>Quantity</strong>: pick the store that can cover all line items with
        available stock.
      </p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-filters">
        <label className="admin-field">
          <span className="store-field-label">mode</span>
          <select className="store-select" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="region">region</option>
            <option value="quantity">quantity</option>
          </select>
        </label>
        <button className="btn-primary" type="button" onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      {saved && <p className="store-muted">Saved.</p>}
    </main>
  );
}

