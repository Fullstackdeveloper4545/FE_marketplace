import { useEffect, useMemo, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminPendingOrders() {
  const { adminKey, tenantSlug } = useAdminAuth();
  const [date, setDate] = useState(todayIsoDate());
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('date', date);
    if (storeId.trim()) params.set('store_id', storeId.trim());
    return `?${params.toString()}`;
  }, [date, storeId]);

  async function loadStores() {
    try {
      const data = await apiAdminFetch('/admin/stores', adminKey);
      setStores(data.items || []);
    } catch {
      setStores([]);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch(`/admin/reports/pending-orders${query}`, adminKey);
      setReport(data);
    } catch (e) {
      setError(e.message || 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, tenantSlug]);

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  return (
    <main className="admin-main">
      <h1 className="admin-title">Pending orders report</h1>
      <p className="admin-help">
        Shows orders that are still in the fulfilment pipeline for the selected day:{' '}
        <strong>pending payment</strong>, <strong>paid</strong>, <strong>processing</strong>, or{' '}
        <strong>ready to ship</strong>. Results are grouped by the <strong>physical store</strong> assigned to fulfil
        each order (the same store used for inventory and routing).
      </p>

      <div className="admin-filters">
        <label className="admin-field">
          <span className="store-field-label">Date</span>
          <input className="cart-coupon-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Filter by store</span>
          <select className="store-select" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">All stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary" type="button" onClick={() => load()} disabled={loading}>
          {loading ? 'Loading…' : 'Run'}
        </button>
      </div>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      {report && (
        <div className="admin-report">
          <p className="store-muted">
            Pending pipeline orders on this date: <strong>{report.totals.pending_orders}</strong> · Store groups:{' '}
            <strong>{report.totals.stores}</strong>
          </p>
          {report.stores.map((s) => (
            <section key={s.store_id || 'unassigned'} className="admin-store-report">
              <h2 className="admin-store-title">
                {s.store_code || '—'} · {s.store_name}
              </h2>
              <p className="store-muted admin-mono">Store ID: {s.store_id || 'unassigned'}</p>
              <p className="store-muted">
                Orders in group: <strong>{s.pending_count}</strong> · Subtotal:{' '}
                <strong>{s.pending_total_amount}€</strong>
              </p>
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Fulfilment store ID</th>
                    <th>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {s.orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.order_number}</strong>
                      </td>
                      <td>{o.status}</td>
                      <td>{o.grand_total}€</td>
                      <td className="admin-mono">{o.fulfillment_store_id || '—'}</td>
                      <td>{o.placed_at ? String(o.placed_at).slice(0, 19).replace('T', ' ') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
