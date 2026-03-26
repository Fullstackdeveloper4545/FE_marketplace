import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatMoney } from '../utils/format';

export default function Cart() {
  const {
    cart,
    loading,
    updateLineQty,
    removeLine,
    applyCoupon,
    clearCoupon,
  } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);

  const lineCount =
    cart?.lines?.reduce((n, l) => n + (l.quantity || 0), 0) ?? 0;

  async function handleCoupon(e) {
    e.preventDefault();
    setCouponError(null);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message || 'Could not apply coupon');
    }
  }

  return (
    <main className="store-main cart-page">
      <p className="product-detail-back">
        <Link to="/">← Back to catalogue</Link>
      </p>
      <h1 className="cart-title">Your cart</h1>

      {!cart || cart.lines.length === 0 ? (
        <div className="store-empty">
          <p>Your cart is empty.</p>
          <p className="store-muted">
            <Link to="/">Browse products</Link>
          </p>
        </div>
      ) : (
        <>
          <ul className="cart-lines">
            {cart.lines.map((line) => (
              <li key={line.line_id} className="cart-line">
                <div className="cart-line-info">
                  <Link to={`/product/${line.product_id}`} className="cart-line-name">
                    {line.name}
                  </Link>
                  <span className="store-muted">{line.sku}</span>
                </div>
                <div className="cart-line-qty">
                  <button
                    type="button"
                    className="cart-qty-btn"
                    disabled={loading}
                    onClick={() => updateLineQty(line.line_id, line.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="cart-qty-val">{line.quantity}</span>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    disabled={loading}
                    onClick={() => updateLineQty(line.line_id, line.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="cart-line-price">{formatMoney(line.line_total)}</div>
                <button
                  type="button"
                  className="cart-remove"
                  onClick={() => removeLine(line.line_id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <section className="cart-coupon">
            <form onSubmit={handleCoupon} className="cart-coupon-form">
              <label>
                <span className="store-field-label">Coupon</span>
                <input
                  type="text"
                  className="cart-coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="WELCOME10"
                  autoComplete="off"
                />
              </label>
              <button type="submit" className="cart-coupon-apply" disabled={loading}>
                Apply
              </button>
            </form>
            {couponError && (
              <p className="store-banner store-banner--error" role="alert">
                {couponError}
              </p>
            )}
            {cart.coupon && (
              <p className="cart-coupon-active">
                Applied: <strong>{cart.coupon.code}</strong>{' '}
                <button type="button" className="cart-coupon-clear" onClick={() => clearCoupon()}>
                  Remove
                </button>
              </p>
            )}
          </section>

          <div className="cart-totals">
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
              <span>Shipping (estimate)</span>
              <span>{formatMoney(cart.shipping_estimate)}</span>
            </div>
            <div className="cart-total-row cart-total-row--grand">
              <span>Estimated total</span>
              <span>{formatMoney(cart.grand_total)}</span>
            </div>
          </div>

          <p className="store-muted cart-note">
            Demo coupon <code>WELCOME10</code> — 10% off orders over €20 (max €25 off). Payment is
            confirmed when your provider hits the webhook.
          </p>
          <p className="store-muted">Items in cart: {lineCount}</p>

          <div className="cart-actions">
            <Link to="/checkout" className="btn-primary cart-checkout-btn">
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
