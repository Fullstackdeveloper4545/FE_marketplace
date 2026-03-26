import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminDashboard() {
  const { adminKey, tenantSlug } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch('/admin/dashboard/summary', adminKey);
      setSummary(data);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const cards = useMemo(() => {
    if (!summary?.totals) return [];
    const t = summary.totals;
    return [
      { label: 'Total orders', value: t.orders, sub: `${t.pending_payment} awaiting payment` },
      { label: 'Invoices', value: t.invoices, sub: 'Issued for this tenant' },
      { label: 'Active schedules', value: t.report_schedules_active, sub: 'Automated email reports' },
      { label: 'Physical stores', value: summary.physical_stores || 0, sub: 'Fulfilment locations' },
      { label: 'Routing mode', value: summary.routing_mode || 'region', sub: 'How orders pick a store' },
      {
        label: 'Pending pipeline (today)',
        value: t.pending_pipeline_today ?? 0,
        sub: 'Paid → ready (see Pending report)',
      },
    ];
  }, [summary]);

  return (
    <main className="admin-main">
      <div className="admin-dashboard-head">
        <div>
          <h1 className="admin-title">Dashboard</h1>
          <p className="admin-lead">
            Orders placed on the public storefront are stored here and assigned to a physical store for fulfilment.
            Shopify sync keeps catalog and inventory aligned when connected.
          </p>
          {summary?.tenant?.slug && (
            <p className="store-muted">
              Tenant: <strong>{summary.tenant.slug}</strong>
            </p>
          )}
        </div>
        <button type="button" className="admin-btn" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <section className="admin-dashboard-grid">
        {cards.map((c) => (
          <article key={c.label} className="admin-dash-card">
            <p className="admin-dash-label">{c.label}</p>
            <p className="admin-dash-value">{c.value}</p>
            <p className="admin-dash-sub">{c.sub}</p>
          </article>
        ))}
      </section>

      {summary?.orders_by_store?.length > 0 && (
        <section className="admin-card">
          <h2 className="admin-subtitle">Orders by fulfilment store</h2>
          <p className="admin-help">
            Counts are based on recent orders for this tenant. Each order is assigned to one <strong>physical store</strong>{' '}
            for picking and shipping (see Routing).
          </p>
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Store code</th>
                <th>Store name</th>
                <th>Store ID</th>
                <th>Orders</th>
                <th>Pending payment</th>
              </tr>
            </thead>
            <tbody>
              {summary.orders_by_store.map((s) => (
                <tr key={s.store_id || 'none'}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td className="admin-mono">{s.store_id || '—'}</td>
                  <td>{s.orders}</td>
                  <td>{s.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="admin-card">
        <h2 className="admin-subtitle">Quick actions</h2>
        <div className="admin-actions-row">
          <Link className="admin-nav-link" to="/admin/orders">
            Order history
          </Link>
          <Link className="admin-nav-link" to="/admin/reports/pending-orders">
            Pending orders report
          </Link>
          <Link className="admin-nav-link" to="/admin/invoices">
            Invoices
          </Link>
          <Link className="admin-nav-link" to="/admin/schedules">
            Report schedules
          </Link>
          <Link className="admin-nav-link" to="/admin/shopify">
            Shopify
          </Link>
          <Link className="admin-nav-link" to="/admin/modules">
            Modules
          </Link>
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-subtitle">Recent orders</h2>
        {!summary?.recent_orders?.length ? (
          <p className="store-muted">No orders yet.</p>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Store</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent_orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.order_number}</strong>
                  </td>
                  <td>{o.status}</td>
                  <td>
                    {o.fulfillment_store ? (
                      <>
                        {o.fulfillment_store.code} — {o.fulfillment_store.name}
                        <span className="admin-mono store-muted"> {o.fulfillment_store_id}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {o.currency} {o.grand_total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
