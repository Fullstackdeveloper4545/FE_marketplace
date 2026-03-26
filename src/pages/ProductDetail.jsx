import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useLocale } from '../hooks/useLocale';
import { useCart } from '../hooks/useCart';
import { formatMoney } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const { locale } = useLocale();
  const { addItem, loading: cartBusy } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedHint, setAddedHint] = useState(false);
  const [addError, setAddError] = useState(null);
  const [opt1Value, setOpt1Value] = useState('');
  const [opt2Value, setOpt2Value] = useState('');
  const [opt3Value, setOpt3Value] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(
          `/products/${encodeURIComponent(id)}?locale=${encodeURIComponent(locale)}`
        );
        if (!cancelled) setProduct(data);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Product not found');
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  const variants = useMemo(() => product?.variants || [], [product]);
  const option1Name = variants[0]?.option1_name || 'Option1';
  const option2Enabled = variants.some((v) => v.option2_value != null);
  const option3Enabled = variants.some((v) => v.option3_value != null);
  const option2Name = variants[0]?.option2_name || 'Option2';
  const option3Name = variants[0]?.option3_name || 'Option3';

  const option1Values = useMemo(
    () => Array.from(new Set(variants.map((v) => v.option1_value).filter(Boolean))),
    [variants]
  );

  const option2Values = useMemo(() => {
    if (!option2Enabled) return [];
    return Array.from(
      new Set(
        variants
          .filter((v) => v.option1_value === opt1Value)
          .map((v) => v.option2_value)
          .filter((x) => x != null)
      )
    );
  }, [option2Enabled, variants, opt1Value]);

  const option3Values = useMemo(() => {
    if (!option3Enabled) return [];
    return Array.from(
      new Set(
        variants
          .filter((v) => v.option1_value === opt1Value)
          .filter((v) => (!option2Enabled ? true : v.option2_value === opt2Value))
          .map((v) => v.option3_value)
          .filter((x) => x != null)
      )
    );
  }, [option3Enabled, variants, opt1Value, option2Enabled, opt2Value]);

  // Initialize defaults when product loads.
  useEffect(() => {
    const v = product?.variants || [];
    if (v.length === 0) return;
    const first = v[0];
    setOpt1Value(first.option1_value || '');
    setOpt2Value(first.option2_value || '');
    setOpt3Value(first.option3_value || '');
  }, [product]);

  // Keep option2/option3 values valid when option1 changes.
  useEffect(() => {
    const v = product?.variants || [];
    if (v.length === 0) return;
    if (!option2Enabled) return;
    if (option2Values.length === 0) return;
    if (!option2Values.includes(opt2Value)) setOpt2Value(option2Values[0]);
  }, [product, option2Enabled, opt1Value, option2Values, opt2Value]);

  useEffect(() => {
    const v = product?.variants || [];
    if (v.length === 0) return;
    if (!option3Enabled) return;
    if (option3Values.length === 0) return;
    if (!option3Values.includes(opt3Value)) setOpt3Value(option3Values[0]);
  }, [product, option3Enabled, opt1Value, opt2Value, option3Values, opt3Value]);

  const selectedVariant = variants.find((v) => {
    if (v.option1_value !== opt1Value) return false;
    if (option2Enabled && v.option2_value !== opt2Value) return false;
    if (option3Enabled && v.option3_value !== opt3Value) return false;
    return true;
  });

  return (
    <main className="store-main product-detail">
      <p className="product-detail-back">
        <Link to="/">← Back to catalogue</Link>
      </p>

      {loading && <p className="store-muted">Loading…</p>}
      {error && (
        <div className="store-banner store-banner--error" role="alert">
          {error}
        </div>
      )}

      {!loading && product && (
        <article className="product-detail-inner">
          <div className="product-detail-gallery">
            {product.images?.length > 0 ? (
              product.images.map((img) => (
                <figure key={img.id} className="product-detail-figure">
                  <img src={img.url} alt="" loading="lazy" />
                </figure>
              ))
            ) : (
              <div className="product-detail-placeholder" />
            )}
          </div>
          <div className="product-detail-info">
            <p className="product-detail-sku">SKU {selectedVariant?.sku || product.sku}</p>
            <h1 className="product-detail-title">{product.name || product.sku}</h1>
            {product.description && (
              <p className="product-detail-desc">{product.description}</p>
            )}
            {variants.length > 0 && (
              <div className="product-detail-options">
                <label className="store-field">
                  <span className="store-field-label">{option1Name}</span>
                  <select
                    value={opt1Value}
                    onChange={(e) => setOpt1Value(e.target.value)}
                    className="store-select"
                  >
                    {option1Values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                {option2Enabled && (
                  <label className="store-field">
                    <span className="store-field-label">{option2Name}</span>
                    <select
                      value={opt2Value}
                      onChange={(e) => setOpt2Value(e.target.value)}
                      className="store-select"
                    >
                      {option2Values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {option3Enabled && (
                  <label className="store-field">
                    <span className="store-field-label">{option3Name}</span>
                    <select
                      value={opt3Value}
                      onChange={(e) => setOpt3Value(e.target.value)}
                      className="store-select"
                    >
                      {option3Values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}

            <p className="product-detail-price">
              {selectedVariant ? formatMoney(selectedVariant.price) : formatMoney(product.base_price)}
              {selectedVariant?.compare_at_price != null &&
                selectedVariant.compare_at_price > selectedVariant.price && (
                  <span className="product-card-compare">
                    {formatMoney(selectedVariant.compare_at_price)}
                  </span>
                )}
            </p>
            {(selectedVariant?.weight_grams ?? product.weight_grams) != null && (
              <p className="store-muted">
                Weight: {selectedVariant?.weight_grams ?? product.weight_grams} g
              </p>
            )}
            <div className="product-detail-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={cartBusy || (variants.length > 0 && !selectedVariant)}
                onClick={async () => {
                  setAddedHint(false);
                  setAddError(null);
                  try {
                    const chosen = selectedVariant || variants[0];
                    await addItem(product.id, chosen?.id || null, 1);
                    setAddedHint(true);
                  } catch (e) {
                    setAddError(e.message || 'Could not add to cart');
                  }
                }}
              >
                {cartBusy ? 'Adding…' : 'Add to cart'}
              </button>
              {addedHint && (
                <span className="product-detail-added">Added — view <Link to="/cart">cart</Link></span>
              )}
              {addError && (
                <p className="store-banner store-banner--error" role="alert">
                  {addError}
                </p>
              )}
            </div>
          </div>
        </article>
      )}
    </main>
  );
}
