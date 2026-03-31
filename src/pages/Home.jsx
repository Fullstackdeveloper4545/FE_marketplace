import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useLocale } from '../hooks/useLocale';
import { formatMoney } from '../utils/format';
import HomeHero from './HomeHero';

export default function Home() {
  const { locale, t } = useLocale();
  const [categoryId, setCategoryId] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    const data = await apiFetch(`/categories?locale=${encodeURIComponent(locale)}`);
    setCategories(data.items || []);
  }, [locale]);

  const loadAttributes = useCallback(async () => {
    const data = await apiFetch(`/attributes?locale=${encodeURIComponent(locale)}`);
    setAttributes(data.items || []);
    setSelectedAttributeValues({});
  }, [locale]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ locale });
      if (categoryId) q.set('category_id', categoryId);

      const attributeValueIds = Object.values(selectedAttributeValues).filter(Boolean);
      if (attributeValueIds.length > 0) {
        q.set('attribute_value_ids', attributeValueIds.join(','));
      }

      const data = await apiFetch(`/products?${q.toString()}`);
      setProducts(data.items || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e.message || t('home.loadError'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [locale, categoryId, selectedAttributeValues, t]);

  useEffect(() => {
    loadCategories().catch((e) => setError(e.message));
  }, [loadCategories]);

  useEffect(() => {
    loadAttributes().catch((e) => setError(e.message));
  }, [loadAttributes]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <main className="store-main store-main--home">
      <HomeHero />
      <div id="store-catalog" className="home-toolbar">
        <label className="store-field">
          <span className="store-field-label">{t('home.category')}</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="store-select"
          >
            <option value="">{t('home.all')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.slug || c.id}
              </option>
            ))}
          </select>
        </label>

        {attributes.map((a) => (
          <label key={a.id} className="store-field">
            <span className="store-field-label">{a.name || a.code}</span>
            <select
              value={selectedAttributeValues[a.id] || ''}
              onChange={(e) =>
                setSelectedAttributeValues((prev) => ({
                  ...prev,
                  [a.id]: e.target.value || '',
                }))
              }
              className="store-select"
            >
              <option value="">{t('home.any')}</option>
              {a.values.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label || v.code || v.id}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {error && (
        <div className="store-banner store-banner--error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="store-muted">{t('home.loading')}</p>
      ) : products.length === 0 ? (
        <div className="store-empty">
          <p>{t('home.noProducts')}</p>
          <p className="store-muted">{t('home.noProductsHint')}</p>
        </div>
      ) : (
        <>
          <p className="store-count">
            {total === 1
              ? t('home.productCount', { count: total })
              : t('home.productCountPlural', { count: total })}
          </p>
          <ul className="product-grid">
            {products.map((p) => (
              <li key={p.id}>
                <Link to={`/product/${p.id}`} className="product-card product-card--link">
                  <div
                    className="product-card-image"
                    style={
                      p.image_url
                        ? { backgroundImage: `url(${p.image_url})` }
                        : undefined
                    }
                  />
                  <div className="product-card-body">
                    <h2 className="product-card-title">{p.name || p.sku}</h2>
                    {p.name == null && (
                      <span className="store-muted">
                        {t('home.missingTranslation', { lang: locale.toUpperCase() })}
                      </span>
                    )}
                    <p className="product-card-price">
                      {formatMoney(p.base_price)}
                      {p.compare_at_price && p.compare_at_price > p.base_price && (
                        <span className="product-card-compare">
                          {formatMoney(p.compare_at_price)}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
