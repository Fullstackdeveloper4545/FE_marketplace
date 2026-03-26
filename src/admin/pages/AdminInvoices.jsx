import { useEffect, useMemo, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminInvoices() {
  const { adminKey } = useAdminAuth();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [storeId, setStoreId] = useState('');

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
    if (storeId.trim()) params.set('store_id', storeId.trim());
    return `?${params.toString()}`;
  }, [fromDate, toDate, storeId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch(`/admin/invoices${query}`, adminKey);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load invoices');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="admin-main">
      <h1 className="admin-title">Invoices</h1>

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
          <span className="store-field-label">Store id (optional)</span>
          <input className="cart-coupon-input" value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="uuid" />
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

      <ul className="admin-orders-flat">
        {items.map((inv) => (
          <li key={inv.id}>
            <strong>{inv.invoice_number}</strong> · <span className="store-muted">{inv.order_status}</span> ·{' '}
            <span>{inv.grand_total ? `${inv.grand_total}€` : ''}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

