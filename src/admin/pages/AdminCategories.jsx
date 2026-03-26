import { useEffect, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminCategories() {
  const { adminKey } = useAdminAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch('/admin/categories?locale=pt&limit=50&offset=0', adminKey);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load categories');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [ptName, setPtName] = useState('');
  const [ptSlug, setPtSlug] = useState('');
  const [ptDesc, setPtDesc] = useState('');

  const [esName, setEsName] = useState('');
  const [esSlug, setEsSlug] = useState('');
  const [esDesc, setEsDesc] = useState('');

  async function create(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        parent_id: parentId.trim() ? parentId.trim() : null,
        sort_order: Number(sortOrder),
        is_active: isActive,
        translations: [
          { locale: 'pt', name: ptName.trim(), slug: ptSlug.trim(), description: ptDesc.trim() || null },
          { locale: 'es', name: esName.trim(), slug: esSlug.trim(), description: esDesc.trim() || null },
        ],
      };
      await apiAdminFetch('/admin/categories', adminKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await load();
      setPtName('');
    } catch (e) {
      setError(e.message || 'Could not create category');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Categories</h1>
      <p className="admin-help">
        <strong>Categories</strong> are your storefront navigation tree (e.g. Apparel → Footwear). They are
        tenant-scoped and used for product filtering and URLs. They complement Shopify collections: synced products can
        still be linked here so shoppers browse your catalog structure.
      </p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <ul className="admin-orders-flat">
        {items.map((c) => (
          <li key={c.id}>
            <strong>{c.name || '—'}</strong> · <span className="store-muted">{c.slug}</span> ·{' '}
            <span className="store-muted">{c.sort_order}</span>
          </li>
        ))}
      </ul>

      <h2 className="admin-subtitle">Create category</h2>

      <form className="admin-form" onSubmit={create}>
        <label className="admin-field">
          <span className="store-field-label">Parent id (optional)</span>
          <input className="cart-coupon-input" value={parentId} onChange={(e) => setParentId(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Sort order</span>
          <input className="cart-coupon-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </label>
        <label className="admin-field">
          <span className="store-field-label">Active</span>
          <select className="store-select" value={isActive ? 'true' : 'false'} onChange={(e) => setIsActive(e.target.value === 'true')}>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
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

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Create'}
        </button>
      </form>
    </main>
  );
}

