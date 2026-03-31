import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLocale } from '../../hooks/useLocale';
import { useAdminAuth } from '../AdminAuthContext';
import { apiAdminFetchNoTenant } from '../adminClient';

/**
 * Admin login: paste the same string as backend/.env ADMIN_API_KEY.
 * It is saved in sessionStorage (key dm_admin_key) — not in source code. Never commit secrets.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const { t, locale, setLocale, uiLocales } = useLocale();
  const { setAdminKey } = useAdminAuth();
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!key.trim()) {
      setError(t('admin.login.keyRequired'));
      return;
    }

    const trimmed = key.trim();
    try {
      await apiAdminFetchNoTenant('/admin/tenants', trimmed);
    } catch (err) {
      setError(err.message || t('admin.login.keyInvalid'));
      return;
    }

    setAdminKey(trimmed);
    try {
      await Swal.fire({
        icon: 'success',
        title: t('admin.login.signedInTitle'),
        text: t('admin.login.signedInText'),
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      /* Swal optional */
    }
    navigate('/admin/dashboard', { replace: true });
  }

  return (
    <main className="admin-main">
      <div className="admin-login-lang">
        <label className="admin-lang-select admin-lang-select--login">
          <span className="admin-tenant-label">{t('admin.language')}</span>
          <select
            className="admin-input admin-tenant-input"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label={t('admin.language')}
          >
            {uiLocales.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h1 className="admin-title">{t('admin.login.title')}</h1>
      <p className="admin-lead">{t('admin.login.lead')}</p>

      {error && (
        <p className="store-banner store-banner--error" role="alert">
          {error}
        </p>
      )}

      <form className="admin-form" onSubmit={onSubmit}>
        <label className="admin-field">
          <span className="store-field-label">{t('admin.login.keyLabel')}</span>
          <input
            className="cart-coupon-input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoComplete="off"
          />
        </label>
        <button className="btn-primary" type="submit">
          {t('admin.login.submit')}
        </button>
      </form>
    </main>
  );
}
