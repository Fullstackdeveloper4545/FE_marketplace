import { useEffect, useMemo, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminOrders() {
  const { adminKey, tenantSlug } = useAdminAuth();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [storeId, setStoreId] = useState('');
  const [status, setStatus] = useState('');

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
    if (storeId.trim()) params.set('store_id', storeId.trim());
    if (status.trim()) params.set('status', status.trim());
    return `?${params.toString()}`;
  }, [fromDate, toDate, storeId, status]);

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
      const data = await apiAdminFetch(`/admin/orders${query}`, adminKey);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
      setItems([]);
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
      <h1 className="admin-title">Order history</h1>
      <p className="admin-help">
        Every checkout creates an order tied to one <strong>physical store</strong> for fulfilment (see Routing).
        Data is persisted in the database; Shopify receives updates when you sync products and inventory from the
        integration.
      </p>

      <div className="admin-filters">
        <label className="admin-field">
          <span className="store-field-label">From</span>
          <input className="cart-coupon-input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">To</span>
          <input className="cart-coupon-input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Store</span>
          <select className="store-select" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">All</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span className="store-field-label">Status</span>
          <input
            className="cart-coupon-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="e.g. pending_payment"
          />
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

      <table className="admin-data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Status</th>
            <th>Store</th>
            <th>Total</th>
            <th>Customer</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>{o.order_number}</strong>
              </td>
              <td>{o.status}</td>
              <td>
                {o.fulfillment_store ? (
                  <>
                    {o.fulfillment_store.code} — {o.fulfillment_store.name}
                    <br />
                    <span className="admin-mono store-muted">{o.fulfillment_store_id}</span>
                  </>
                ) : (
                  '—'
                )}
              </td>
              <td>{o.grand_total}€</td>
              <td className="store-muted">{o.customer_email || o.customer_phone || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
