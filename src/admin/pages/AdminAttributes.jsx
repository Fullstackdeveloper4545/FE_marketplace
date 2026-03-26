import { useEffect, useMemo, useState } from 'react';
import { apiAdminFetch } from '../adminClient';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminAttributes() {
  const { adminKey } = useAdminAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attributes, setAttributes] = useState([]);

  const [locale] = useState('pt');

  const [selectedAttrId, setSelectedAttrId] = useState('');
  const [values, setValues] = useState([]);
  const [valuesLoading, setValuesLoading] = useState(false);

  const [attrCode, setAttrCode] = useState('');
  const [filterable, setFilterable] = useState(true);
  const [attrSort, setAttrSort] = useState('0');
  const [ptAttrName, setPtAttrName] = useState('');
  const [esAttrName, setEsAttrName] = useState('');

  const [valueCode, setValueCode] = useState('');
  const [valueSort, setValueSort] = useState('0');
  const [ptValueLabel, setPtValueLabel] = useState('');
  const [esValueLabel, setEsValueLabel] = useState('');

  const attrQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set('locale', locale);
    params.set('limit', '50');
    params.set('offset', '0');
    return `?${params.toString()}`;
  }, [locale]);

  async function loadAttributes() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiAdminFetch(`/admin/attributes${attrQuery}`, adminKey);
      setAttributes(data.items || []);
      const first = data.items?.[0]?.id || '';
      setSelectedAttrId((prev) => prev || first);
    } catch (e) {
      setError(e.message || 'Failed to load attributes');
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadValues() {
    if (!selectedAttrId) return;
    setValuesLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('locale', locale);
      params.set('limit', '50');
      params.set('offset', '0');
      const data = await apiAdminFetch(`/admin/attributes/${selectedAttrId}/values?${params.toString()}`, adminKey);
      setValues(data.items || []);
    } catch (e) {
      setError(e.message || 'Failed to load values');
      setValues([]);
    } finally {
      setValuesLoading(false);
    }
  }

  useEffect(() => {
    loadAttributes().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadValues().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttrId]);

  async function createAttribute(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        code: attrCode.trim(),
        filterable,
        sort_order: Number(attrSort),
        translations: [
          { locale: 'pt', name: ptAttrName.trim() },
          { locale: 'es', name: esAttrName.trim() },
        ],
      };
      await apiAdminFetch('/admin/attributes', adminKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadAttributes();
    } catch (e) {
      setError(e.message || 'Could not create attribute');
    } finally {
      setLoading(false);
    }
  }

  async function createValue(e) {
    e.preventDefault();
    setValuesLoading(true);
    setError(null);
    try {
      const payload = {
        code: valueCode.trim(),
        sort_order: Number(valueSort),
        translations: [
          { locale: 'pt', label: ptValueLabel.trim() },
          { locale: 'es', label: esValueLabel.trim() },
        ],
      };
      await apiAdminFetch(`/admin/attributes/${selectedAttrId}/values`, adminKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadValues();
      setValueCode('');
      setPtValueLabel('');
      setEsValueLabel('');
    } catch (e) {
      setError(e.message || 'Could not create value');
    } finally {
      setValuesLoading(false);
    }
  }

  return (
    <main className="admin-main">
      <h1 className="admin-title">Attributes (filter facets)</h1>
      <div className="admin-help">
        <p>
          Here you define <strong>search/filter facets</strong> for the public shop (e.g. Color, Size, Material). Link
          products to attribute values so filters work. This is the right place to mirror common{' '}
          <strong>Shopify product options</strong> you care about for browsing — not the variant matrix itself (that
          comes from Shopify <strong>Options</strong> → <strong>Variants</strong> and syncs into{' '}
          <code>product_variants</code>).
        </p>
        <p>
          <strong>Typical Shopify-aligned attribute codes</strong> (examples): <code>color</code>, <code>size</code>,{' '}
          <code>material</code>, <code>brand</code>, <code>pattern</code>, <code>gender</code>, <code>age_group</code>,{' '}
          <code>condition</code>. Create one attribute per dimension, then add values (e.g. size: 36, 38, 40).
        </p>
      </div>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <section>
        <h2 className="admin-subtitle">Create attribute</h2>
        <form className="admin-form" onSubmit={createAttribute}>
          <label className="admin-field">
            <span className="store-field-label">code</span>
            <input className="cart-coupon-input" value={attrCode} onChange={(e) => setAttrCode(e.target.value)} />
          </label>
          <label className="admin-field">
            <span className="store-field-label">filterable</span>
            <select className="store-select" value={filterable ? 'true' : 'false'} onChange={(e) => setFilterable(e.target.value === 'true')}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </label>
          <label className="admin-field">
            <span className="store-field-label">sort_order</span>
            <input className="cart-coupon-input" value={attrSort} onChange={(e) => setAttrSort(e.target.value)} />
          </label>

          <h3 className="admin-subtitle">Portuguese</h3>
          <label className="admin-field">
            <span className="store-field-label">name</span>
            <input className="cart-coupon-input" value={ptAttrName} onChange={(e) => setPtAttrName(e.target.value)} />
          </label>

          <h3 className="admin-subtitle">Spanish</h3>
          <label className="admin-field">
            <span className="store-field-label">name</span>
            <input className="cart-coupon-input" value={esAttrName} onChange={(e) => setEsAttrName(e.target.value)} />
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Create'}
          </button>
        </form>
      </section>

      <section style={{ marginTop: '1.75rem' }}>
        <h2 className="admin-subtitle">Manage values</h2>

        <label className="admin-field">
          <span className="store-field-label">Attribute</span>
          <select className="store-select" value={selectedAttrId} onChange={(e) => setSelectedAttrId(e.target.value)}>
            {attributes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} · {a.name || '—'}
              </option>
            ))}
          </select>
        </label>

        <form className="admin-form" onSubmit={createValue}>
          <label className="admin-field">
            <span className="store-field-label">value code</span>
            <input className="cart-coupon-input" value={valueCode} onChange={(e) => setValueCode(e.target.value)} />
          </label>
          <label className="admin-field">
            <span className="store-field-label">sort_order</span>
            <input className="cart-coupon-input" value={valueSort} onChange={(e) => setValueSort(e.target.value)} />
          </label>

          <h3 className="admin-subtitle">Portuguese</h3>
          <label className="admin-field">
            <span className="store-field-label">label</span>
            <input className="cart-coupon-input" value={ptValueLabel} onChange={(e) => setPtValueLabel(e.target.value)} />
          </label>

          <h3 className="admin-subtitle">Spanish</h3>
          <label className="admin-field">
            <span className="store-field-label">label</span>
            <input className="cart-coupon-input" value={esValueLabel} onChange={(e) => setEsValueLabel(e.target.value)} />
          </label>

          <button className="btn-primary" type="submit" disabled={valuesLoading || !selectedAttrId}>
            {valuesLoading ? 'Saving…' : 'Add value'}
          </button>
        </form>

        <ul className="admin-orders-flat" style={{ marginTop: '1rem' }}>
          {values.map((v) => (
            <li key={v.id}>
              <strong>{v.code}</strong> · <span className="store-muted">{v.label || '—'}</span> ·{' '}
              <span className="store-muted">{v.sort_order}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

