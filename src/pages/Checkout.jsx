import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, apiPost } from '../api/client';
import { useCart } from '../hooks/useCart';
import { formatMoney } from '../utils/format';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, loading, placeOrder } = useCart();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [districts, setDistricts] = useState([]);
  const [shippingQuote, setShippingQuote] = useState(null);
  const [shippingError, setShippingError] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [paymentProvider, setPaymentProvider] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/districts')
      .then((d) => setDistricts(d.items || []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    if (!cart?.id) return;
    apiPost('/shipping/quote', { cart_id: cart.id })
      .then((d) => {
        setShippingError(null);
        setShippingQuote(d.quote || null);
      })
      .catch((e) => {
        setShippingQuote(null);
        setShippingError(e.message || 'Shipping quote unavailable');
      });
  }, [cart?.id]);

  useEffect(() => {
    if (!cart?.id) return;
    apiPost('/checkout/preview', { cart_id: cart.id })
      .then((d) => {
        const options = d?.checkout?.payment_options || [];
        setPaymentOptions(options);
        const providers = options.map((o) => o.provider);
        if (providers.length > 0) {
          const selectedProvider = providers.includes(paymentProvider) ? paymentProvider : providers[0];
          setPaymentProvider(selectedProvider);
          const methods = options.find((o) => o.provider === selectedProvider)?.methods || [];
          setPaymentMethod((prev) => (methods.includes(prev) ? prev : methods[0] || ''));
        }
      })
      .catch(() => {
        setPaymentOptions([]);
        setPaymentProvider('');
        setPaymentMethod('');
      });
  }, [cart?.id, paymentProvider]);

  if (!cart?.lines?.length) {
    return (
      <main className="store-main">
        <p className="product-detail-back">
          <Link to="/cart">← Back to cart</Link>
        </p>
        <div className="store-empty">
          <p>Your cart is empty.</p>
          <Link to="/">Browse products</Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!paymentProvider) {
      setError('No payment provider available. Contact support.');
      return;
    }
    if (!paymentMethod) {
      setError('No payment method available. Contact support.');
      return;
    }
    try {
      const result = await placeOrder({
        customer_email: email.trim() || undefined,
        customer_phone: phone.trim() || undefined,
        district_code: districtCode || undefined,
        shipping_provider: shippingQuote?.provider || undefined,
        payment_provider: paymentProvider,
        payment_method: paymentMethod,
      });
      navigate('/order/confirmation', { state: { order: result.order }, replace: true });
    } catch (err) {
      setError(err.message || 'Could not place order');
    }
  }

  return (
    <main className="store-main checkout-page">
      <p className="product-detail-back">
        <Link to="/cart">← Back to cart</Link>
      </p>
      <h1 className="cart-title">Checkout</h1>
      <p className="store-muted checkout-lead">
        Order will be routed to a store by platform rules (region vs quantity). Payment is still
        pending until your provider confirms via webhook.
      </p>

      {error && (
        <div className="store-banner store-banner--error" role="alert">
          {error}
        </div>
      )}

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label className="checkout-field">
            <span className="store-field-label">Email (optional)</span>
            <input
              type="email"
              className="cart-coupon-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="checkout-field">
            <span className="store-field-label">Phone (optional)</span>
            <input
              type="tel"
              className="cart-coupon-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          {districts.length > 0 ? (
            <label className="checkout-field">
              <span className="store-field-label">District (region routing)</span>
              <select
                className="store-select"
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
              >
                <option value="">— Not specified —</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="checkout-field">
              <span className="store-field-label">District code (optional)</span>
              <input
                className="cart-coupon-input"
                value={districtCode}
                onChange={(e) => setDistrictCode(e.target.value)}
                placeholder="e.g. LIS"
              />
            </label>
          )}

          <label className="checkout-field">
            <span className="store-field-label">Payment provider</span>
            <select
              className="store-select"
              value={paymentProvider}
              onChange={(e) => {
                const nextProvider = e.target.value;
                setPaymentProvider(nextProvider);
                const methods = paymentOptions.find((o) => o.provider === nextProvider)?.methods || [];
                setPaymentMethod(methods[0] || '');
              }}
            >
              {paymentOptions.map((p) => (
                <option key={p.provider} value={p.provider}>
                  {p.provider}
                </option>
              ))}
            </select>
          </label>

          <label className="checkout-field">
            <span className="store-field-label">Payment method</span>
            <select
              className="store-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {(paymentOptions.find((o) => o.provider === paymentProvider)?.methods || []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn-primary checkout-submit" disabled={loading}>
            {loading ? 'Placing order…' : 'Place order'}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2 className="checkout-summary-title">Summary</h2>
          <ul className="checkout-summary-lines">
            {cart.lines.map((l) => (
              <li key={l.line_id}>
                {l.name} × {l.quantity}
              </li>
            ))}
          </ul>
          <div className="cart-totals checkout-totals">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <span>{formatMoney(cart.subtotal)}</span>
            </div>
            {cart.discount_total > 0 && (
              <div className="cart-total-row cart-total-row--discount">
                <span>Discount</span>
                <span>−{formatMoney(cart.discount_total)}</span>
              </div>
            )}
            <div className="cart-total-row">
              <span>Shipping</span>
              <span>{formatMoney(shippingQuote?.amount ?? cart.shipping_estimate)}</span>
            </div>
            <div className="cart-total-row cart-total-row--grand">
              <span>Total</span>
              <span>
                {formatMoney(
                  (cart.subtotal || 0) - (cart.discount_total || 0) + (shippingQuote?.amount ?? cart.shipping_estimate)
                )}
              </span>
            </div>
          </div>
          {shippingQuote && (
            <p className="store-muted">
              Shipping provider: <strong>{shippingQuote.provider}</strong>
            </p>
          )}
          {shippingError && <p className="store-muted">{shippingError}</p>}
        </aside>
      </div>
    </main>
  );
}
