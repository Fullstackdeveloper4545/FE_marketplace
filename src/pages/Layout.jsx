import { Link, Outlet } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { useCart } from '../hooks/useCart';
import '../App.css';

const LOCALES = [
  { code: 'pt', label: 'PT' },
  { code: 'es', label: 'ES' },
];

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
          <Link to="/admin/login" className="store-admin-link">
            Admin
          </Link>
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
        <Link to="/admin/login" className="store-footer-admin">
          Admin
        </Link>
      </footer>
    </div>
  );
}
