import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { useCart } from '../hooks/useCart';
import '../App.css';

const LOCALES = [
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
];

/** Button + client navigate — avoids &lt;a href="/admin/..."&gt; which many ad blockers strip from the DOM. */
function StaffEntryControl({ variant }) {
  const navigate = useNavigate();
  const go = () => navigate('/admin/login');
  if (variant === 'footer') {
    return (
      <button
        type="button"
        className="store-footer-staff-btn"
        onClick={go}
        aria-label="Store admin sign-in (API key)"
        title="Store admin — sign in with your API key"
      >
        Manage store
      </button>
    );
  }
  return (
    <button
      type="button"
      className="store-staff-entry-btn"
      onClick={go}
      aria-label="Store admin sign-in (API key)"
      title="Store admin — sign in with your API key"
    >
      Manage store
    </button>
  );
}

export default function Layout() {
  const { locale, setLocale } = useLocale();
  const { cart } = useCart();
  const cartCount = cart?.lines?.reduce((n, l) => n + (l.quantity || 0), 0) ?? 0;

  return (
    <div className="store">
      <header className="store-header">
        <div className="store-brand">
          <Link to="/" className="store-brand-link">
            <span className="store-mark" aria-hidden />
            <div>
              <h1 className="store-title">Dynamic Marketplace</h1>
              <p className="store-tagline">API-first storefront · replace with Figma when ready</p>
            </div>
          </Link>
        </div>
        <div className="store-toolbar">
          <StaffEntryControl variant="header" />
          <Link to="/cart" className="store-cart-link">
            Cart
            {cartCount > 0 && <span className="store-cart-badge">{cartCount}</span>}
          </Link>
          <label className="store-field">
            <span className="store-field-label">Language</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="store-select"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <Outlet />

      <footer className="store-footer">
        <span>Storefront · API `/api/v1`</span>
        <StaffEntryControl variant="footer" />
      </footer>
    </div>
  );
}
