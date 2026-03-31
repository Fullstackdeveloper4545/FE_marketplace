import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useLocale } from '../hooks/useLocale';
import { useCart } from '../hooks/useCart';
import { getCategoryNav } from '../locales/uiStrings';
import '../App.css';

function IconSearch() {
  return (
    <svg className="store-header-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M11 19a8 8 0 100-16 8 8 0 000 16zm9 2l-4-4"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="store-header-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  );
}

function IconBag() {
  return (
    <svg className="store-header-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 8h15l-1.5 9H7L6 8zm0 0L5 3H2M9 11a3 3 0 006 0"
      />
    </svg>
  );
}

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
      className="store-staff-entry-btn store-staff-entry-btn--compact"
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
  const categoryNav = getCategoryNav(locale);

  return (
    <div className="store store--commerce">
      <div className="store-anno-bar">{t('store.announcement')}</div>

      <header className="store-header-slab">
        <div className="store-header-row">
          <nav className="store-header-links" aria-label="Utility">
            <a className="store-header-link" href="#about">
              {t('store.navAbout')}
            </a>
            <a className="store-header-link" href="#blog">
              {t('store.navBlog')}
            </a>
            <a className="store-header-link" href="#contact">
              {t('store.navContact')}
            </a>
          </nav>

          <Link to="/" className="store-logo-wordmark">
            <span className="store-logo-wordmark__main">{t('store.logoMain')}</span>
            <span className="store-logo-wordmark__suffix">{t('store.logoSuffix')}</span>
          </Link>

          <div className="store-header-actions">
            <button type="button" className="store-icon-btn" aria-label={t('store.searchAria')}>
              <IconSearch />
            </button>
            <a href="#account" className="store-icon-btn" aria-label={t('store.accountAria')}>
              <IconUser />
            </a>
            <Link to="/cart" className="store-icon-btn store-icon-btn--cart" aria-label={t('store.cart')}>
              <IconBag />
              {cartCount > 0 && <span className="store-cart-dot">{cartCount}</span>}
            </Link>
            <StaffEntryControl variant="header" />
            <label className="store-lang-inline">
              <span className="visually-hidden">{t('store.language')}</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="store-lang-inline__select"
                aria-label={t('store.language')}
              >
                {uiLocales.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <nav className="store-category-bar" aria-label="Categories">
          {categoryNav.map((item) => (
            <Link
              key={item.key}
              to="/"
              className={`store-category-pill${item.sale ? ' store-category-pill--sale' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <Outlet />

      <footer className="store-footer store-footer--commerce">
        <span>{t('store.footer')}</span>
        <StaffEntryControl variant="footer" />
      </footer>
    </div>
  );
}
