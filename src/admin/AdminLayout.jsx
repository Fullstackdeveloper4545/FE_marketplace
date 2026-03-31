import { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation, useNavigate, matchPath } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLocale } from '../hooks/useLocale';
import { useAdminAuth } from './AdminAuthContext';
import { apiAdminFetchNoTenant } from './adminClient';

function navClass(isActive) {
  return `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`;
}

export default function AdminLayout() {
  const { t, locale, setLocale, uiLocales } = useLocale();
  const { isAuthed, adminKey, tenantSlug, setTenantSlug, logout } = useAdminAuth();
  const [tenants, setTenants] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = Boolean(
    matchPath({ path: '/admin/login', end: true }, location.pathname)
  );

  useEffect(() => {
    if (!isAuthed || !adminKey || isLoginRoute) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await apiAdminFetchNoTenant('/admin/tenants', adminKey);
        const items = data?.items || [];
        if (!cancelled) setTenants(items);
        if (!cancelled && items.length) {
          const current = sessionStorage.getItem('dm_tenant_slug') || 'default';
          if (!items.some((row) => row.slug === current)) {
            setTenantSlug(items[0].slug);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed, adminKey, isLoginRoute, setTenantSlug]);

  async function handleLogout() {
    const result = await Swal.fire({
      icon: 'warning',
      title: t('admin.logoutConfirmTitle'),
      text: t('admin.logoutConfirmText'),
      showCancelButton: true,
      confirmButtonText: t('admin.logoutConfirm'),
      cancelButtonText: t('admin.logoutCancel'),
      confirmButtonColor: '#dc2626',
    });
    if (!result.isConfirmed) return;
    logout();
    navigate('/admin/login', { replace: true });
  }

  if (!isAuthed && !isLoginRoute) return <Navigate to="/admin/login" replace />;

  if (!isAuthed) return <Outlet />;

  return (
    <div className="admin">
      <header className="admin-shell-header">
        <nav className="admin-nav">
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/dashboard">
            {t('admin.nav.dashboard')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/reports/pending-orders">
            {t('admin.nav.pending')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/orders">
            {t('admin.nav.orders')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/invoices">
            {t('admin.nav.invoices')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/schedules">
            {t('admin.nav.schedules')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/routing">
            {t('admin.nav.routing')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/products">
            {t('admin.nav.products')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/attributes">
            {t('admin.nav.attributes')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/categories">
            {t('admin.nav.categories')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/shopify">
            {t('admin.nav.shopify')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/modules">
            {t('admin.nav.modules')}
          </NavLink>
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin/shipping">
            {t('admin.nav.shipping')}
          </NavLink>
        </nav>
        <div className="admin-shell-actions">
          <label className="admin-lang-select">
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
          {tenants.length > 0 && (
            <label className="admin-tenant-select">
              <span className="admin-tenant-label">{t('admin.tenant')}</span>
              <select
                className="admin-input admin-tenant-input"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                aria-label={t('admin.tenantAria')}
              >
                {tenants.map((row) => (
                  <option key={row.id} value={row.slug}>
                    {row.name} ({row.slug})
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="admin-logout" type="button" onClick={handleLogout}>
            {t('admin.logout')}
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
