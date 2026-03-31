import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { useCart } from '../hooks/useCart';
import '../App.css';

function StaffEntryControl({ variant }) {
  const navigate = useNavigate();
  const { t } = useLocale();
  const go = () => navigate('/admin/login');
  if (variant === 'footer') {
    return (
      <button
        type="button"
        className="store-footer-staff-btn"
        onClick={go}
        aria-label={t('store.staffAria')}
        title={t('store.staffTitle')}
      >
        {t('store.manageStore')}
      </button>
    );
  }
  return (
    <button
      type="button"
      className="store-staff-entry-btn"
      onClick={go}
      aria-label={t('store.staffAria')}
      title={t('store.staffTitle')}
    >
      {t('store.manageStore')}
    </button>
  );
}

export default function Layout() {
  const { locale, setLocale, t, uiLocales } = useLocale();
  const { cart } = useCart();
  const cartCount = cart?.lines?.reduce((n, l) => n + (l.quantity || 0), 0) ?? 0;

  return (
    <div className="store">
      <header className="store-header">
        <div className="store-brand">
          <Link to="/" className="store-brand-link">
            <span className="store-mark" aria-hidden />
            <div>
              <h1 className="store-title">{t('store.title')}</h1>
              <p className="store-tagline">{t('store.tagline')}</p>
            </div>
          </Link>
        </div>
        <div className="store-toolbar">
          <StaffEntryControl variant="header" />
          <Link to="/cart" className="store-cart-link">
            {t('store.cart')}
            {cartCount > 0 && <span className="store-cart-badge">{cartCount}</span>}
          </Link>
          <label className="store-field">
            <span className="store-field-label">{t('store.language')}</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="store-select"
            >
              {uiLocales.map((l) => (
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
        <span>{t('store.footer')}</span>
        <StaffEntryControl variant="footer" />
      </footer>
    </div>
  );
}
