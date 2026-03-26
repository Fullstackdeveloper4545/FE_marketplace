import { useEffect, useMemo, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminProducts() {
  const { adminKey, tenantSlug } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stores, setStores] = useState([]);

  const [search, setSearch] = useState('');
  const [limit] = useState(20);

  const [initialStockStoreId, setInitialStockStoreId] = useState('');
  const [initialStockQty, setInitialStockQty] = useState('0');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('locale', 'pt');
    params.set('limit', String(limit));
    params.set('offset', '0');
    if (search.trim()) params.set('search', search.trim());
    return `?${params.toString()}`;
  }, [limit, search]);

  async function loadStores() {
    try {
      const data = await apiAdminFetch('/admin/stores', adminKey);
      setStores(data.items || []);
    } catch {
      setStores([]);
    }
  }

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch(`/admin/products${query}`, adminKey);
      setItems(data.items || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e.message || 'Failed to load products');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey, tenantSlug]);

  useEffect(() => {
    loadProducts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  async function createProduct(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        sku: sku.trim(),
        base_price: Number(basePrice),
        status,
        translations: [
          { locale: 'pt', name: ptName.trim(), slug: ptSlug.trim(), description: ptDesc.trim() || null },
          { locale: 'es', name: esName.trim(), slug: esSlug.trim(), description: esDesc.trim() || null },
        ],
        category_ids: categoryIdsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (initialStockStoreId && Number(initialStockQty) > 0) {
        payload.initial_inventory = [{ store_id: initialStockStoreId, quantity: Number(initialStockQty) }];
      }

      await apiAdminFetch('/admin/products', adminKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadProducts();
      setSku('');
    } catch (e) {
      setError(e.message || 'Could not create product');
    } finally {
      setLoading(false);
    }
  }

  const [sku, setSku] = useState('');
  const [basePrice, setBasePrice] = useState('49.90');
  const [status, setStatus] = useState('published');

  const [ptName, setPtName] = useState('');
  const [ptSlug, setPtSlug] = useState('');
  const [ptDesc, setPtDesc] = useState('');

  const [esName, setEsName] = useState('');
  const [esSlug, setEsSlug] = useState('');
  const [esDesc, setEsDesc] = useState('');

  const [categoryIdsStr, setCategoryIdsStr] = useState('');

  return (
    <main className="admin-main">
      <h1 className="admin-title">Products</h1>
      <p className="admin-help">
        The <strong>catalog</strong> is shared for your tenant. <strong>Physical stores</strong> hold stock: each row
        below shows quantities per store. When you add a product manually, pick a store to seed initial on-hand stock
        (product-level; Shopify-synced items use variants and variant inventory).
      </p>

      <div className="admin-filters">
        <label className="admin-field">
          <span className="store-field-label">Search SKU</span>
          <input
            className="cart-coupon-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="DEMO-001"
          />
        </label>
        <button className="btn-primary" type="button" onClick={() => loadProducts()} disabled={loading}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <p className="store-muted">Total matching: {total}</p>

      <ul className="admin-orders-flat">
        {items.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.sku}</strong> · <span className="store-muted">{p.name || '—'}</span> · {p.base_price}€ ·{' '}
              <span className="store-muted">{p.status}</span>
            </div>
            {p.stock_by_store?.length > 0 && (
              <div className="admin-product-stock">
                <span className="store-muted">Stock by store:</span>{' '}
                {p.stock_by_store.map((s) => (
                  <span key={s.store_id} className="admin-stock-pill">
                    {s.code || s.store_id}: {s.quantity} (res. {s.reserved_quantity})
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <h2 className="admin-subtitle">Create product</h2>

      <form className="admin-form" onSubmit={createProduct}>
        <label className="admin-field">
          <span className="store-field-label">SKU</span>
          <input className="cart-coupon-input" value={sku} onChange={(e) => setSku(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Base price (€)</span>
          <input
            className="cart-coupon-input"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Status</span>
          <select className="store-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>

        <h3 className="admin-subtitle">Initial stock (optional)</h3>
        <p className="admin-help">
          Choose which <strong>physical store</strong> receives starting quantity for this SKU (same stores used in
          order routing).
        </p>
        <label className="admin-field">
          <span className="store-field-label">Store</span>
          <select
            className="store-select"
            value={initialStockStoreId}
            onChange={(e) => setInitialStockStoreId(e.target.value)}
          >
            <option value="">— None —</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span className="store-field-label">Quantity</span>
          <input
            className="cart-coupon-input"
            type="number"
            min="0"
            value={initialStockQty}
            onChange={(e) => setInitialStockQty(e.target.value)}
          />
        </label>

        <h3 className="admin-subtitle">Portuguese</h3>
        <label className="admin-field">
          <span className="store-field-label">Name</span>
          <input className="cart-coupon-input" value={ptName} onChange={(e) => setPtName(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Slug</span>
          <input className="cart-coupon-input" value={ptSlug} onChange={(e) => setPtSlug(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Description</span>
          <input className="cart-coupon-input" value={ptDesc} onChange={(e) => setPtDesc(e.target.value)} />
        </label>

        <h3 className="admin-subtitle">Spanish</h3>
        <label className="admin-field">
          <span className="store-field-label">Name</span>
          <input className="cart-coupon-input" value={esName} onChange={(e) => setEsName(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Slug</span>
          <input className="cart-coupon-input" value={esSlug} onChange={(e) => setEsSlug(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Description</span>
          <input className="cart-coupon-input" value={esDesc} onChange={(e) => setEsDesc(e.target.value)} />
        </label>

        <label className="admin-field">
          <span className="store-field-label">Category IDs (comma)</span>
          <input
            className="cart-coupon-input"
            value={categoryIdsStr}
            onChange={(e) => setCategoryIdsStr(e.target.value)}
            placeholder="uuid1,uuid2"
          />
        </label>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Create'}
        </button>
      </form>
    </main>
  );
}
